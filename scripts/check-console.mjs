import { chromium } from 'playwright';

async function checkConsole() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const messages = [];
  page.on('console', msg => {
    messages.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });
  page.on('pageerror', err => {
    messages.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Switch tabs
  const tabs = ['Budget & Sliders', 'Timeline & Gantt', 'Vendor Pipeline', 'Creative Ideas', 'Planning Copilot', 'Scenario Compare'];
  for (const tab of tabs) {
    const btn = page.getByRole('button', { name: tab });
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  }

  console.log('Total console entries:', messages.length);
  const warningsAndErrors = messages.filter(m => m.type === 'warn' || m.type === 'error' || m.type === 'pageerror');
  console.log('Warnings and Errors:', JSON.stringify(warningsAndErrors, null, 2));

  await browser.close();
}

checkConsole().catch(console.error);

