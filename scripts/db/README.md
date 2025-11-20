# 🗄️ Database Environment Management

Ce dossier contient les scripts pour gérer les environnements de base de données (dev/prod) avec Neon PostgreSQL.

## 📁 Structure

```
scripts/db/
├── seed-env.ts          # Seed avec sélection d'environnement
├── reset-env.ts         # Reset + seed avec sélection d'environnement
├── setup-env.sh         # Script auto-setup des URLs Neon
└── README.md            # Cette documentation
```

## 🚀 Commandes disponibles

### Seed

```bash
# Seed sur branche DEV
pnpm db:seed:dev

# Seed sur branche PROD (main)
pnpm db:seed:prod
```

### Reset + Seed

```bash
# Reset + seed sur branche DEV
pnpm db:reset:dev

# Reset + seed sur branche PROD (main)
pnpm db:reset:prod
```

### Setup automatique

```bash
# Récupérer automatiquement les URLs Neon et mettre à jour .env.development et .env.production
pnpm db:setup-env
```

## 📝 Configuration

### Fichiers d'environnement

Le système utilise 3 fichiers `.env` séparés :

1. **`.env.local`** (utilisé par Next.js en local)
   - Pointe vers la branche **dev** par défaut
   - Utilisé automatiquement par `pnpm dev`
   - **Gitignored** (contient des credentials)

2. **`.env.development`** (branche dev)
   - Utilisé par `pnpm db:seed:dev` et `pnpm db:reset:dev`
   - Contient les URLs de la branche Neon **dev**
   - **Gitignored** (contient des credentials)

3. **`.env.production`** (branche main/prod)
   - Utilisé par `pnpm db:seed:prod` et `pnpm db:reset:prod`
   - Contient les URLs de la branche Neon **main**
   - **Gitignored** (contient des credentials)

### Variables requises

Chaque fichier `.env` doit contenir :

```bash
# Database
DATABASE_URL="postgresql://..."      # Pooled connection
DIRECT_URL="postgresql://..."        # Direct connection

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # ou https://... pour prod

# Email
RESEND_API_KEY="re_..."

# Blob Storage (optionnel)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

## 🔧 Setup initial

### 1. Créer les branches Neon

Si vous n'avez pas encore de branches dev/prod :

```bash
# Créer branche dev
neonctl branches create --name dev

# La branche main existe déjà par défaut
```

### 2. Récupérer les URLs automatiquement

```bash
pnpm db:setup-env
```

Ce script va :
- Récupérer les connection strings de vos branches Neon via `neonctl`
- Mettre à jour automatiquement `.env.development` et `.env.production`
- Vous indiquer les variables à remplir manuellement (API keys)

### 3. Ou récupérer manuellement

Si le script ne fonctionne pas, récupérez les URLs manuellement :

```bash
# Pour dev
neonctl connection-string dev --pooled    # → DATABASE_URL
neonctl connection-string dev --direct    # → DIRECT_URL

# Pour prod (main)
neonctl connection-string main --pooled   # → DATABASE_URL
neonctl connection-string main --direct   # → DIRECT_URL
```

Puis copiez-les dans les fichiers `.env.development` et `.env.production`.

## 💡 Exemples d'utilisation

### Développement local classique

```bash
# 1. Démarrer le serveur (utilise .env.local → branche dev)
pnpm dev

# 2. Si besoin de reset la base dev
pnpm db:reset:dev
```

### Tester le seed sur prod avant déploiement

```bash
# Seed sur prod sans affecter dev
pnpm db:seed:prod

# Ou reset complet
pnpm db:reset:prod
```

### Travailler sur plusieurs environnements simultanément

```bash
# Terminal 1 : Dev
pnpm db:seed:dev
pnpm dev

# Terminal 2 : Tester prod
pnpm db:seed:prod
# Vérifier via Prisma Studio ou autre outil
```

## 🔍 Comment ça marche ?

### Système de sélection d'environnement

Les scripts `seed-env.ts` et `reset-env.ts` :

1. Lisent l'argument `dev` ou `prod` :
   ```bash
   tsx scripts/db/seed-env.ts dev
   ```

2. Chargent le fichier `.env` correspondant :
   - `dev` → `.env.development`
   - `prod` → `.env.production`

3. Injectent les variables dans l'environnement

4. Exécutent `prisma/seed.ts` avec le bon environnement

### Sécurité

- ✅ Tous les fichiers `.env.*` sont **gitignored**
- ✅ Les credentials ne sont jamais versionnés
- ✅ Chaque branche Neon a ses propres credentials
- ✅ Pas de risque de seed accidentel sur prod (commande explicite)

## 🎯 Avantages

1. **Séparation claire** : dev et prod totalement isolés
2. **Commandes explicites** : pas de confusion possible
3. **Setup rapide** : script automatique pour récupérer les URLs
4. **Safe** : impossible de seed prod par accident avec `pnpm dev`
5. **Flexible** : facile de basculer entre environnements

## ⚠️ Notes importantes

### En local

- `pnpm dev` utilise **toujours** `.env.local` (branche dev)
- Les commandes `db:seed:*` et `db:reset:*` utilisent leurs fichiers `.env` dédiés
- Pour travailler sur dev, tu peux utiliser soit :
  - `pnpm dev` (lit `.env.local`)
  - `pnpm db:seed:dev` (lit `.env.development`)

### En production (Vercel)

- Vercel utilise ses propres variables d'environnement
- Configure `DATABASE_URL` et `DIRECT_URL` dans les settings Vercel
- Les fichiers `.env.production` sont uniquement pour seed/reset manuel

## 🆘 Troubleshooting

### "Error loading .env.development"

→ Le fichier n'existe pas ou n'est pas configuré. Lancer `pnpm db:setup-env` ou créer le fichier manuellement.

### "Missing required variables"

→ Le fichier `.env` existe mais manque `DATABASE_URL` ou `DIRECT_URL`. Vérifier le contenu du fichier.

### "neonctl not found"

→ Installer neonctl : `npm install -g neonctl` puis `neonctl auth`

### Seed sur mauvaise branche

→ Vérifier que les URLs dans `.env.development` et `.env.production` pointent vers les bonnes branches Neon.

## 📚 Ressources

- [Neon Branching](https://neon.tech/docs/guides/branching)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
