# Guide de Contribution Synck

## Setup local

```bash
# 1. Clone
git clone https://github.com/YoannDrx/synck.git
cd synck

# 2. Install
pnpm install

# 3. Env
cp .env.example .env.local
# Editer .env.local avec vos credentials

# 4. Database
pnpm db:setup

# 5. Dev
pnpm dev
```

## Workflow Git

### Branches

- `main`: Production
- `develop`: Development
- `feature/*`: Nouvelles features
- `fix/*`: Bug fixes

### Commits

Format: `type: description`

Types:

- `feat`: Nouvelle feature
- `fix`: Bug fix
- `refactor`: Refactoring
- `docs`: Documentation
- `style`: Formatting
- `test`: Tests
- `chore`: Maintenance

### Pull Requests

1. Creer branch depuis `develop`
2. Implementer changes
3. `pnpm lint && pnpm build`
4. Push et creer PR
5. Attendre review + CI vert
6. Merge

## Standards de code

### TypeScript

- Strict mode active
- Prefer `type` over `interface`
- Pas de `any`

### Design System

- Utiliser `var(--*)` pour couleurs
- Pas de couleurs Tailwind directes (lime-_, emerald-_)
- CVA pour variants composants

### Prisma

- Toujours inclure relations necessaires
- Utiliser `React.cache()` pour deduplication
- Validation Zod sur tous les inputs

### Tests

- E2E avec Playwright dans `/e2e/`
- Ajouter `[e2e]` dans commit message pour lancer tests
- Utiliser `data-testid` pour selecteurs

## CI/CD

### Jobs automatiques

- Lint & type check
- Prisma validation
- Build
- E2E tests (sur PR ou `[e2e]` dans commit)

### Deploiement

- Automatique sur merge dans `main`
- Preview deploys sur PR

## Questions

- Ouvrir une issue sur GitHub
- Contacter l'equipe dev
