import { test, expect } from '@playwright/test';

test.describe('Expertises Page', () => {
  test('should load expertises page successfully', async ({ page }) => {
    await page.goto('/fr/expertises');

    // Check that the page loads
    await expect(page.locator('h1')).toContainText(/expertises/i);

    // Check for breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });

  test('should display expertises grid', async ({ page }) => {
    await page.goto('/fr/expertises');

    // Wait for expertises to load
    await page.waitForSelector('a[href*="/expertises/"]', { timeout: 10000 });

    // Should have expertise cards
    const expertiseCards = page.locator('a[href*="/expertises/"]');
    await expect(expertiseCards.first()).toBeVisible();
  });

  test('should navigate to expertise detail', async ({ page }) => {
    await page.goto('/fr/expertises');

    // Wait for expertises to load
    await page.waitForSelector('a[href*="/expertises/"]', { timeout: 10000 });

    // Click on first expertise
    const firstExpertise = page.locator('a[href*="/expertises/"]').first();
    await firstExpertise.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/fr\/expertises\/[^/]+$/);
  });

  test('should display documentaires on gestion-administrative-et-editoriale page', async ({ page }) => {
    await page.goto('/fr/expertises/gestion-administrative-et-editoriale');

    // Check that the page loads
    await expect(page.locator('h1')).toBeVisible();

    // Should have documentaires gallery (if any)
    const documentairesSection = page.locator('text=/documentaires/i').first();
    if (await documentairesSection.count() > 0) {
      await expect(documentairesSection).toBeVisible();
    }
  });
});
