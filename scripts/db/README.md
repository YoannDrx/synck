# 🗄️ Database Environment Management

Simple 2-file system for managing dev/prod databases with Neon PostgreSQL.

## 📁 Structure

```
scripts/db/
├── reset-dev.ts           # Reset dev (no seed)
├── seed-dev.ts            # Seed dev only
├── reset-seed-dev.ts      # Reset + seed dev
├── reset-only-prod.ts     # Reset prod (no seed)
├── seed-prod.ts           # Seed prod only
├── reset-seed-prod.ts     # Reset + seed prod
└── README.md              # This file
```

## 🚀 Commandes disponibles

### Development (local - utilise `.env.local`)

| Commande | Description | Script |
|----------|-------------|--------|
| `pnpm db:reset` | Reset **sans seed** | `reset-dev.ts` |
| `pnpm db:seed` | Seed uniquement | `seed-dev.ts` |
| `pnpm db:reset:seed` | Reset + seed complet | `reset-seed-dev.ts` |

**Workflows courants :**

```bash
# Reset complet (le plus utilisé)
pnpm db:reset:seed

# Reset sans seed (pour tester le seed manuellement)
pnpm db:reset
pnpm db:seed

# Seed uniquement (ajouter/update données)
pnpm db:seed
```

### Production (utilise `.env` uniquement, ignore `.env.local`)

| Commande | Description | Script |
|----------|-------------|--------|
| `pnpm db:reset:prod` | Reset prod **sans seed** ⚠️ | `reset-only-prod.ts` |
| `pnpm db:seed:prod` | Seed prod uniquement | `seed-prod.ts` |
| `pnpm db:reset:seed:prod` | Reset + seed prod complet ⚠️ | `reset-seed-prod.ts` |

**Workflows production :**

```bash
# Seed après migration (recommandé)
pnpm db:seed:prod

# Reset complet (⚠️ efface toutes les données!)
pnpm db:reset:seed:prod
```

### Autres commandes DB

| Commande | Description |
|----------|-------------|
| `pnpm db:migrate` | Créer et appliquer une migration |
| `pnpm db:generate` | Générer le Prisma Client |
| `pnpm db:studio` | Ouvrir Prisma Studio |
| `pnpm db:migrate:check` | Vérifier état des migrations (CI) |

## 📝 Configuration - 2 fichiers seulement

### 1. `.env` (Production - versionnée)

Contient les URLs de la branche **main** de Neon.

```bash
# Production Environment (Neon branch: main)
DATABASE_URL="postgresql://...@ep-curly-pond-ag8mwcgd-pooler..."
DIRECT_URL="postgresql://...@ep-curly-pond-ag8mwcgd..."
NEXT_PUBLIC_SITE_URL="https://carolinesenyk.fr"
RESEND_API_KEY="re_..."
```

**Utilisé par** :
- Vercel (production)
- CI/CD
- `pnpm db:seed:prod`
- `pnpm db:reset:prod`
- `pnpm db:reset:seed:prod`

### 2. `.env.local` (Development - gitignored)

Contient les URLs de la branche **dev** de Neon. Override `.env` en local.

```bash
# Development Environment (Neon branch: dev)
DATABASE_URL="postgresql://...@ep-royal-breeze-ag8sdda8..."
DIRECT_URL="postgresql://...@ep-royal-breeze-ag8sdda8..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
RESEND_API_KEY="re_..."
```

**Utilisé par** :
- Next.js en local (`pnpm dev`)
- `pnpm db:seed` (dev)
- `pnpm db:reset` (dev)
- `pnpm db:reset:seed` (dev)

## 🔧 Setup initial

### 1. Créer les branches Neon

```bash
# Créer branche dev (si elle n'existe pas)
neonctl branches create --name dev

# La branche main existe déjà par défaut
```

### 2. Configurer .env (production)

Récupérer les URLs de la branche **main** :

```bash
neonctl connection-string main --pooled   # → DATABASE_URL
neonctl connection-string main --direct   # → DIRECT_URL
```

Copier dans `.env`.

### 3. Configurer .env.local (development)

Récupérer les URLs de la branche **dev** :

```bash
neonctl connection-string dev --pooled    # → DATABASE_URL
neonctl connection-string dev --direct    # → DIRECT_URL
```

Créer `.env.local` et y copier les URLs.

## 💡 Exemples d'utilisation

