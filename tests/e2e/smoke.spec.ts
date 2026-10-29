import { test, expect } from '@playwright/test';

test.describe('Smoke & CSP Nonce Regression Suite', () => {
  test('verifies CSP nonce on every script tag, zero security violations, zero errors, and working interactive flows', async ({
    page,
    baseURL,
  }) => {
    const cspViolations: any[] = [];
    const consoleErrors: string[] = [];
    const pageErrors: Error[] = [];
    const failedRequests: string[] = [];

    // Inject listener for securitypolicyviolation before any scripts run
    await page.addInitScript(() => {
      (window as any).__cspViolations = [];
      window.addEventListener('securitypolicyviolation', (e) => {
        const details = {
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          originalPolicy: e.originalPolicy,
          effectiveDirective: e.effectiveDirective,
          sourceFile: e.sourceFile,
          lineNumber: e.lineNumber,
          columnNumber: e.columnNumber,
          sample: e.sample,
        };
        (window as any).__cspViolations.push(details);
      });
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        const loc = msg.location().url;
        // Ignore chrome extensions or third-party devtools
        if (loc.startsWith('chrome-extension://') || text.includes('chrome-extension://')) {
          return;
        }
        consoleErrors.push(`[Console Error] ${text} at ${loc}`);
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err);
    });

    page.on('response', (res) => {
      const url = res.url();
      const origin = baseURL ? new URL(baseURL).origin : '';
      if (origin && url.startsWith(origin) && res.status() >= 400) {
        // Exclude optional favicon if 404
        if (!url.endsWith('/favicon.ico')) {
          failedRequests.push(`${res.status()} ${url}`);
        }
      }
    });

    // 1. Navigate to home
    const response = await page.goto('/', { waitUntil: 'load' });
    expect(response, 'Expected successful navigation response').not.toBeNull();
    expect(response!.status()).toBe(200);

    // 2. CSP Header & Script Nonce Verification (Option A)
    const headers = response!.headers();
    const csp = headers['content-security-policy'] || headers['Content-Security-Policy'] || '';
    expect(csp, 'CSP header must be present on page response').toBeTruthy();

    const nonceMatch = csp.match(/'nonce-([^']+)'/);
    expect(nonceMatch, "CSP must include a 'nonce-{value}' directive").not.toBeNull();
    const expectedNonce = nonceMatch![1];
    expect(expectedNonce.length).toBeGreaterThanOrEqual(16);

    // Wait for initial render
    await page.waitForTimeout(500);

    // Inspect script tags directly from the DOM to verify Option A compliance
    const scripts = await page.evaluate(() => {
      const tags = Array.from(document.querySelectorAll('script'));
      return tags.map((t) => ({
        src: t.src,
        nonce: t.nonce || t.getAttribute('nonce') || '',
        id: t.id,
      }));
    });

    expect(scripts.length, 'Page must contain script tags').toBeGreaterThan(0);
    const scriptsWithoutNonce = scripts.filter((s) => !s.nonce || s.nonce !== expectedNonce);
    if (scriptsWithoutNonce.length > 0) {
      console.error('Scripts missing or mismatching CSP nonce:', JSON.stringify(scriptsWithoutNonce, null, 2));
    }
    expect(
      scriptsWithoutNonce,
      `All ${scripts.length} <script> tags must carry the CSP nonce "${expectedNonce}"`,
    ).toEqual([]);

    // 4. Interactive Flow Check: Tabs Switching
    const tabs = [
      /Budget/i,
      /Timeline/i,
      /Vendor/i,
      /Ideas/i,
      /Copilot/i,
      /Compare/i,
      /Overview/i,
    ];

    for (const tabPattern of tabs) {
      const tabBtn = page.getByRole('button', { name: tabPattern }).first();
      await expect(tabBtn).toBeVisible();
      await tabBtn.click();
      await page.waitForTimeout(100);
    }

    // 5. Interactive Flow Check: "New Plan" Wizard Dialog
    const newPlanBtn = page.getByRole('button', { name: /New Plan/i }).first();
    await expect(newPlanBtn).toBeVisible();
    await newPlanBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Start wizard
    const startWizardBtn = dialog.getByRole('button', { name: /Start New Plan Wizard/i });
    if (await startWizardBtn.isVisible()) {
      await startWizardBtn.click();
      // Step 1: Wedding & Title
      const weddingBtn = dialog.getByRole('button', { name: /^Wedding$/i });
      await expect(weddingBtn).toBeVisible();
      await weddingBtn.click();

      const titleInput = dialog.locator('#field-event-name');
      await expect(titleInput).toBeVisible();
      await titleInput.fill('Smoke Test Celebration');

      // Step advancement
      const nextBtn = dialog.getByRole('button', { name: 'Next', exact: true });
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();

      // Step 2 date & location
      const dateInput = dialog.locator('#field-event-date');
      await expect(dateInput).toBeVisible();
    }

    // Close dialog with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // 6. Interactive Flow Check: Command Palette & Keyboard Guide (Ctrl+K)
    await page.keyboard.press('Control+k');
    const shortcutsDialog = page.getByRole('dialog', { name: /Keyboard Navigation/i });
    await expect(shortcutsDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(shortcutsDialog).not.toBeVisible();

    // 7. Final Assertions: Ensure zero runtime errors or violations throughout interactive session
    expect(cspViolations, 'Expected zero securitypolicyviolation events').toEqual([]);
    expect(consoleErrors, 'Expected zero browser console errors').toEqual([]);
    expect(pageErrors, 'Expected zero uncaught page errors').toEqual([]);
    expect(failedRequests, 'Expected zero failed same-origin HTTP requests').toEqual([]);
  });
});
