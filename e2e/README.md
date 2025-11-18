# Tests E2E avec Playwright

Ce dossier contient les tests end-to-end (E2E) de l'application utilisant Playwright.

## Structure des tests

```
e2e/
├── home.spec.ts          # Tests de la page d'accueil
├── projets.spec.ts       # Tests de la page projets
├── compositeurs.spec.ts  # Tests de la page compositeurs
├── expertises.spec.ts    # Tests de la page expertises
└── contact.spec.ts       # Tests de la page contact
```

## Lancer les tests

### En mode headless (CI)
```bash
npm run test
```

### En mode UI (interactif)
```bash
npm run test:ui
```

### En mode headed (navigateur visible)
```bash
npm run test:headed
```

### En mode debug
```bash
npm run test:debug
```

### Lancer un test spécifique
```bash
npm run test -- home.spec.ts
```

### Lancer les tests d'un fichier en mode watch
```bash
npm run test -- --watch home.spec.ts
```

## Configuration

La configuration Playwright se trouve dans `playwright.config.ts` à la racine du projet.

### Variables d'environnement

- `PLAYWRIGHT_TEST_BASE_URL`: URL de base pour les tests (défaut: `http://localhost:3000`)
- `CI`: Active le mode CI (retry automatique, reporter GitHub)

## Rapport de tests

Après l'exécution des tests, un rapport HTML est généré dans `playwright-report/`.

Pour visualiser le rapport:
```bash
npx playwright show-report
```

## Screenshots et traces

En cas d'échec:
- Screenshots: `test-results/`
- Traces: disponibles dans le rapport HTML

## CI/CD

Les tests sont automatiquement exécutés sur GitHub Actions lors:
- Des push sur les branches `main`, `master`, ou `layout-expertise`
- Des pull requests vers ces branches

Le workflow vérifie également:
1. Le linting du code
2. Les migrations Prisma
3. La compilation de l'application
4. L'exécution des tests E2E

## Écrire de nouveaux tests

### Structure d'un test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Ma fonctionnalité', () => {
  test('devrait faire quelque chose', async ({ page }) => {
    // 1. Navigation
    await page.goto('/ma-page');

    // 2. Actions
    await page.click('button');

    // 3. Assertions
    await expect(page.locator('h1')).toHaveText('Titre attendu');
  });
});
```

### Bonnes pratiques

1. **Utilisez des locators sémantiques**: Préférez `getByRole`, `getByLabel` aux sélecteurs CSS
2. **Attendez les éléments**: Utilisez `await expect()` plutôt que des `waitFor` manuels
3. **Isolez les tests**: Chaque test doit être indépendant
4. **Nommez clairement**: Les noms de test doivent décrire le comportement attendu

### Exemple de locators

```typescript
// ✅ Bon: sémantique
await page.getByRole('button', { name: 'Envoyer' }).click();
await page.getByLabel('Email').fill('test@example.com');

// ❌ Éviter: sélecteurs CSS fragiles
await page.locator('.btn-primary').click();
await page.locator('#email-input').fill('test@example.com');
```

## Debugging

### Mode debug complet
```bash
npm run test:debug
```

### Pause dans un test
```typescript
test('mon test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Ouvre le debugger
});
```

### Voir les traces d'un test échoué
```bash
npx playwright show-trace test-results/.../trace.zip
```

## Ressources

- [Documentation Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
