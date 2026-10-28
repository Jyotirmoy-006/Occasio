import { test, expect } from '@playwright/test';

const VIEWPORT_WIDTHS = [1440, 1024, 768, 360];

test.describe('1A & 1B: Tooltips, Popovers & Header Spacing', () => {
  for (const width of VIEWPORT_WIDTHS) {
    test(`header controls and tooltips at viewport width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();

      // 1B. Header padding check: at least 24px desktop (>=1024), at least 16px mobile (<1024)
      const headerPadding = await header.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          left: parseFloat(style.paddingLeft),
          right: parseFloat(style.paddingRight),
        };
      });

      if (width >= 1024) {
        expect(headerPadding.left).toBeGreaterThanOrEqual(24);
        expect(headerPadding.right).toBeGreaterThanOrEqual(24);
      } else {
        expect(headerPadding.left).toBeGreaterThanOrEqual(16);
        expect(headerPadding.right).toBeGreaterThanOrEqual(16);
      }

      // 1B. Header no horizontal overflow
      const headerOverflow = await header.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      expect(headerOverflow).toBe(false);

      // 1B. Export control: visible text label at >=1024px, icon-only below
      const exportBtn = page.getByRole('button', { name: /Export/i });
      await expect(exportBtn).toBeVisible();

      if (width >= 1024) {
        const exportText = exportBtn.locator('span');
        await expect(exportText).toBeVisible();
      }

      // 1A. Tooltip on Export button: hover
      await exportBtn.hover();
      await page.waitForTimeout(400);
      const exportTooltip = page.locator('[role="tooltip"]').filter({ hasText: /Export plan/i });
      await expect(exportTooltip).toBeVisible({ timeout: 3000 });

      // Assert tooltip is fully inside viewport
      const tooltipBounds = await exportTooltip.boundingBox();
      expect(tooltipBounds).not.toBeNull();
      if (tooltipBounds) {
        expect(tooltipBounds.x).toBeGreaterThanOrEqual(0);
        expect(tooltipBounds.y).toBeGreaterThanOrEqual(0);
        expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(width + 2);
        expect(tooltipBounds.y + tooltipBounds.height).toBeLessThanOrEqual(800);

        // elementFromPoint check: assert tooltip is rendered on top
        const isCovered = await page.evaluate(
          ({ x, y }) => {
            const el = document.elementFromPoint(x, y);
            const tip = document.querySelector('[role="tooltip"]');
            return !tip || (!tip.contains(el) && el !== tip);
          },
          { x: tooltipBounds.x + tooltipBounds.width / 2, y: tooltipBounds.y + tooltipBounds.height / 2 },
        );
        expect(isCovered).toBe(false);
      }

      // Dismiss tooltip by moving away
      await page.mouse.move(0, 0);

      // 1A. Shortcuts button on viewports >= 768px: test keyboard focus & hover
      if (width >= 768) {
        const shortcutsBtn = page.locator('button[aria-label*="Keyboard shortcuts"]');
        await expect(shortcutsBtn).toBeVisible();
        await shortcutsBtn.focus();
        await page.waitForTimeout(400);

        const shortcutsTip = page.locator('[role="tooltip"]').filter({ hasText: /Keyboard shortcuts/i });
        await expect(shortcutsTip).toBeVisible({ timeout: 4000 });

        const shortcutsBounds = await shortcutsTip.boundingBox();
        if (shortcutsBounds) {
          expect(shortcutsBounds.x).toBeGreaterThanOrEqual(0);
          expect(shortcutsBounds.x + shortcutsBounds.width).toBeLessThanOrEqual(width + 2);
        }
        await page.keyboard.press('Escape');
      }

      // 1C. Status Pill & Popover interaction
      const statusPill = page.locator('button[aria-label*="AI Status:"]');
      await expect(statusPill).toBeVisible();

      // Click status pill to open Popover
      await statusPill.click();
      const popoverContent = page.locator('text=AI Service Status');
      await expect(popoverContent).toBeVisible();

      // Check popover contains model info and check again button
      await expect(page.locator('text=Active Model:')).toBeVisible();
      const checkAgainBtn = page.getByRole('button', { name: /Check again/i });
      await expect(checkAgainBtn).toBeVisible();

      // Close popover via close button
      const closePopoverBtn = page.getByRole('button', { name: 'Close status popover' });
      await closePopoverBtn.click();
      await expect(popoverContent).not.toBeVisible();
    });
  }
});
