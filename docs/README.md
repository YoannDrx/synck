# Documentation Synck

Portfolio professionnel multilingue (FR/EN) pour Caroline Senyk, gestionnaire de droits musicaux.

## Index

| Document                            | Description                                |
| ----------------------------------- | ------------------------------------------ |
| [Architecture](./architecture.md)   | Vue d'ensemble de l'architecture technique |
| [Admin Guide](./admin-guide.md)     | Guide des fonctionnalites admin            |
| [Design System](./design-system.md) | Documentation du systeme de design         |
| [Deployment](./deployment.md)       | Guide de deploiement                       |
| [API Reference](./api-reference.md) | Reference des endpoints API                |
| [Contributing](./contributing.md)   | Guide de contribution                      |

## Quick Links

- **Dev server**: `pnpm dev` → http://localhost:3000
- **Reset DB**: `pnpm db:setup`
- **Tests E2E**: `pnpm test:full`
- **Build**: `pnpm build`

## Stack Technique

- **Framework**: Next.js 16 + React 19
- **Database**: PostgreSQL (Neon) + Prisma 6.19
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Auth**: Better Auth + 2FA
- **Tests**: Playwright
