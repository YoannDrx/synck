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
    const composerCards = page.locator('a[href*="/compositeurs/"]');
    await expect(composerCards.first()).toBeVisible();
  });

  test('should search for a composer', async ({ page }) => {
    await page.goto('/fr/compositeurs');

    // Find search input
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('arandel');

    // Should show at least one result for seeded data
    await expect(page.locator('a[href*="/compositeurs/"]').first()).toBeVisible();
  });

  test('should navigate to composer detail', async ({ page }) => {
    await page.goto('/fr/compositeurs');

    // Wait for composers to load
    await page.waitForSelector('a[href*="/compositeurs/"]', { timeout: 10000 });

    // Click on first composer
    const firstComposer = page.locator('a[href*="/compositeurs/"]').first();
    await firstComposer.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/fr\/compositeurs\/[^/]+$/);
  });
});
