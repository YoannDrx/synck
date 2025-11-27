import { expect, test } from '@playwright/test'

test.describe('Projets Page', () => {
  test('should load projets page successfully', async ({ page }) => {
    await page.goto('/fr/projets')

    // Check that the page loads
    await expect(page.locator('h1')).toContainText(/projets/i)

    // Check for breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
  })

  test('should display projets grid', async ({ page }) => {
    await page.goto('/fr/projets')

    // Should have project cards
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 15000 })
    const projectCards = page.locator('[data-testid="project-card"]')
    await expect(projectCards.first()).toBeVisible()
  })

  test('should filter projets by category', async ({ page }) => {
    await page.goto('/fr/projets')

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 15000 })

    // Click on a category filter button (not "Tout")
    const filterButtons = page
      .locator('[data-testid="category-filter"]')
      .filter({ hasNotText: 'Tout' })
    if ((await filterButtons.count()) > 0) {
      await filterButtons.first().click()

      // Projects should still be visible
      await expect(page.locator('[data-testid="project-card"]').first()).toBeVisible()
    }
  })

  test('should search for a project', async ({ page }) => {
    await page.goto('/fr/projets')

    // Find search input
    const searchInput = page.locator('[data-testid="projects-search"]')
    await searchInput.fill('minimal')

    // Should show results for seeded data
    await expect(page.locator('[data-testid="project-card"]').first()).toBeVisible()
  })

  test('should navigate to project detail', async ({ page }) => {
    await page.goto('/fr/projets')

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 15000 })

    // Click on first project
    const firstProject = page.locator('[data-testid="project-card"]').first()
    await firstProject.click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/fr\/projets\/[^/]+$/)
  })
})
