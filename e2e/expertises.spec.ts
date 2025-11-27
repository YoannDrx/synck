import { expect, test } from '@playwright/test'

test.describe('Expertises Page', () => {
  test('should load expertises page successfully', async ({ page }) => {
    await page.goto('/fr/expertises')

    // Check that the page loads
    await expect(page.locator('h1')).toContainText(/expertises/i)

    // Check for breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
  })

  test('should display expertises grid', async ({ page }) => {
    await page.goto('/fr/expertises')

    // Wait for expertises to load
    await page.waitForSelector('[data-testid="expertise-card"]', { timeout: 20000 })

    // Should have expertise cards
    const expertiseCards = page.locator('[data-testid="expertise-card"]')
    await expect(expertiseCards.first()).toBeVisible()
  })

  test('should navigate to expertise detail', async ({ page }) => {
    await page.goto('/fr/expertises')

    // Wait for expertises to load
    await page.waitForSelector('[data-testid="expertise-card"]', { timeout: 20000 })

    // Click on first expertise
    const firstExpertise = page.locator('[data-testid="expertise-card"]').first()
    await firstExpertise.click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/fr\/expertises\/[^/]+$/)
  })

  test('should display documentaires on gestion-administrative-et-editoriale page', async ({
    page,
  }) => {
    await page.goto('/fr/expertises/gestion-administrative-et-editoriale')

    // Check that the page loads
    await expect(page.locator('h1')).toBeVisible()

    // Should have documentaires gallery (if any)
    const documentairesSection = page.locator('text=/documentaires/i').first()
    if ((await documentairesSection.count()) > 0) {
      await expect(documentairesSection).toBeVisible()
    }
  })
})
