import { test, expect } from '@playwright/test';

test.describe('2C: Material System Smoke & Reduce-Decoration Mode', () => {
  test('confirms textured elements render and reduce-decoration mode toggles them off', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Assert core material elements render in the DOM
    const heroSurface = page.locator('.hero-surface');
    await expect(heroSurface).toBeVisible();

    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/sidebar-woven/);

    const paperSheets = page.locator('.paper-sheet');
    const count = await paperSheets.count();
    expect(count).toBeGreaterThan(0);

    // Assert foil accents exist in the hero
    const foilAccent = page.locator('.foil-accent').first();
    await expect(foilAccent).toBeVisible();

    // Assert initial html data-reduce-decoration is not set
    const initialReduced = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-reduce-decoration');
    });
    expect(initialReduced).toBeNull();

    // 2. Click the "Decoration: Rich" toggle in the sidebar
    const toggleBtn = page.getByRole('button', { name: /Decoration:/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // 3. Assert data-reduce-decoration="true" is set on <html>
    await expect(page.locator('html')).toHaveAttribute('data-reduce-decoration', 'true');

    // 4. Verify CSS overrides take effect
    const isWovenRemoved = await sidebar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.backgroundImage === 'none';
    });
    expect(isWovenRemoved).toBe(true);

    // 5. Toggle back to Rich
    await toggleBtn.click();
    await expect(page.locator('html')).not.toHaveAttribute('data-reduce-decoration', 'true');
  });
});

