import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('demo-out', 'test-render');
fs.mkdirSync(OUT_DIR, { recursive: true });

async function runTestRender() {
  console.log('Starting S1-S2 20-second test recording...');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  // Inject virtual cursor & click ripple (CSSOM only, strict CSP compliant)
  await page.addInitScript(() => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-virtual-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '2147483647';
    cursor.style.left = '960px';
    cursor.style.top = '540px';
    cursor.style.transform = 'translate(-2px, -2px)';
    cursor.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 3L19 12L12 14L8 21L4 3Z" fill="#1C1917" stroke="#FAF7F2" stroke-width="2" stroke-linejoin="round"/></svg>';

    const ripple = document.createElement('div');
    ripple.id = 'demo-click-ripple';
    ripple.style.position = 'fixed';
    ripple.style.width = '36px';
    ripple.style.height = '36px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2px solid #D9B65B';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '2147483646';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.opacity = '0';
    ripple.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';

    function attach() {
      if (document.body && !document.getElementById('demo-virtual-cursor')) {
        document.body.appendChild(cursor);
        document.body.appendChild(ripple);
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attach);
    } else {
      attach();
    }

    window.__moveVirtualCursor = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };

    window.__animateVirtualClick = (x, y) => {
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.transform = 'translate(-50%, -50%) scale(0.2)';
      ripple.style.opacity = '1';
      setTimeout(() => {
        ripple.style.transform = 'translate(-50%, -50%) scale(1.6)';
        ripple.style.opacity = '0';
      }, 20);
    };
  });

  async function smoothMove(targetX, targetY, durationMs = 500) {
    const steps = Math.max(10, Math.floor(durationMs / 20));
    const start = await page.evaluate(() => {
      const c = document.getElementById('demo-virtual-cursor');
      return {
        x: parseFloat(c?.style.left || '960'),
        y: parseFloat(c?.style.top || '540'),
      };
    });

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const curX = start.x + (targetX - start.x) * ease;
      const curY = start.y + (targetY - start.y) * ease;
      await page.evaluate(({ x, y }) => window.__moveVirtualCursor(x, y), { x: curX, y: curY });
      await page.mouse.move(curX, curY);
      await new Promise((r) => setTimeout(r, 20));
    }
  }

  async function smoothClick(locator) {
    const box = await locator.boundingBox();
    if (!box) throw new Error('Element not visible for click');
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await smoothMove(targetX, targetY, 450);
    await page.evaluate(({ x, y }) => window.__animateVirtualClick(x, y), { x: targetX, y: targetY });
    await locator.click();
    await page.waitForTimeout(150);
  }

  const startTime = Date.now();
  const sceneTimes = [];

  // ==========================================
  // S1: Title Card (~10.5 s)
  // ==========================================
  console.log('Recording S1: Title Card...');
  const s1Start = (Date.now() - startTime) / 1000;
  const titlePath = 'file:///' + path.resolve('public', 'demo-title.html').replace(/\\/g, '/');
  await page.goto(titlePath);
  await page.waitForTimeout(1500);

  await smoothMove(720, 480, 1000);
  await page.waitForTimeout(2000);
  await smoothMove(960, 950, 1200);
  await page.waitForTimeout(5500);
  const s1End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S1', start: s1Start, end: s1End, duration: s1End - s1Start });
  console.log(`  S1 finished: ${s1End - s1Start}s`);

  // ==========================================
  // S2: Welcome & Wizard (~10.0 s)
  // ==========================================
  console.log('Recording S2: Welcome & Wizard...');
  const s2Start = (Date.now() - startTime) / 1000;
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');

  // If welcome modal or wizard is open
  const startWizardBtn = page.getByRole('button', { name: /Start New Plan Wizard|New Plan/i }).first();
  if (await startWizardBtn.isVisible()) {
    await smoothClick(startWizardBtn);
    await page.waitForTimeout(600);
  }

  // Type event name
  const nameInput = page.getByLabel(/Event Name|Name of your celebration/i).first();
  if (await nameInput.isVisible()) {
    await smoothClick(nameInput);
    await nameInput.fill('');
    await nameInput.pressSequentially('The Eleanor & Julian Wedding', { delay: 45 });
  }

  // City
  const cityInput = page.getByLabel(/City|Location/i).first();
  if (await cityInput.isVisible()) {
    await smoothClick(cityInput);
    await cityInput.fill('');
    await cityInput.pressSequentially('San Francisco, CA', { delay: 45 });
  }

  // Move down to next step or preview
  await page.waitForTimeout(2500);
  const s2End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S2', start: s2Start, end: s2End, duration: s2End - s2Start });
  console.log(`  S2 finished: ${s2End - s2Start}s`);

  // Close context to save video
  await page.close();
  await context.close();
  await browser.close();

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`Test recording completed in ${totalTime.toFixed(2)}s`);
  fs.writeFileSync(path.join(OUT_DIR, 'test-scene-times.json'), JSON.stringify(sceneTimes, null, 2));

  // Find generated webm
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length > 0) {
    const rawVideo = path.join(OUT_DIR, files[0]);
    console.log(`Raw video saved: ${rawVideo}`);
    return rawVideo;
  }
}

runTestRender().catch(console.error);

