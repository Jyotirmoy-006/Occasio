import { chromium } from 'playwright';
import sharp from 'sharp';

function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
}

function srgbToLinear(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export async function checkRouteContrast(page, label) {
  const elements = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, button, label, td, th'));
    return candidates
      .filter((el) => {
        if (el.children.length > 0 && Array.from(el.children).some((c) => c.textContent.trim().length > 0)) {
          return false;
        }
        const text = el.textContent ? el.textContent.trim() : '';
        if (text.length === 0) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 4 || rect.height <= 4) return false;
        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
        return true;
      })
      .map((el) => {
        const rect = el.getBoundingClientRect();
        const cs = window.getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 35),
          rect: {
            left: Math.max(0, Math.round(rect.left)),
            top: Math.max(0, Math.round(rect.top)),
            width: Math.min(window.innerWidth - Math.max(0, Math.round(rect.left)), Math.round(rect.width)),
            height: Math.min(window.innerHeight - Math.max(0, Math.round(rect.top)), Math.round(rect.height)),
          },
          color: cs.color,
          fontSize: parseFloat(cs.fontSize),
          fontWeight: cs.fontWeight,
        };
      })
      .filter((e) => e.rect.width > 2 && e.rect.height > 2 && e.rect.top >= 0 && e.rect.left >= 0);
  });

  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'hide-text-style';
    style.innerHTML = '* { color: transparent !important; text-shadow: none !important; }';
    document.head.appendChild(style);
  });

  const fullBuffer = await page.screenshot({ fullPage: false });
  await page.evaluate(() => document.getElementById('hide-text-style')?.remove());

  const failures = [];

  for (const el of elements) {
    const fg = parseRgb(el.color);
    if (!fg) continue;
    if (el.rect.left + el.rect.width > 1440 || el.rect.top + el.rect.height > 900) continue;

    const cropped = await sharp(fullBuffer)
      .extract(el.rect)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const rList = [], gList = [], bList = [];
    for (let i = 0; i < cropped.data.length; i += cropped.info.channels) {
      rList.push(cropped.data[i]);
      gList.push(cropped.data[i + 1]);
      bList.push(cropped.data[i + 2]);
    }
    rList.sort((a, b) => a - b);
    gList.sort((a, b) => a - b);
    bList.sort((a, b) => a - b);
    const mid = Math.floor(rList.length / 2);
    const bg = { r: rList[mid], g: gList[mid], b: bList[mid] };

    const ratio = contrastRatio(fg, bg);
    const isLarge =
      el.fontSize >= 24 || (el.fontSize >= 18.5 && (el.fontWeight === 'bold' || parseInt(el.fontWeight) >= 600));
    const threshold = isLarge ? 3.0 : 4.5;

    if (ratio < threshold) {
      failures.push({
        label,
        text: el.text,
        tag: el.tag,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fg: el.color,
        bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
        ratio: Number(ratio.toFixed(2)),
        required: threshold,
      });
    }
  }

  return { checked: elements.length, failures };
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  const themes = ['wedding', 'birthday', 'community'];
  let allFailures = [];

  for (const theme of themes) {
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-event-theme', t);
      document.documentElement.setAttribute('data-event', t);
    }, theme);
    await page.waitForTimeout(300);

    const result = await checkRouteContrast(page, `Theme: ${theme}`);
    console.log(`[${theme}] Checked ${result.checked} elements. Failures: ${result.failures.length}`);
    if (result.failures.length > 0) {
      allFailures.push(...result.failures);
    }
  }

  // Reduce decoration mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-reduce-decoration', 'true');
  });
  await page.waitForTimeout(300);
  const reduceResult = await checkRouteContrast(page, 'Reduce-decoration');
  console.log(`[reduce-decoration] Checked ${reduceResult.checked} elements. Failures: ${reduceResult.failures.length}`);
  if (reduceResult.failures.length > 0) {
    allFailures.push(...reduceResult.failures);
  }

  if (allFailures.length > 0) {
    console.log('\n--- CONTRAST FAILURES FOUND ---');
    console.log(JSON.stringify(allFailures, null, 2));
  } else {
    console.log('\nALL TEXT ELEMENTS PASSED WCAG CONTRAST ON RENDERED PIXELS!');
  }

  await browser.close();
}

main().catch(console.error);

