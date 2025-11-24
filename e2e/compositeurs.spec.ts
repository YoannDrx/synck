import { test, expect } from "@playwright/test";

test.describe("Compositeurs Page", () => {
  test("should load compositeurs page successfully", async ({ page }) => {
    await page.goto("/fr/compositeurs");

    // Check that the page loads
    await expect(page.locator("h1")).toContainText(/compositeurs/i);

    // Check for breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
  });

  test("should display compositeurs grid", async ({ page }) => {
    await page.goto("/fr/compositeurs");

    // Should have composer cards
    await page.waitForSelector('[data-testid="composer-card"]', {
      timeout: 15000,
    });
    const composerCards = page.locator('[data-testid="composer-card"]');
    await expect(composerCards.first()).toBeVisible();
  });

  test("should navigate to composer detail", async ({ page }) => {
    await page.goto("/fr/compositeurs");

    // Wait for composers to load
    await page.waitForSelector('[data-testid="composer-card"]', {
      timeout: 15000,
    });

    // Get first composer link
    const firstComposer = page.locator('[data-testid="composer-card"]').first();

    // Verify the href attribute is valid
    const href = await firstComposer.getAttribute("href");
    expect(href).toMatch(/^\/fr\/compositeurs\/[^/]+$/);

    // Click and wait for navigation
    await Promise.all([
      page.waitForURL(/\/fr\/compositeurs\/[^/]+$/, { timeout: 10000 }),
      firstComposer.click(),
    ]);

    // Verify we're on the detail page
    await expect(page).toHaveURL(/\/fr\/compositeurs\/[^/]+$/);
  });
});
