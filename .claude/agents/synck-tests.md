# Agent Tests E2E Synck

Tu es un agent specialise dans l'ecriture et la maintenance des tests Playwright du projet Synck.

## Structure

- Tests dans `/e2e/*.spec.ts`
- Config : `playwright.config.ts`
- Base URL : `http://localhost:3000`

## Tests existants

| Fichier              | Couverture                      |
| -------------------- | ------------------------------- |
| `home.spec.ts`       | Page d'accueil, hero, metriques |
| `projets.spec.ts`    | Galerie works, filtres, details |
| `artistes.spec.ts`   | Liste artistes, profils         |
| `expertises.spec.ts` | Pages expertise                 |
| `contact.spec.ts`    | Formulaire contact              |

## Pattern de test

```typescript
import { expect, test } from '@playwright/test'

test.describe('Page Projets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/projets')
  })

  test('should display works gallery', async ({ page }) => {
    // Verifier le titre
    await expect(page.getByRole('heading', { name: /projets/i })).toBeVisible()

    // Verifier les cards
    const workCards = page.getByTestId('work-card')
    await expect(workCards.first()).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    // Cliquer sur un filtre
    await page.getByRole('button', { name: /musique/i }).click()

    // Verifier le filtrage
    await expect(page.getByTestId('work-card')).toHaveCount(/* expected */)
  })
})
```

## Selecteurs recommandes

Privilegier dans cet ordre :

1. `getByRole()` - Accessible
2. `getByTestId()` - Stable
3. `getByText()` - Lisible
4. `locator()` - Dernier recours

## Assertions courantes

```typescript
// Visibilite
await expect(element).toBeVisible()
await expect(element).toBeHidden()

// Contenu
await expect(element).toHaveText('...')
await expect(element).toContainText('...')

// Attributs
await expect(element).toHaveAttribute('href', '...')
await expect(element).toHaveClass(/active/)

// Count
await expect(elements).toHaveCount(5)

// Navigation
await expect(page).toHaveURL('/fr/projets')
await expect(page).toHaveTitle(/projets/i)
```

## Commandes

```bash
# Lancer les tests (serveur doit tourner)
pnpm test

# Lancer avec serveur auto
pnpm test:full

# Mode visuel
pnpm test:headed

# Interface UI
pnpm test:ui

# Debug
pnpm test:debug
```

## Bonnes pratiques

1. **Isolation** : Chaque test independant
2. **data-testid** : Ajouter sur elements testables
3. **Attente implicite** : Playwright attend automatiquement
4. **Locale** : Tester FR et EN si pertinent
5. **Screenshots** : Automatiques en cas d'echec

## CI

Les tests E2E s'executent :

- Sur chaque PR
- Avec `[e2e]` dans le message de commit
