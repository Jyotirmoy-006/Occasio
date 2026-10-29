import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console logs and errors
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err.message));

  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  const hero = page.locator('section[aria-label="Event Summary"]');
  const count = await hero.count();
  console.log('Hero count:', count);

  if (count > 0) {
    const info = await hero.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const htmlCs = window.getComputedStyle(document.documentElement);
      const beforeCs = window.getComputedStyle(el, '::before');
      const afterCs = window.getComputedStyle(el, '::after');
      return {
        className: el.className,
        computedBg: cs.backgroundColor,
        computedColor: cs.color,
        heroBgVarRoot: htmlCs.getPropertyValue('--color-hero-bg'),
        htmlTheme: document.documentElement.getAttribute('data-event-theme'),
        beforeBg: beforeCs.backgroundColor,
        beforeDisplay: beforeCs.display,
        afterBg: afterCs.backgroundColor,
        afterDisplay: afterCs.display,
      };
    });
    console.log('Diagnostic info:', JSON.stringify(info, null, 2));

    // Also let's inspect the actual pixels of the hero
    const box = await hero.boundingBox();
    console.log('Hero bounding box:', box);
    
    // Sample canvas to get exact rendered pixel colors
    const pixels = await page.evaluate(async (box) => {
      const el = document.elementFromPoint(box.x + 50, box.y + 50);
      return {
        tag: el ? el.tagName : null,
        className: el ? el.className : null,
        computedBg: el ? window.getComputedStyle(el).backgroundColor : null,
      };
    }, box);
    console.log('Pixel sample point:', pixels);

    const screenshot = await hero.screenshot();
    console.log('Hero screenshot size bytes:', screenshot.length);
  } else {
    console.log('Page content preview:', (await page.content()).slice(0, 500));
  }

  await browser.close();
}

diagnose().catch(console.error);
