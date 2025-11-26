# Database Environment Management

Simple system for managing dev/prod databases with Neon PostgreSQL.

## Structure

```
scripts/db/
├── utils.ts             # Shared utilities (logging, env loading, prisma commands)
├── reset-dev.ts         # Reset dev (no seed)
├── seed-dev.ts          # Seed dev only
├── reset-seed-dev.ts    # Reset + seed dev
├── reset-only-prod.ts   # Reset prod (no seed)
├── seed-prod.ts         # Seed prod only
├── reset-seed-prod.ts   # Reset + seed prod
├── migrate-prod.ts      # Apply migrations to prod
└── README.md            # This file
```

## Commands

### Development (uses `.env.local` → Neon dev branch)

| Command | Description |
|---------|-------------|
| `pnpm db:reset` | Reset without seed |
| `pnpm db:seed` | Seed only |
| `pnpm db:reset:seed` | Reset + seed (most common) |

### Production (uses `.env` only, ignores `.env.local`)

| Command | Description |
|---------|-------------|
| `pnpm db:reset:prod` | Reset prod without seed |
| `pnpm db:seed:prod` | Seed prod only |
| `pnpm db:reset:seed:prod` | Reset + seed prod |
| `pnpm db:migrate:prod` | Apply migrations to prod |

### Other DB commands

| Command | Description |
|---------|-------------|
| `pnpm db:migrate` | Create and apply a migration |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:migrate:check` | Check migration status (CI) |

## Environment Files

### `.env.local` (Development - gitignored)

URLs for Neon **dev** branch. Overrides `.env` locally.

```bash
DATABASE_URL="postgresql://...@ep-royal-breeze-ag8sdda8..."
DIRECT_URL="postgresql://...@ep-royal-breeze-ag8sdda8..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Used by**: `pnpm dev`, `pnpm db:seed`, `pnpm db:reset`, `pnpm db:reset:seed`

### `.env` (Production)

URLs for Neon **main** branch.

```bash
DATABASE_URL="postgresql://...@ep-curly-pond-ag8mwcgd-pooler..."
DIRECT_URL="postgresql://...@ep-curly-pond-ag8mwcgd..."
NEXT_PUBLIC_SITE_URL="https://carolinesenyk.fr"
```

**Used by**: Vercel, CI/CD, `pnpm db:seed:prod`, `pnpm db:reset:prod`

## Common Workflows

### Daily development

```bash
# Start server (uses .env.local → dev)
pnpm dev

# Reset + seed in one command
pnpm db:reset:seed
```

### Test seed changes

```bash
# 1. Edit prisma/seed.ts
# 2. Reset without seed
pnpm db:reset
# 3. Test new seed
pnpm db:seed
```

### Deploy to production

```bash
# After merge to main, seed prod
pnpm db:seed:prod

# Or full reset + seed (DANGER: deletes all data!)
pnpm db:reset:seed:prod
```

## How It Works

### Environment Loading

- **Development**: Loads `.env.local` first, falls back to `.env`
- **Production** (`*:prod`): Loads **only** `.env`, ignores `.env.local`

This ensures you can't accidentally affect production from local.

### Shared Utilities (`utils.ts`)

All scripts use shared utilities:

```typescript
import { log, loadEnv, validateEnv, runPrismaReset, runPrismaSeed } from "./utils";

runScript("seed-dev", () => {
  log.header("Seed DEVELOPMENT Database");
  loadEnv("development");
  validateEnv();
  runPrismaSeed();
});
```

## Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Reset + Seed DEVELOPMENT Database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/4] Loading environment...
📁 Config: .env.local (development)
🗄️  Database: postgresql://***:***@ep-royal-breeze...
🌐 Host: ep-royal-breeze-ag8sdda8.c-2.eu-central-1.aws.neon.tech

[2/4] Resetting database...
✅ Database reset complete

[3/4] Seeding database...
✅ Database seeded

[4/4] Complete!
✅ Development database ready!

⏱️  Completed in 145.3s
```

## Troubleshooting

### "Can't reach database server"

The Neon branch is probably in sleep mode. Wait a few seconds for it to wake up.

### Seed uses prod instead of dev

Check that `.env.local` exists and contains dev URLs. Otherwise, `.env` (prod) is used.

### Reset doesn't seed automatically

Normal! Use `pnpm db:reset:seed` if you want reset + seed in one command.
