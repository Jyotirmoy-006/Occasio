import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('demo-out', 'recordings-v2');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Clean previous recordings in directory
for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.webm')) {
    try { fs.unlinkSync(path.join(OUT_DIR, file)); } catch (_) {}
  }
}

async function recordFullDemoV2() {
  console.log('Starting full 16-scene Occasio demo recording (1920x1080, calibrated to ~167s)...');

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

  async function smoothMove(targetX, targetY, durationMs = 300) {
    const steps = Math.max(8, Math.floor(durationMs / 16));
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
      await page.evaluate(({ x, y }) => window.__moveVirtualCursor?.(x, y), { x: curX, y: curY });
      await page.waitForTimeout(16);
    }
    await page.evaluate(({ x, y }) => window.__moveVirtualCursor?.(x, y), { x: targetX, y: targetY });
  }

  async function smoothClick(locatorOrX, yOrMs = 200, maybeMs = 200) {
    let targetX = 960;
    let targetY = 540;
    let dur = 200;

    if (typeof locatorOrX === 'number') {
      targetX = locatorOrX;
      targetY = yOrMs;
      dur = maybeMs;
      await smoothMove(targetX, targetY, dur);
      await page.evaluate(({ x, y }) => window.__animateVirtualClick?.(x, y), { x: targetX, y: targetY });
      await page.mouse.click(targetX, targetY);
    } else {
      const box = await locatorOrX.boundingBox();
      if (box) {
        targetX = box.x + box.width / 2;
        targetY = box.y + box.height / 2;
        dur = typeof yOrMs === 'number' ? yOrMs : 200;
        await smoothMove(targetX, targetY, dur);
        await page.evaluate(({ x, y }) => window.__animateVirtualClick?.(x, y), { x: targetX, y: targetY });
        await locatorOrX.click();
      }
    }
  }

  const startTime = Date.now();
  const sceneTimes = [];

  function recordScene(id, sStart, sEnd) {
    const dur = sEnd - sStart;
    sceneTimes.push({ id, start: sStart, end: sEnd, duration: dur });
    console.log(`  [${id}] ${sStart.toFixed(2)}s -> ${sEnd.toFixed(2)}s (${dur.toFixed(2)}s)`);
  }

  // -------------------------------------------------------------
  // S0: Cold Open (~8.5 s)
  // Continuous tab choreography locked to voiceover phrases
  // -------------------------------------------------------------
  console.log('Recording S0: Cold Open (Continuous tab choreography)...');
  const s0Start = (Date.now() - startTime) / 1000;
  const s0Path = 'file:///' + path.resolve('public', 'demo-s0-cold-open.html').replace(/\\/g, '/');
  await page.goto(s0Path);
  await page.waitForTimeout(200);

  await smoothMove(960, 480, 400);
  await page.waitForTimeout(1400); // 1.8s: "A budget spreadsheet"
  await smoothMove(680, 440, 350); // Near checklist (2.8s)
  await page.waitForTimeout(1000); // 3.8s: "a thread of vendor emails"
  await smoothMove(1100, 440, 350); // Near deadline
  await page.waitForTimeout(1200); // 5.0s: "and a deadline you forgot"
  await smoothMove(960, 480, 400); // Monogram center
  await page.waitForTimeout(2600); // Convergence + wax seal ring ripple

  const s0End = (Date.now() - startTime) / 1000;
  recordScene('S0', s0Start, s0End);

  // -------------------------------------------------------------
  // S1: Title Card (~12.0 s)
  // Cursor touches Budget, Timeline, Vendors, Ideas, then clicks CTA
  // -------------------------------------------------------------
  console.log('Recording S1: Title Card...');
  const s1Start = (Date.now() - startTime) / 1000;
  const titlePath = 'file:///' + path.resolve('public', 'demo-title.html').replace(/\\/g, '/');
  await page.goto(titlePath);
  await page.waitForTimeout(300);

  // 0.0s - 1.8s: "This is Occasio."
  await smoothMove(960, 380, 500);
  await page.waitForTimeout(1600);

  // 1.8s - 4.2s: "It's a planning assistant for weddings, birthdays and community events."
  await smoothMove(960, 520, 500);
  await page.waitForTimeout(2200);

  // 4.2s: "...Budget..."
  await smoothMove(410, 680, 350);
  await page.evaluate(() => document.getElementById('pillar-budget')?.classList.add('pill-highlight'));
  await page.waitForTimeout(1000);

  // 5.4s: "...timeline..."
  await smoothMove(590, 680, 350);
  await page.evaluate(() => {
    document.getElementById('pillar-budget')?.classList.remove('pill-highlight');
    document.getElementById('pillar-timeline')?.classList.add('pill-highlight');
  });
  await page.waitForTimeout(1000);

  // 6.5s: "...vendors..."
  await smoothMove(760, 680, 350);
  await page.evaluate(() => {
    document.getElementById('pillar-timeline')?.classList.remove('pill-highlight');
    document.getElementById('pillar-vendors')?.classList.add('pill-highlight');
  });
  await page.waitForTimeout(1000);

  // 7.6s: "...and ideas..."
  await smoothMove(910, 680, 350);
  await page.evaluate(() => {
    document.getElementById('pillar-vendors')?.classList.remove('pill-highlight');
    document.getElementById('pillar-ideas')?.classList.add('pill-highlight');
  });
  await page.waitForTimeout(1200);

  // 8.8s: "...Let's plan a wedding" -> click CTA button
  const ctaBtn = page.locator('#title-cta-btn');
  await smoothClick(ctaBtn, 350);
  await page.waitForTimeout(1200);

  const s1End = (Date.now() - startTime) / 1000;
  recordScene('S1', s1Start, s1End);

  // -------------------------------------------------------------
  // S2: Welcome & Wizard (~11.5 s)
  // Type 120 guests, $35k budget, hover donut segments in sync
  // -------------------------------------------------------------
  console.log('Recording S2: Welcome & Wizard...');
  const s2Start = (Date.now() - startTime) / 1000;
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(200);

  // Open wizard
  const newPlanBtn = page.getByRole('button', { name: 'New Plan Wizard' });
  await smoothClick(newPlanBtn, 180);
  await page.waitForTimeout(80);

  const startWizard = page.getByRole('button', { name: 'Start New Plan Wizard' });
  await smoothClick(startWizard, 180);
  await page.waitForTimeout(80);

  // Step 1: Event Name
  const nameField = page.locator('#field-event-name');
  await smoothClick(nameField, 160);
  await nameField.fill('');
  await nameField.pressSequentially('Elena & Marcus Wedding', { delay: 10 });

  const next1 = page.getByRole('button', { name: 'Next' });
  await smoothClick(next1, 160);
  await page.waitForTimeout(80);

  // Step 2: Date, Guests, City
  await page.locator('#field-event-date').fill('2027-06-18');
  await page.locator('#field-guest-count').fill('120');
  await page.locator('#field-city').fill('San Francisco, CA');

  const next2 = page.getByRole('button', { name: 'Next' });
  await smoothClick(next2, 160);
  await page.waitForTimeout(100);

  // Step 3: Budget & Donut preview
  // Voice says: "A hundred and twenty guests, thirty-five thousand dollars..."
  const budgetField = page.locator('#field-budget');
  await smoothClick(budgetField, 180);
  await budgetField.fill('35,000');
  await page.waitForTimeout(1000);

  // Voice says: "As you type, you can already see how the money gets split..."
  const donutSvg = page.locator('svg[aria-label*="chart"], svg').filter({ has: page.locator('path') }).first();
  if (await donutSvg.isVisible()) {
    const dBox = await donutSvg.boundingBox();
    if (dBox) {
      await smoothMove(dBox.x + dBox.width * 0.4, dBox.y + dBox.height * 0.35, 350);
      await page.waitForTimeout(1200);
      await smoothMove(dBox.x + dBox.width * 0.65, dBox.y + dBox.height * 0.5, 350);
      await page.waitForTimeout(1200);
    }
  }

  // Voice says: "No AI yet. Just math."
  await page.waitForTimeout(1800);

  const s2End = (Date.now() - startTime) / 1000;
  recordScene('S2', s2Start, s2End);

  // -------------------------------------------------------------
  // S3: Gemini Live Generation (~13.5 s)
  // Expand disclosure, click Generate Plan, wait for real Gemini, hover pill
  // -------------------------------------------------------------
  console.log('Recording S3: Gemini Live Generation...');
  const s3Start = (Date.now() - startTime) / 1000;

  // Next to Step 4
  const next3 = page.getByRole('button', { name: 'Next' });
  await smoothClick(next3, 180);
  await page.waitForTimeout(200);

  // Expand "Exactly what is sent" disclosure
  const privacyBtn = page.getByRole('button', { name: 'Exactly what is sent' });
  if (await privacyBtn.isVisible()) {
    await smoothClick(privacyBtn, 180);
    await page.waitForTimeout(1600);
  }

  // Click Generate Plan
  const genBtn = page.getByRole('button', { name: 'Generate Plan' });
  await smoothClick(genBtn, 200);

  // Wait for real Gemini generation modal to detach
  console.log('  Waiting for live Gemini response...');
  await page.locator('div[role="dialog"]').waitFor({ state: 'detached', timeout: 35000 });
  await page.waitForTimeout(600);

  // Hover over the header status pill (AI live) and provenance badge
  const statusPill = page.locator('header').getByRole('button').filter({ hasText: /AI live/i });
  if (await statusPill.isVisible()) {
    const box = await statusPill.boundingBox();
    if (box) {
      await smoothMove(box.x + box.width / 2, box.y + box.height / 2, 350);
      await page.waitForTimeout(3800);
    }
  } else {
    await page.waitForTimeout(3800);
  }

  const s3End = (Date.now() - startTime) / 1000;
  recordScene('S3', s3Start, s3End);

  // -------------------------------------------------------------
  // S3b: Demo Mode Fallback (~8.5 s)
  // Popover opens on port 3001, click "Check again", close popover
  // -------------------------------------------------------------
  console.log('Recording S3b: Demo Mode Fallback on port 3001...');
  const s3bStart = (Date.now() - startTime) / 1000;
  await page.goto('http://localhost:3001/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(400);

  const demoPill = page.locator('header').getByRole('button').filter({ hasText: /Demo mode/i });
  await demoPill.waitFor({ state: 'visible', timeout: 8000 });
  await smoothClick(demoPill, 280);
  await page.waitForTimeout(2500); // Show accessible popover

  // Click "Check again"
  const checkBtn = page.getByRole('button', { name: /check again/i });
  if (await checkBtn.isVisible()) {
    await smoothClick(checkBtn, 240);
    await page.waitForTimeout(2200);
  }

  // Close popover
  await page.mouse.click(960, 500);
  await page.waitForTimeout(1200);

  const s3bEnd = (Date.now() - startTime) / 1000;
  recordScene('S3b', s3bStart, s3bEnd);

  // -------------------------------------------------------------
  // S4: Event Overview & Milestones (~8.5 s)
  // Sweep medallion, check milestones, undo toast
  // -------------------------------------------------------------
  console.log('Recording S4: Event Overview & Milestones...');
  const s4Start = (Date.now() - startTime) / 1000;
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(400);

  // Sweep across countdown medallion
  await smoothMove(960, 260, 350);
  await page.waitForTimeout(1400);

  // Tick off two urgent milestones
  const milestoneButtons = page.locator('button[aria-label*="as complete"]');
  if (await milestoneButtons.count() >= 2) {
    const mb1 = milestoneButtons.nth(0);
    await smoothClick(mb1, 220);
    await page.waitForTimeout(800);
    const mb2 = milestoneButtons.nth(1);
    await smoothClick(mb2, 220);
    await page.waitForTimeout(900);
  }

  // Show undo toast notification and click Undo
  const undoToast = page.getByRole('button', { name: /Undo/i }).last();
  if (await undoToast.isVisible()) {
    await smoothClick(undoToast, 240);
    await page.waitForTimeout(2000);
  } else {
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(1000);

  const s4End = (Date.now() - startTime) / 1000;
  recordScene('S4', s4Start, s4End);

  // -------------------------------------------------------------
  // S5: Budget Dynamic Rebalancing (~9.5 s)
  // Drag venue slider, drag catering slider, toggle accessible table
  // -------------------------------------------------------------
  console.log('Recording S5: Budget Dynamic Rebalancing...');
  const s5Start = (Date.now() - startTime) / 1000;

  const budgetNav = page.locator('nav').getByRole('button', { name: /Budget & Sliders/i });
  await smoothClick(budgetNav, 220);
  await page.waitForTimeout(500);

  // Drag first slider (Venue)
  const sliders = page.locator('input[type="range"]');
  if (await sliders.count() >= 2) {
    const slider1 = sliders.nth(0);
    const box1 = await slider1.boundingBox();
    if (box1) {
      await smoothMove(box1.x + box1.width * 0.4, box1.y + box1.height / 2, 250);
      await page.mouse.down();
      await smoothMove(box1.x + box1.width * 0.65, box1.y + box1.height / 2, 450);
      await page.mouse.up();
      await page.waitForTimeout(1200);
    }

    // Drag second slider (Catering)
    const slider2 = sliders.nth(1);
    const box2 = await slider2.boundingBox();
    if (box2) {
      await smoothMove(box2.x + box2.width * 0.3, box2.y + box2.height / 2, 250);
      await page.mouse.down();
      await smoothMove(box2.x + box2.width * 0.52, box2.y + box2.height / 2, 450);
      await page.mouse.up();
      await page.waitForTimeout(1200);
    }
  }

  // Toggle Accessible Table View button: "Show Data Table"
  const tableToggle = page.getByRole('button', { name: /Show Data Table/i });
  if (await tableToggle.isVisible()) {
    await smoothClick(tableToggle, 240);
    await page.waitForTimeout(2500);
  } else {
    await page.waitForTimeout(2500);
  }

  const s5End = (Date.now() - startTime) / 1000;
  recordScene('S5', s5Start, s5End);

  // -------------------------------------------------------------
  // S6: Timeline & Backward Scheduling (~9.0 s)
  // Step milestone +7d, switch to Gantt chart, sweep horizontal bars
  // -------------------------------------------------------------
  console.log('Recording S6: Timeline & Backward Scheduling...');
  const s6Start = (Date.now() - startTime) / 1000;

  const timelineNav = page.locator('nav').getByRole('button', { name: /Timeline & Gantt/i });
  await smoothClick(timelineNav, 220);
  await page.waitForTimeout(500);

  // Click weekly shift button on milestone
  const shiftButtons = page.locator('button[aria-label*="1 week"]');
  if (await shiftButtons.count() > 0) {
    await smoothClick(shiftButtons.first(), 220);
    await page.waitForTimeout(1000);
  }

  // Toggle Gantt chart view
  const ganttBtn = page.getByRole('button', { name: 'Gantt chart view' });
  if (await ganttBtn.isVisible()) {
    await smoothClick(ganttBtn, 240);
    await page.waitForTimeout(600);
    // Sweep cursor across horizontal Gantt bars
    await smoothMove(750, 480, 400);
    await page.waitForTimeout(1600);
    await smoothMove(1150, 480, 400);
    await page.waitForTimeout(1800);
  }

  const s6End = (Date.now() - startTime) / 1000;
  recordScene('S6', s6Start, s6End);

  // -------------------------------------------------------------
  // S6b: Vendor Pipeline & Questions (~10.0 s)
  // Expand questions, change stage to Quoted, enter quote amount
  // -------------------------------------------------------------
  console.log('Recording S6b: Vendor Pipeline & Questions...');
  const s6bStart = (Date.now() - startTime) / 1000;

  const checklistNav = page.locator('nav').getByRole('button', { name: /Vendor Pipeline/i });
  await smoothClick(checklistNav, 220);
  await page.waitForTimeout(500);

  // Expand "Show questions"
  const showQBtn = page.locator('button[aria-label*="questions"]').first();
  if (await showQBtn.isVisible()) {
    await smoothClick(showQBtn, 240);
    await page.waitForTimeout(1600);
  }

  // Change stage to Quoted
  const stageSelect = page.locator('select').first();
  if (await stageSelect.isVisible()) {
    await stageSelect.selectOption('quoted');
    await page.waitForTimeout(1000);
  }

  // Type quote amount
  const quoteInput = page.locator('input[placeholder="0.00"]').first();
  if (await quoteInput.isVisible()) {
    await smoothClick(quoteInput, 200);
    await quoteInput.fill('4800');
    // Click outside to trigger onBlur commit
    await page.mouse.click(960, 500);
    await page.waitForTimeout(2800); // Show spend ledger update
  }
  await page.waitForTimeout(1200);

  const s6bEnd = (Date.now() - startTime) / 1000;
  recordScene('S6b', s6bStart, s6bEnd);

  // -------------------------------------------------------------
  // S7: Creative Ideas & Regeneration (~11.0 s)
  // Contrast swatches, dietary chip, regenerate theme, pin theme
  // -------------------------------------------------------------
  console.log('Recording S7: Creative Ideas & Regeneration...');
  const s7Start = (Date.now() - startTime) / 1000;

  const ideasNav = page.locator('nav').getByRole('button', { name: /Creative Ideas/i });
  await smoothClick(ideasNav, 220);
  await page.waitForTimeout(500);

  // Hover contrast swatches
  await smoothMove(600, 380, 400);
  await page.waitForTimeout(1200);
  await smoothMove(800, 380, 400);
  await page.waitForTimeout(1200);

  // Regenerate theme idea
  const regenBtn = page.locator('button[title*="Regenerate this theme"]').first();
  if (await regenBtn.isVisible()) {
    await smoothClick(regenBtn, 250);
    await page.waitForTimeout(2400); // Show content refresh
  }

  // Pin theme
  const pinBtn = page.getByRole('button', { name: /Pin/i }).first();
  if (await pinBtn.isVisible()) {
    await smoothClick(pinBtn, 240);
    await page.waitForTimeout(2600);
  }

  const s7End = (Date.now() - startTime) / 1000;
  recordScene('S7', s7Start, s7End);

  // -------------------------------------------------------------
  // S8: Planning Copilot & Diff (~11.5 s)
  // Suggestion chip, inspect diff, click confirm, press Ctrl+Z
  // -------------------------------------------------------------
  console.log('Recording S8: Planning Copilot & Diff...');
  const s8Start = (Date.now() - startTime) / 1000;

  const copilotNav = page.locator('nav').getByRole('button', { name: /Planning Copilot/i });
  await smoothClick(copilotNav, 220);
  await page.waitForTimeout(500);

  const quickBtn = page.getByRole('button', { name: /Cut total budget by 10%/i }).first();
  if (await quickBtn.isVisible()) {
    await smoothClick(quickBtn, 220);
  } else {
    const copilotInput = page.locator('input[aria-label="Ask Copilot to adjust your plan"]');
    await smoothClick(copilotInput, 180);
    await copilotInput.fill('Cut total budget by 10%');
    await copilotInput.press('Enter');
  }

  // Wait for proposed diff card
  await page.waitForSelector('[role="region"][aria-label="Proposed Plan Diff"]', { timeout: 15000 });
  await page.waitForTimeout(2400); // Showcase diff table

  // Click Confirm Changes
  const confirmBtn = page.getByRole('button', { name: /Confirm Changes/i });
  if (await confirmBtn.isVisible()) {
    await smoothClick(confirmBtn, 240);
    await page.waitForTimeout(1500);
  }

  // Undo via Ctrl+Z
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(2200);

  const s8End = (Date.now() - startTime) / 1000;
  recordScene('S8', s8Start, s8End);

  // -------------------------------------------------------------
  // S9: Scenario Compare (~9.0 s)
  // Create alternative scenario, drag guest slider to 70
  // -------------------------------------------------------------
  console.log('Recording S9: Scenario Compare...');
  const s9Start = (Date.now() - startTime) / 1000;

  const compareNav = page.locator('nav').getByRole('button', { name: /Scenario Compare/i });
  await smoothClick(compareNav, 220);
  await page.waitForTimeout(500);

  const createScenarioBtn = page.getByRole('button', { name: /Create Alternative Scenario/i });
  if (await createScenarioBtn.isVisible()) {
    await smoothClick(createScenarioBtn, 240);
    await page.waitForTimeout(1000);
  }

  const guestSlider = page.locator('input[aria-label="Adjust scenario guest count"]');
  if (await guestSlider.isVisible()) {
    const gBox = await guestSlider.boundingBox();
    if (gBox) {
      await smoothMove(gBox.x + gBox.width * 0.35, gBox.y + gBox.height / 2, 250);
      await page.mouse.down();
      await smoothMove(gBox.x + gBox.width * 0.18, gBox.y + gBox.height / 2, 450);
      await page.mouse.up();
      await page.waitForTimeout(3000); // Showcase side-by-side variance delta
    }
  }
  await page.waitForTimeout(1000);

  const s9End = (Date.now() - startTime) / 1000;
  recordScene('S9', s9Start, s9End);

  // -------------------------------------------------------------
  // S10: Export & Portability (~9.5 s)
  // Rapid glide across PDF, CSV, ICS, JSON backup
  // -------------------------------------------------------------
  console.log('Recording S10: Export & Portability...');
  const s10Start = (Date.now() - startTime) / 1000;

  const exportBtn = page.locator('header').getByRole('button', { name: 'Export plan' });
  await smoothClick(exportBtn, 220);
  await page.waitForTimeout(500);

  await smoothMove(960, 420, 280); // Print PDF
  await page.waitForTimeout(900);
  await smoothMove(960, 490, 240); // Budget CSV
  await page.waitForTimeout(900);
  await smoothMove(960, 610, 240); // Calendar .ICS
  await page.waitForTimeout(900);
  await smoothMove(960, 680, 240); // JSON Backup
  await page.waitForTimeout(2000);

  const closeExport = page.getByRole('button', { name: /Close export dialog/i });
  if (await closeExport.isVisible()) {
    await smoothClick(closeExport, 200);
    await page.waitForTimeout(600);
  }

  const s10End = (Date.now() - startTime) / 1000;
  recordScene('S10', s10Start, s10End);

  // -------------------------------------------------------------
  // S11: Themes & Accessibility (~13.5 s)
  // Ctrl+K palette, cycle to Birthday, toggle Minimal
  // -------------------------------------------------------------
  console.log('Recording S11: Themes & Accessibility...');
  const s11Start = (Date.now() - startTime) / 1000;

  // Open Keyboard Shortcuts Guide via Ctrl+K
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(2200);

  // Close dialog via Esc
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Switch theme to Birthday Sample
  const newPlanTheme = page.locator('header').getByRole('button', { name: 'New Plan Wizard' });
  await smoothClick(newPlanTheme, 220);
  await page.waitForTimeout(500);

  const birthdaySample = page.getByRole('button', { name: /Milestone Fortieth/i }).first();
  if (await birthdaySample.isVisible()) {
    await smoothClick(birthdaySample, 250);
    await page.waitForTimeout(3200); // Terracotta warm theme transition
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Toggle Decoration: Minimal in sidebar footer
  const decorBtn = page.locator('aside button[aria-pressed]');
  if (await decorBtn.isVisible()) {
    await smoothClick(decorBtn, 240);
    await page.waitForTimeout(3500); // Show clean, flat minimal mode
  } else {
    await page.waitForTimeout(3500);
  }

  const s11End = (Date.now() - startTime) / 1000;
  recordScene('S11', s11Start, s11End);

  // -------------------------------------------------------------
  // S12: Quality Scorecard (~10.5 s)
  // Verified build facts, dynamic cursor tour
  // -------------------------------------------------------------
  console.log('Recording S12: Quality Scorecard...');
  const s12Start = (Date.now() - startTime) / 1000;
  const s12Path = 'file:///' + path.resolve('public', 'demo-s12-scorecard.html').replace(/\\/g, '/');
  await page.goto(s12Path);
  await page.waitForTimeout(500);

  await smoothMove(580, 480, 450); // Tests badge
  await page.waitForTimeout(2000);
  await smoothMove(960, 480, 450); // Axe-core badge
  await page.waitForTimeout(2000);
  await smoothMove(1340, 480, 450); // Repo size & security
  await page.waitForTimeout(3000);

  const s12End = (Date.now() - startTime) / 1000;
  recordScene('S12', s12Start, s12End);

  // -------------------------------------------------------------
  // S13: Closing Card (~11.5 s)
  // Monogram seal, repo link, tech stack badges, smooth fade out
  // -------------------------------------------------------------
  console.log('Recording S13: Closing Card...');
  const s13Start = (Date.now() - startTime) / 1000;
  const s13Path = 'file:///' + path.resolve('public', 'demo-s13-closing.html').replace(/\\/g, '/');
  await page.goto(s13Path);
  await page.waitForTimeout(500);

  await smoothMove(960, 420, 450); // Monogram
  await page.waitForTimeout(2200);
  await smoothMove(960, 560, 450); // Hover repo box
  await page.waitForTimeout(2800);
  await smoothMove(960, 680, 450); // Hover badges
  await page.waitForTimeout(3200);

  const s13End = (Date.now() - startTime) / 1000;
  recordScene('S13', s13Start, s13End);

  // -------------------------------------------------------------
  // Teardown & Save Timing Manifest
  // -------------------------------------------------------------
  console.log('Closing Playwright session and finalizing video recording...');
  await page.close();
  await context.close();
  await browser.close();

  const totalVideoDuration = (Date.now() - startTime) / 1000;
  console.log(`\nRecording Complete! Total duration: ${totalVideoDuration.toFixed(2)}s (${Math.floor(totalVideoDuration / 60)}m ${(totalVideoDuration % 60).toFixed(1)}s)`);

  const manifestPath = path.resolve('demo-out', 'scene-times-v2.json');
  fs.writeFileSync(manifestPath, JSON.stringify(sceneTimes, null, 2), 'utf-8');
  console.log(`Saved scene timings to ${manifestPath}`);
}

recordFullDemoV2().catch((err) => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
