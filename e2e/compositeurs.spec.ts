import { test, expect } from '@playwright/test';

test.describe('Compositeurs Page', () => {
  test('should load compositeurs page successfully', async ({ page }) => {
    await page.goto('/fr/compositeurs');

    // Check that the page loads
    await expect(page.locator('h1')).toContainText(/compositeurs/i);

    // Check for breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });

  test('should display compositeurs grid', async ({ page }) => {
    await page.goto('/fr/compositeurs');

    // Should have composer cards
    await page.waitForSelector('[data-testid="composer-card"]', { timeout: 15000 });
    const composerCards = page.locator('[data-testid="composer-card"]');
    await expect(composerCards.first()).toBeVisible();
  });

  test('should navigate to composer detail', async ({ page }) => {
    await page.goto('/fr/compositeurs');

    // Wait for composers to load
    await page.waitForSelector('[data-testid="composer-card"]', { timeout: 15000 });

    // Click on first composer
    const firstComposer = page.locator('[data-testid="composer-card"]').first();
    await firstComposer.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/fr\/compositeurs\/[^/]+$/);
  });
});
