import { expect, test } from '@playwright/test'

test.describe('Artistes Page', () => {
  test('should load artistes page successfully', async ({ page }) => {
    await page.goto('/fr/artistes')

    // Check that the page loads
    await expect(page.locator('h1')).toContainText(/artistes/i)

    // Check for breadcrumb
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible()
  })

  test('should display artistes grid', async ({ page }) => {
    await page.goto('/fr/artistes')

    // Should have artist cards
    await page.waitForSelector('[data-testid="artist-card"]', {
      timeout: 15000,
    })
    const artistCards = page.locator('[data-testid="artist-card"]')
    await expect(artistCards.first()).toBeVisible()
  })

  test('should navigate to artist detail', async ({ page }) => {
    await page.goto('/fr/artistes')

    // Wait for artists to load
    await page.waitForSelector('[data-testid="artist-card"]', {
      timeout: 15000,
    })

    // Get first artist link
    const firstArtist = page.locator('[data-testid="artist-card"]').first()

    // Verify the href attribute is valid
    const href = await firstArtist.getAttribute('href')
    expect(href).toMatch(/^\/fr\/artistes\/[^/]+$/)

    // Click and wait for navigation
    await Promise.all([
      page.waitForURL(/\/fr\/artistes\/[^/]+$/, { timeout: 10000 }),
      firstArtist.click(),
    ])

    // Verify we're on the detail page
    await expect(page).toHaveURL(/\/fr\/artistes\/[^/]+$/)
  })
})
