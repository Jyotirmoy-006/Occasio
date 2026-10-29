import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('demo-out', 'recordings');
fs.mkdirSync(OUT_DIR, { recursive: true });
// Clean old recordings
for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.webm')) {
    try { fs.unlinkSync(path.join(OUT_DIR, file)); } catch (_) {}
  }
}

async function recordFullDemo() {
  console.log('Starting full 10-scene Occasio demo recording (1920x1080)...');

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

  async function smoothMove(targetX, targetY, durationMs = 450) {
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
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) throw new Error('Element not visible for click');
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await smoothMove(targetX, targetY, 400);
    await page.evaluate(({ x, y }) => window.__animateVirtualClick(x, y), { x: targetX, y: targetY });
    await locator.click();
    await page.waitForTimeout(150);
  }

  const startTime = Date.now();
  const sceneTimes = [];

  // -------------------------------------------------------------
  // S1: Title Card (~10.5 s)
  // -------------------------------------------------------------
  console.log('Recording S1: Title Card...');
  const s1Start = (Date.now() - startTime) / 1000;
  const titlePath = 'file:///' + path.resolve('public', 'demo-title.html').replace(/\\/g, '/');
  await page.goto(titlePath);
  await page.waitForTimeout(1000);

  await smoothMove(720, 480, 800);
  await page.waitForTimeout(2200);
  await smoothMove(960, 950, 1000);
  await page.waitForTimeout(4000);
  const s1End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S1', start: s1Start, end: s1End, duration: s1End - s1Start });
  console.log(`  S1: ${s1Start.toFixed(2)}s -> ${s1End.toFixed(2)}s (${(s1End - s1Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S2: Welcome & Wizard (~10.0 s)
  // -------------------------------------------------------------
  console.log('Recording S2: Welcome & Wizard...');
  const s2Start = (Date.now() - startTime) / 1000;
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');

  // Open wizard
  const newPlanBtn = page.getByRole('button', { name: 'New Plan' });
  await smoothClick(newPlanBtn);
  await page.waitForTimeout(400);

  const startWizard = page.getByRole('button', { name: 'Start New Plan Wizard' });
  await smoothClick(startWizard);
  await page.waitForTimeout(400);

  // Step 1: Event Name
  const nameField = page.locator('#field-event-name');
  await smoothClick(nameField);
  await nameField.fill('');
  await nameField.pressSequentially('The Eleanor & Julian Wedding', { delay: 20 });

  const next1 = page.getByRole('button', { name: 'Next' });
  await smoothClick(next1);
  await page.waitForTimeout(400);

  // Step 2: Date, Guests, City
  await page.locator('#field-event-date').fill('2027-06-18');
  await page.locator('#field-guest-count').fill('120');
  await page.locator('#field-city').fill('San Francisco, CA');

  const next2 = page.getByRole('button', { name: 'Next' });
  await smoothClick(next2);
  await page.waitForTimeout(400);

  // Step 3: Budget
  await page.locator('#field-budget').fill('35,000');
  await page.waitForTimeout(600);

  const s2End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S2', start: s2Start, end: s2End, duration: s2End - s2Start });
  console.log(`  S2: ${s2Start.toFixed(2)}s -> ${s2End.toFixed(2)}s (${(s2End - s2Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S3: Gemini Live Generation (~11.5 s)
  // -------------------------------------------------------------
  console.log('Recording S3: Gemini Live Generation...');
  const s3Start = (Date.now() - startTime) / 1000;

  // Next to Step 4
  const next3 = page.getByRole('button', { name: 'Next' });
  await smoothClick(next3);
  await page.waitForTimeout(400);

  // Click Generate Plan
  const genBtn = page.getByRole('button', { name: 'Generate Plan' });
  await smoothClick(genBtn);

  // Wait for real Gemini generation (modal closes when plan is ready)
  console.log('  Waiting for live Gemini response...');
  await page.locator('div[role="dialog"]').waitFor({ state: 'detached', timeout: 30000 });
  await page.waitForTimeout(600);

  // Verify new plan loaded
  await page.getByText('The Eleanor & Julian Wedding').first().waitFor({ timeout: 5000 });

  // Hover over AI live pill
  const statusPill = page.locator('header').getByRole('button', { name: /AI live/i }).first();
  if (await statusPill.isVisible()) {
    const box = await statusPill.boundingBox();
    if (box) await smoothMove(box.x + box.width / 2, box.y + box.height / 2, 500);
    await page.waitForTimeout(2500);
  }

  // Hover over Gemini provenance badge on Hero
  const provBadge = page.getByText(/Generated by Gemini/i).first();
  if (await provBadge.isVisible()) {
    const box = await provBadge.boundingBox();
    if (box) await smoothMove(box.x + box.width / 2, box.y + box.height / 2, 500);
    await page.waitForTimeout(3800);
  }

  const s3End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S3', start: s3Start, end: s3End, duration: s3End - s3Start });
  console.log(`  S3: ${s3Start.toFixed(2)}s -> ${s3End.toFixed(2)}s (${(s3End - s3Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S4: Overview & Milestones (~6.5 s)
  // -------------------------------------------------------------
  console.log('Recording S4: Overview & Milestones...');
  const s4Start = (Date.now() - startTime) / 1000;

  // Move over countdown seal
  const countdownSeal = page.getByText(/days to go|Days Remaining/i).first();
  if (await countdownSeal.isVisible()) {
    const box = await countdownSeal.boundingBox();
    if (box) await smoothMove(box.x + box.width / 2, box.y + box.height / 2, 450);
    await page.waitForTimeout(600);
  }

  // Tick off two milestones
  const milestoneBtns = page.locator('button[aria-label^="Mark"]');
  const count = await milestoneBtns.count();
  if (count >= 1) {
    await smoothClick(milestoneBtns.nth(0));
    await page.waitForTimeout(300);
  }
  if (count >= 2) {
    await smoothClick(milestoneBtns.nth(1));
    await page.waitForTimeout(300);
  }

  // Move over undo toast
  const undoToast = page.getByText(/marked as complete|Undo/i).first();
  if (await undoToast.isVisible()) {
    const box = await undoToast.boundingBox();
    if (box) await smoothMove(box.x + box.width / 2, box.y + box.height / 2, 450);
  }

  await page.waitForTimeout(2500);
  const s4End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S4', start: s4Start, end: s4End, duration: s4End - s4Start });
  console.log(`  S4: ${s4Start.toFixed(2)}s -> ${s4End.toFixed(2)}s (${(s4End - s4Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S5: Budget Rebalancing (~7.5 s)
  // -------------------------------------------------------------
  console.log('Recording S5: Budget Rebalancing...');
  const s5Start = (Date.now() - startTime) / 1000;

  const budgetNav = page.getByRole('button', { name: 'Budget & Sliders' });
  await smoothClick(budgetNav);
  await page.waitForTimeout(600);

  // Drag Venue slider
  const rangeInputs = page.locator('input[type="range"]');
  const rangeCount = await rangeInputs.count();
  if (rangeCount > 0) {
    const slider1 = rangeInputs.nth(0);
    const box1 = await slider1.boundingBox();
    if (box1) {
      await smoothMove(box1.x + box1.width / 2, box1.y + box1.height / 2, 400);
      await page.mouse.down();
      await smoothMove(box1.x + box1.width * 0.72, box1.y + box1.height / 2, 500);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  }

  if (rangeCount > 1) {
    const slider2 = rangeInputs.nth(1);
    const box2 = await slider2.boundingBox();
    if (box2) {
      await smoothMove(box2.x + box2.width / 2, box2.y + box2.height / 2, 400);
      await page.mouse.down();
      await smoothMove(box2.x + box2.width * 0.38, box2.y + box2.height / 2, 500);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  }

  await page.waitForTimeout(2000);
  const s5End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S5', start: s5Start, end: s5End, duration: s5End - s5Start });
  console.log(`  S5: ${s5Start.toFixed(2)}s -> ${s5End.toFixed(2)}s (${(s5End - s5Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S6: Timeline & Vendors (~9.0 s)
  // -------------------------------------------------------------
  console.log('Recording S6: Timeline & Vendors...');
  const s6Start = (Date.now() - startTime) / 1000;

  const timelineNav = page.getByRole('button', { name: /Timeline & Gantt/i });
  await smoothClick(timelineNav);
  await page.waitForTimeout(600);

  // Switch to Gantt view
  const ganttBtn = page.getByRole('button', { name: 'Gantt chart view' });
  if (await ganttBtn.isVisible()) {
    await smoothClick(ganttBtn);
    await page.waitForTimeout(1000);
  }

  // Navigate to Vendor Pipeline
  const vendorNav = page.getByRole('button', { name: /Vendor Pipeline/i });
  await smoothClick(vendorNav);
  await page.waitForTimeout(800);

  // Move first vendor to Quoted
  const statusSelect = page.locator('select, [data-testid="vendor-status"]').first();
  if (await statusSelect.isVisible()) {
    await smoothClick(statusSelect);
    await statusSelect.selectOption('quoted');
    await page.waitForTimeout(400);
  }

  // Enter quote
  const quoteInput = page.locator('input[placeholder*="Quote"], input[aria-label*="Quote"]').first();
  if (await quoteInput.isVisible()) {
    await smoothClick(quoteInput);
    await quoteInput.fill('10500');
    await page.waitForTimeout(400);
  }

  await page.waitForTimeout(1800);
  const s6End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S6', start: s6Start, end: s6End, duration: s6End - s6Start });
  console.log(`  S6: ${s6Start.toFixed(2)}s -> ${s6End.toFixed(2)}s (${(s6End - s6Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S7: Creative Ideas (~6.0 s)
  // -------------------------------------------------------------
  console.log('Recording S7: Creative Ideas...');
  const s7Start = (Date.now() - startTime) / 1000;

  const ideasNav = page.getByRole('button', { name: 'Creative Ideas' });
  await smoothClick(ideasNav);
  await page.waitForTimeout(600);

  // Highlight color palette
  const swatchStrip = page.locator('.flex.h-12, .grid-cols-5').first();
  if (await swatchStrip.isVisible()) {
    const box = await swatchStrip.boundingBox();
    if (box) await smoothMove(box.x + box.width / 2, box.y + box.height / 2, 450);
  }

  // Pin first theme
  const pinBtn = page.getByRole('button', { name: /Pin/i }).first();
  if (await pinBtn.isVisible()) {
    await smoothClick(pinBtn);
    await page.waitForTimeout(500);
  }

  await page.waitForTimeout(4600);
  const s7End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S7', start: s7Start, end: s7End, duration: s7End - s7Start });
  console.log(`  S7: ${s7Start.toFixed(2)}s -> ${s7End.toFixed(2)}s (${(s7End - s7Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S8: Planning Copilot (~8.0 s)
  // -------------------------------------------------------------
  console.log('Recording S8: Planning Copilot...');
  const s8Start = (Date.now() - startTime) / 1000;

  const copilotNav = page.getByRole('button', { name: 'Planning Copilot' });
  await smoothClick(copilotNav);
  await page.waitForTimeout(600);

  // Click quick prompt "Cut total budget by 10%"
  const quickPrompt = page.getByRole('button', { name: 'Cut total budget by 10%' }).first();
  if (await quickPrompt.isVisible()) {
    await smoothClick(quickPrompt);
  }

  // Wait for visual diff & Confirm button
  const applyBtn = page.getByRole('button', { name: /Apply Changes|Confirm/i }).first();
  if (await applyBtn.waitFor({ timeout: 15000 }).then(() => true).catch(() => false)) {
    await smoothClick(applyBtn);
    await page.waitForTimeout(600);

    const undoBtn = page.getByRole('button', { name: /Undo/i }).first();
    if (await undoBtn.isVisible()) {
      await smoothClick(undoBtn);
      await page.waitForTimeout(600);
    }
  }

  await page.waitForTimeout(600);
  const s8End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S8', start: s8Start, end: s8End, duration: s8End - s8Start });
  console.log(`  S8: ${s8Start.toFixed(2)}s -> ${s8End.toFixed(2)}s (${(s8End - s8Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S9: Themes & Accessibility (~6.0 s)
  // -------------------------------------------------------------
  console.log('Recording S9: Themes & Accessibility...');
  const s9Start = (Date.now() - startTime) / 1000;

  // Open Command Palette via Ctrl+K
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(600);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Switch Theme to Birthday
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-event-theme', 'birthday');
    document.documentElement.setAttribute('data-event', 'birthday');
  });
  await page.waitForTimeout(1800);

  // Switch Theme to Community
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-event-theme', 'community');
    document.documentElement.setAttribute('data-event', 'community');
  });
  await page.waitForTimeout(2000);

  const s9End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S9', start: s9Start, end: s9End, duration: s9End - s9Start });
  console.log(`  S9: ${s9Start.toFixed(2)}s -> ${s9End.toFixed(2)}s (${(s9End - s9Start).toFixed(2)}s)`);

  // -------------------------------------------------------------
  // S10: Closing Card (~6.5 s)
  // -------------------------------------------------------------
  console.log('Recording S10: Closing Card...');
  const s10Start = (Date.now() - startTime) / 1000;
  const closingPath = 'file:///' + path.resolve('public', 'demo-closing.html').replace(/\\/g, '/');
  await page.goto(closingPath);
  await page.waitForTimeout(1500);

  await smoothMove(960, 500, 1000);
  await page.waitForTimeout(3000);

  const s10End = (Date.now() - startTime) / 1000;
  sceneTimes.push({ id: 'S10', start: s10Start, end: s10End, duration: s10End - s10Start });
  console.log(`  S10: ${s10Start.toFixed(2)}s -> ${s10End.toFixed(2)}s (${(s10End - s10Start).toFixed(2)}s)`);

  // Finish video
  await page.close();
  await context.close();
  await browser.close();

  const totalDuration = (Date.now() - startTime) / 1000;
  console.log(`\nAll 10 scenes recorded successfully! Total video duration: ${totalDuration.toFixed(2)}s`);

  const timesFile = path.resolve('demo-out', 'scene-times.json');
  fs.writeFileSync(timesFile, JSON.stringify(sceneTimes, null, 2));
  console.log(`Scene times saved to ${timesFile}`);

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith('.webm'));
  const rawVideo = path.join(OUT_DIR, files[0]);
  console.log(`Raw video saved: ${rawVideo}`);
  return { rawVideo, sceneTimes };
}

recordFullDemo().catch(console.error);
