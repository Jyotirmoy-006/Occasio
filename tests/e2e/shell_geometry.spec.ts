import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const VIEWPORT_WIDTHS = [1440, 1024, 768, 360];

test.describe('A1 & G: Shell Geometry & Non-Collision Tests', () => {
  for (const width of VIEWPORT_WIDTHS) {
    test(`asserts no sibling elements intersect in shell at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check header and sidebar siblings or container children
      const intersections = await page.evaluate(() => {
        const issues: string[] = [];

        function checkSiblings(parent: Element) {
          const children = Array.from(parent.children).filter((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.position !== 'fixed';
          });

          for (let i = 0; i < children.length; i++) {
            for (let j = i + 1; j < children.length; j++) {
              const el1 = children[i];
              const el2 = children[j];
              const r1 = el1.getBoundingClientRect();
              const r2 = el2.getBoundingClientRect();

              // Only check visible elements with actual area
              if (r1.width > 0 && r1.height > 0 && r2.width > 0 && r2.height > 0) {
                // Determine if bounding boxes strictly intersect
                const intersects = !(
                  r2.left >= r1.right - 1 ||
                  r2.right <= r1.left + 1 ||
                  r2.top >= r1.bottom - 1 ||
                  r2.bottom <= r1.top + 1
                );

                if (intersects) {
                  issues.push(
                    `Intersection between <${el1.tagName.toLowerCase()} class="${el1.className.slice(0, 30)}"> and <${el2.tagName.toLowerCase()} class="${el2.className.slice(0, 30)}">`,
                  );
                }
              }
            }
          }
        }

        // Test main layout root container
        const rootContainer = document.querySelector('body > div');
        if (rootContainer) checkSiblings(rootContainer);

        // Test header
        const header = document.querySelector('header');
        if (header) checkSiblings(header);

        // Test sidebar
        const sidebar = document.querySelector('aside');
        if (sidebar) checkSiblings(sidebar);

        return issues;
      });

      expect(intersections).toEqual([]);
    });
  }

  for (const width of [320, 360, 768, 1024, 1440]) {
    test(`asserts no horizontal overflow at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  }
});

test.describe('A2 & G: Onboarding Modal Geometry & Fit', () => {
  const modalViewports = [
    { width: 1366, height: 768, label: 'Desktop Laptop' },
    { width: 360, height: 640, label: 'Mobile Device' },
  ];

  for (const vp of modalViewports) {
    test(`modal fits with visible sticky header and footer at ${vp.label} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click "New Plan" button to open modal
      await page.getByRole('button', { name: /New Plan/i }).click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Check header title visible
      await expect(page.getByRole('heading', { name: /Start Planning/i })).toBeVisible();

      // Click "Start New Plan Wizard" to enter step 1
      await dialog.getByRole('button', { name: /Start New Plan Wizard/i }).click();

      // Wizard step 1 sticky header
      await expect(dialog.getByRole('heading', { name: /Create New Event Plan/i })).toBeVisible();

      // Wizard sticky footer action buttons must be visible within viewport
      const nextButton = dialog.getByRole('button', { name: 'Next', exact: true });
      await expect(nextButton).toBeVisible();

      const footerBox = await nextButton.boundingBox();
      expect(footerBox).not.toBeNull();
      if (footerBox) {
        expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(vp.height);
        expect(footerBox.y).toBeGreaterThanOrEqual(0);
      }

      // Close modal
      await dialog.getByRole('button', { name: 'Close dialog', exact: true }).click();
      await expect(dialog).not.toBeVisible();
    });
  }
});

test.describe('G: Accessibility & Keyboard Workflows', () => {
  test('keyboard-only completion of milestone toggle and undo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find the first milestone complete button
    const firstMilestoneBtn = page.locator('button[aria-label*="Mark "][aria-label*=" as complete"]').first();
    await expect(firstMilestoneBtn).toBeVisible();

    // Focus and trigger with Enter key
    await firstMilestoneBtn.focus();
    await page.keyboard.press('Enter');

    // Verify Undo toast notification appears
    const toast = page.locator('[role="status"]');
    await expect(toast).toContainText('Milestone marked complete');

    // Click Undo
    const undoBtn = page.getByRole('button', { name: /Undo/i });
    await expect(undoBtn).toBeVisible();
    await undoBtn.click();

    // Verify toast dismissed
    await expect(toast).not.toBeVisible();
  });

  test('axe automated check: zero serious or critical violations on Overview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#next-logo')
      .exclude('[data-nextjs-dev-tools-button]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(seriousOrCritical).toEqual([]);
  });

  test('axe automated check: zero serious or critical violations in Onboarding Wizard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New Plan/i }).click();
    await page.getByRole('button', { name: /Start New Plan Wizard/i }).click();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#next-logo')
      .exclude('[data-nextjs-dev-tools-button]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(seriousOrCritical).toEqual([]);
  });
});
