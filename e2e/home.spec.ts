import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/fr');

    // Check that the page loads
    await expect(page).toHaveTitle(/Caroline Senyk/);

    // Check for main sections
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display expertises section', async ({ page }) => {
    await page.goto('/fr');

    // Check for expertises section
    const expertisesSection = page.locator('section#expertises');
    await expect(expertisesSection).toBeVisible();

    // Should have at least one expertise card
    const expertiseCards = expertisesSection.locator('a');
    await expect(expertiseCards.first()).toBeVisible();
  });

  test('should navigate to expertises page', async ({ page }) => {
    await page.goto('/fr');

    // Click on "Voir toutes les expertises" or similar link
    const viewAllButton = page.getByRole('link', { name: /expertises/i }).first();
    await viewAllButton.click();

    // Should navigate to expertises page
    await expect(page).toHaveURL(/\/fr\/expertises/);
  });

  test('should switch language to English', async ({ page }) => {
    await page.goto('/fr');

    // Find and click language switcher (if exists)
    const langSwitcher = page.getByRole('link', { name: /en/i });
    if (await langSwitcher.count() > 0) {
      await langSwitcher.click();
      await expect(page).toHaveURL(/\/en/);
    }
  });
});
