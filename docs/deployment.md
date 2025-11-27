# Guide de Deploiement Synck

## Environnements

| Env         | Database          | Config         | Usage       |
| ----------- | ----------------- | -------------- | ----------- |
| Development | Neon dev branch   | `.env.local`   | `pnpm dev`  |
| CI          | PostgreSQL Docker | GitHub secrets | Tests E2E   |
| Production  | Neon main branch  | Vercel secrets | Deploiement |

## Variables d'environnement

### Requises

```bash
DATABASE_URL="postgresql://..."        # Connection pooling
DIRECT_URL="postgresql://..."          # Direct (migrations)
NEXT_PUBLIC_SITE_URL="https://..."     # URL du site
RESEND_API_KEY="re_..."                # Email
BETTER_AUTH_SECRET="..."               # Auth
```

### Optionnelles

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_..." # Stockage images
```

## Deploiement Vercel

### Automatique

- Push sur `main` → Deploy production
- Push sur autres branches → Preview deploy

### Cron jobs

Configure dans `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/admin/scheduled-publish",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## Pre-deploiement checklist

```bash
# 1. Lint
pnpm lint

# 2. Build
pnpm build

# 3. Check migrations
pnpm db:check

# 4. Tests (optionnel)
pnpm test:full
```

## Migrations en production

```bash
# Appliquer migrations
pnpm db:migrate:prod

# Seed (si necessaire)
pnpm db:seed:prod
```

## Rollback

1. Revert le commit dans Git
2. Redeploy via Vercel dashboard
3. Si migration problematique: restaurer backup Neon

## Monitoring

- **Vercel**: Analytics, logs, functions
- **Neon**: Database metrics, query insights
- **Admin**: `/admin/logs` pour audit trail
