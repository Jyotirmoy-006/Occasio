import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 640 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const THEMES = ['wedding', 'birthday', 'community'];

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Capturing visual review screenshots (saved in gitignored screenshots/ folder)...');

  for (const theme of THEMES) {
    for (const vp of VIEWPORTS) {
      for (const decMode of ['rich', 'reduced']) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');

        // Set the theme and decoration attributes
        await page.evaluate(({ t, d }) => {
          document.documentElement.setAttribute('data-event-theme', t);
          document.documentElement.setAttribute('data-event', t);
          document.documentElement.setAttribute('data-reduce-decoration', d === 'reduced' ? 'true' : 'false');
        }, { t: theme, d: decMode });

        await page.waitForTimeout(300);

        const filename = path.join(SCREENSHOT_DIR, `${theme}-${decMode}-${vp.name}-${vp.width}.png`);
        await page.screenshot({ path: filename, fullPage: false });
        console.log(`Saved: ${filename}`);
      }
    }
  }

  await browser.close();
  console.log('Visual review screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Visual capture error:', err);
  process.exit(1);
});

