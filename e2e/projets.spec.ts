import { test, expect } from '@playwright/test';

test.describe('Projets Page', () => {
  test('should load projets page successfully', async ({ page }) => {
    await page.goto('/fr/projets');

    // Check that the page loads
    await expect(page.locator('h1')).toContainText(/projets/i);

    // Check for breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });

  test('should display projets grid', async ({ page }) => {
    await page.goto('/fr/projets');

    // Should have project cards
    const projectCards = page.locator('a[href*="/projets/"]');
    await expect(projectCards.first()).toBeVisible();
  });

  test('should filter projets by category', async ({ page }) => {
    await page.goto('/fr/projets');

    // Wait for projects to load
    await page.waitForSelector('a[href*="/projets/"]', { timeout: 10000 });

    // Click on a category filter button (not "Tout")
    const categoryButtons = page.locator('button:not(:has-text("Tout"))').first();
    if (await categoryButtons.count() > 0) {
      await categoryButtons.click();

      // Projects should still be visible
      await expect(page.locator('a[href*="/projets/"]').first()).toBeVisible();
    }
  });

  test('should search for a project', async ({ page }) => {
    await page.goto('/fr/projets');

    // Find search input
    const searchInput = page.locator('input[type="text"]');
    await searchInput.fill('test');

    // Should show results or "no results" message
    const hasResults = await page.locator('a[href*="/projets/"]').count() > 0;
    const hasNoResults = await page.locator('text=/aucun.*résultat/i').count() > 0;

    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('should navigate to project detail', async ({ page }) => {
    await page.goto('/fr/projets');

    // Wait for projects to load
    await page.waitForSelector('a[href*="/projets/"]', { timeout: 10000 });

    // Click on first project
    const firstProject = page.locator('a[href*="/projets/"]').first();
    await firstProject.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/fr\/projets\/[^/]+$/);
  });
});