### Développement local quotidien

```bash
# 1. Démarrer le serveur (utilise .env.local → dev)
pnpm dev

# 2. Reset + seed complet en une commande
pnpm db:reset:seed
```

### Modifier et tester le seed

```bash
# 1. Modifier prisma/seed.ts

# 2. Reset sans seed
pnpm db:reset

# 3. Tester le nouveau seed
pnpm db:seed

# 4. Si OK, reset + seed complet pour valider
pnpm db:reset:seed
```

### Ajouter des données sans tout reset

```bash
# Juste lancer le seed (upsert les données existantes)
pnpm db:seed
```

### Nouvelle migration

```bash
# 1. Modifier prisma/schema.prisma

# 2. Créer et appliquer la migration
pnpm db:migrate

# 3. La DB est reset automatiquement
# 4. Re-seed si nécessaire
pnpm db:seed
```

### Déployer en production

```bash
# Sur la branche production, après merge

# Option A : Seed seulement (si migration déjà appliquée)
pnpm db:seed:prod

# Option B : Reset + seed complet (⚠️ efface toutes les données!)
pnpm db:reset:seed:prod
```

## 🔍 Comment ça marche ?

### Next.js & dotenv behavior

Next.js (et dotenv) charge automatiquement les fichiers dans cet ordre :

1. `.env` (toujours chargé)
2. `.env.local` (si présent, override `.env`)

**En local** :
- `.env` chargé → URLs prod
- `.env.local` chargé → URLs dev (override)
- **Résultat** : tu es sur dev ✅

**En production (Vercel)** :
- `.env` chargé → URLs prod
- `.env.local` n'existe pas (gitignored)
- **Résultat** : tu es sur prod ✅

### Scripts *:prod

Ces scripts **ignorent volontairement** `.env.local` :

```typescript
// Charge UNIQUEMENT .env (ignore .env.local)
config({ path: resolve(process.cwd(), ".env") });
```

Donc même en local, tu peux seed prod de manière sécurisée.

### Séparation reset/seed

Tous les scripts utilisent `--skip-seed` pour désactiver le seed automatique de Prisma :

```typescript
execSync("prisma migrate reset --force --skip-seed", {
  stdio: "inherit",
  env: process.env,
});
```

Cela permet de contrôler précisément quand lancer le seed.

## ✅ Avantages de cette organisation

1. **Contrôle granulaire** : reset et seed sont séparés
2. **Workflows flexibles** : reset sans seed pour tester, seed sans reset pour ajouter
3. **Safe par défaut** : commandes explicites pour prod
4. **Convention claire** : `:prod` pour production, sans suffixe pour dev
5. **2 fichiers seulement** : `.env` (prod) et `.env.local` (dev)

## ⚠️ Notes importantes

### En local

- `pnpm dev` → utilise `.env.local` (dev)
- `pnpm db:reset` → utilise `.env.local` (dev)
- `pnpm db:seed` → utilise `.env.local` (dev)
- `pnpm db:reset:seed` → utilise `.env.local` (dev)
- `pnpm db:seed:prod` → utilise `.env` uniquement (prod)
- `pnpm db:reset:prod` → utilise `.env` uniquement (prod)

### En production (Vercel)

- `.env` → configuré dans Vercel settings
- `.env.local` → n'existe pas (gitignored)

### Sécurité

- ✅ `.env` peut être versionné (credentials prod partagés en équipe)
- ✅ `.env.local` est **toujours gitignored** (credentials dev personnels)
- ✅ Impossible de seed prod accidentellement avec `pnpm dev`
- ⚠️ Les commandes `:prod` sont **dangereuses** → utiliser avec précaution

## 🆘 Troubleshooting

### "Can't reach database server"

→ La branche Neon est probablement en sleep mode. Attendre quelques secondes qu'elle se réveille.

### Commande seed utilise prod au lieu de dev

→ Vérifier que `.env.local` existe et contient les URLs de dev. Sinon, c'est `.env` (prod) qui est utilisé.

### "Connection pool timeout"

→ Trop de connexions ouvertes. Redémarrer Next.js ou attendre que les connexions se ferment.

### Reset ne seed pas automatiquement

→ C'est normal ! Utilise `pnpm db:reset:seed` si tu veux reset + seed en une commande.

## 📚 Ressources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Neon Branching](https://neon.tech/docs/guides/branching)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
