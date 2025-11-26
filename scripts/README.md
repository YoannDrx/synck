# Scripts

Essential utility scripts for the project.

## Structure

```
scripts/
├── db/                      # Database management scripts
│   ├── utils.ts             # Shared utilities (logging, env, prisma)
│   ├── reset-dev.ts         # Reset development database
│   ├── seed-dev.ts          # Seed development database
│   ├── reset-seed-dev.ts    # Reset + Seed development
│   ├── reset-only-prod.ts   # Reset production (no seed)
│   ├── seed-prod.ts         # Seed production
│   ├── reset-seed-prod.ts   # Reset + Seed production
│   ├── migrate-prod.ts      # Apply migrations to production
│   └── README.md            # DB scripts documentation
├── create-admin-via-better-auth.ts  # Create admin user
├── generate-categories.ts   # Generate seed-data/categories.json
├── generate-works.ts        # Generate seed-data/works.json
└── vercel-build.js          # Vercel deployment script
```

## Database Scripts

Accessible via npm commands defined in `package.json`:

### Development (local)

```bash
pnpm db:reset        # Reset development database
pnpm db:seed         # Seed development database
pnpm db:reset:seed   # Reset + Seed in one command
```

### Production

```bash
pnpm db:reset:prod       # Reset production (no seed)
pnpm db:seed:prod        # Seed production
pnpm db:reset:seed:prod  # Reset + Seed production
pnpm db:migrate:prod     # Apply migrations to production
```

See `scripts/db/README.md` for detailed documentation.

## Seed Data Generation

These scripts generate JSON files used by `prisma/seed.ts`:

### generate-categories.ts

Generates `seed-data/categories.json` with work categories.

```bash
pnpm tsx scripts/generate-categories.ts
```

### generate-works.ts

Generates `seed-data/works.json` with all works (albums, documentaries, etc.).

```bash
pnpm tsx scripts/generate-works.ts
```

## Admin User Creation

Create an admin user via Better Auth:

```bash
pnpm tsx scripts/create-admin-via-better-auth.ts
```

## Seed Workflow

1. **Modify source data** (markdown, images, etc.)
2. **Regenerate JSON files** if needed:
   ```bash
   pnpm tsx scripts/generate-categories.ts
   pnpm tsx scripts/generate-works.ts
   ```
3. **Seed the database**:
   ```bash
   pnpm db:seed           # For dev
   pnpm db:seed:prod      # For production
   ```

## Technical Notes

- All scripts use `tsx` for TypeScript execution (ESM-compatible)
- DB scripts share utilities via `scripts/db/utils.ts`
- Production scripts ignore `.env.local` for safety
