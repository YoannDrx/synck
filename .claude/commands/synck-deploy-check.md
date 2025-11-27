# Synck Deploy Check

Verifie que le projet est pret pour le deploiement.

## Checklist a executer

### 1. Lint

```bash
pnpm lint
```

- Doit passer sans erreurs

### 2. TypeScript

```bash
pnpm exec tsc --noEmit
```

- Doit passer sans erreurs de type

### 3. Build

```bash
pnpm build
```

- Doit compiler sans erreurs

### 4. Prisma Check

```bash
pnpm db:check
```

- Verifie qu'il n'y a pas de schema drift

### 5. Design System (optionnel)

```bash
./scripts/check-design-tokens.sh
```

- Verifie les couleurs hardcoded

## Rapport final

Retourne un tableau recapitulatif :

| Check      | Status  | Details               |
| ---------- | ------- | --------------------- |
| Lint       | OK/FAIL | Erreurs si FAIL       |
| TypeScript | OK/FAIL | Erreurs si FAIL       |
| Build      | OK/FAIL | Temps de build        |
| Prisma     | OK/FAIL | Schema drift?         |
| Design     | OK/WARN | Nb couleurs hardcoded |

## Verdict

- **PRET** : Tous les checks passent
- **NON PRET** : Lister les problemes a resoudre
