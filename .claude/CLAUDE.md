# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Portfolio professionnel multilingue (FR/EN) pour Caroline Senyk, gestionnaire de droits musicaux. Site vitrine avec gestion de 500+ œuvres musicales, compositeurs, labels et expertises.

## Commandes essentielles

### Développement
```bash
pnpm dev              # Serveur développement (http://localhost:3000)
pnpm build            # Build production
pnpm start            # Serveur production
pnpm lint             # ESLint
```

### Base de données (Prisma)
```bash
pnpm db:migrate       # Créer et appliquer migration
pnpm db:generate      # Générer Prisma Client
pnpm db:studio        # Interface Prisma Studio
pnpm db:seed          # Seeder la base avec données initiales
pnpm db:migrate:check # Vérifier état migrations (utilisé en CI)
```

### Tests (Playwright)
```bash
pnpm test             # Tous les tests E2E
pnpm test:ui          # Interface UI Playwright
pnpm test:headed      # Mode headed (navigateur visible)
pnpm test:debug       # Mode debug
```

**Note importante** : Les tests E2E s'exécutent sur `http://localhost:3000`. Le serveur Next.js doit être démarré avant de lancer les tests.

## Architecture

### Stack technique
- **Framework** : Next.js 16.0.3 avec App Router
- **Runtime** : React 19.2.0
- **Base de données** : PostgreSQL (Neon) via Prisma 6.19
- **Styling** : Tailwind CSS 4 + shadcn/ui (New York style)
- **Animations** : Framer Motion 12
- **Images** : Vercel Blob + Sharp (optimisation)
- **Email** : Resend
- **Tests** : Playwright 1.56
- **Validation** : Zod 4.1
- **Markdown** : react-markdown + remark

### Structure du code

```
/app                  # Next.js App Router
  /[locale]           # Routes i18n (fr, en)
    /page.tsx         # HomePage
    /projets/         # Galerie works avec filtrage
    /compositeurs/    # Liste compositeurs
    /expertises/      # Pages expertise
    /contact/         # Formulaire contact
  /api                # API Routes REST
    /projets          # GET works publiques
    /composers        # GET compositeurs
    /contact          # POST email contact
    /admin/*          # CRUD protégé (works, composers, categories, labels, upload)

/components           # Composants React
  /ui                 # shadcn/ui primitives
  /sections           # Sections page (Hero, Gallery, etc.)
  /layout             # Layout composants (Header, Footer, Nav)
  /cards              # Cards (Work, Composer, Expertise)
  /admin              # Admin panel composants

/lib                  # Utilitaires
  /prisma.ts          # Client Prisma singleton
  /i18n.ts            # Config i18n + helpers
  /metadata.ts        # Métadonnées SEO
  /assets.ts          # Helpers Asset/Image
  /email.ts           # Templates email

/prisma               # Prisma ORM
  /schema.prisma      # Schéma base de données
  /migrations/        # Migrations SQL
  /seed.ts            # Seed données

/dictionaries         # Traductions statiques
  /fr.ts              # Français
  /en.ts              # Anglais

/e2e                  # Tests Playwright
  /home.spec.ts
  /projets.spec.ts
  /compositeurs.spec.ts
  /expertises.spec.ts
  /contact.spec.ts
```

### Internationalisation (i18n)

Le site supporte FR et EN via routing basé sur locale : `/fr/projets`, `/en/projects`.

**Système dual** :
1. **Contenu statique** : Dictionnaires TypeScript (`/dictionaries/fr.ts`, `/dictionaries/en.ts`)
2. **Contenu dynamique** : Champs translatables en base Prisma (`titleFr`, `titleEn`, `descriptionFr`, etc.)

**Pattern utilisé** :
```tsx
// Côté serveur (async component)
import { getDictionary } from '@/lib/i18n'

export default async function Page({ params }: { params: { locale: string } }) {
  const dict = await getDictionary(params.locale)
  return <h1>{dict.home.title}</h1>
}

// Requêtes Prisma
const works = await prisma.work.findMany({
  select: {
    slug: true,
    titleFr: true,
    titleEn: true,
    // ...
  }
})

// Affichage conditionnel
const title = locale === 'fr' ? work.titleFr : work.titleEn
```

**Redirections permanentes (301)** : Portfolio → Projets, Artistes → Compositeurs.

### Patterns Next.js

**Server Components par défaut** :
- Toutes les pages principales sont async Server Components
- Fetch data directement dans les composants avec Prisma
- Utiliser `React.cache()` pour déduplication requêtes

**Client Components ("use client")** :
- Interactivité (filtres, modales, animations)
- Components shadcn/ui nécessitant hooks
- Forms avec state management

**Métadonnées dynamiques** :
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = await getDictionary(params.locale)
  return {
    title: dict.projets.meta.title,
    description: dict.projets.meta.description,
  }
}
```

**Static Site Generation (SSG)** :
```tsx
export async function generateStaticParams() {
  const works = await prisma.work.findMany({ where: { isPublished: true } })
  return works.flatMap(work =>
    LOCALES.map(locale => ({ locale, slug: work.slug }))
  )
}
```

### Base de données (Prisma)

**Modèles principaux** :

1. **Asset** : Stockage centralisé images
   - Relations polymorphes : works, categories, labels, composers, expertises
   - Blur data URLs pour placeholders
   - Métadonnées : width, height, size

2. **Work** : Œuvres musicales (500+)
   - Traductions : `titleFr/En`, `descriptionFr/En`, `roleFr/En`
   - Relations : `coverImage`, `images[]`, `contributions[]`, `category`, `label`
   - Métadonnées : `year`, `duration`, `genre`, `isrc`

3. **Composer** : Compositeurs/artistes
   - Traductions : `nameFr/En`, `bioFr/En`
   - Relations : `contributions[]`, `links[]`, `image`

4. **Category** : Catégories (Musique, Documentaire, etc.)
   - `color`, `icon`, `order`, `isActive`

5. **Label** : Maisons de production

6. **Contribution** : Junction table Work ↔ Composer
   - `role` : composer, conductor, performer
   - `order` : tri affiçhage

7. **Expertise** : Pages contenu markdown
   - Content divisé en sections délimitées par `<!-- section:end -->`

**Pattern de requête recommandé** :
```tsx
import { cache } from 'react'
import { prisma } from '@/lib/prisma'

// Déduplication automatique côté serveur
export const getWorks = cache(async (locale: string) => {
  return prisma.work.findMany({
    where: { isPublished: true },
    include: {
      coverImage: true,
      category: true,
      label: true,
      contributions: {
        include: { composer: true },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { year: 'desc' }
  })
})
```

**Important** : Toujours inclure les relations nécessaires (coverImage, category, etc.) pour éviter N+1 queries.

### API Routes

**Routes publiques** :
- `GET /api/projets?locale=fr&limit=N` : Liste works avec filtrage optionnel (category, label)
- `GET /api/categories?locale=fr` : Catégories actives
- `GET /api/composers?locale=fr` : Tous les compositeurs
- `GET /api/expertises?locale=fr` : Expertises publiées
- `POST /api/contact` : Formulaire contact (envoie email via Resend)

**Routes admin (protégées)** :
- `GET/POST /api/admin/projects` : CRUD works
- `PATCH/DELETE /api/admin/projects/[id]`
- `GET/POST /api/admin/composers` : CRUD compositeurs
- `PATCH/DELETE /api/admin/composers/[id]`
- `GET/POST /api/admin/categories` : CRUD catégories
- `GET/POST /api/admin/labels` : CRUD labels
- `POST /api/admin/upload` : Upload image vers Vercel Blob

**Pattern validation** :
```tsx
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10)
})

export async function POST(req: Request) {
  const body = await req.json()
  const data = contactSchema.parse(body) // Throws si invalide
  // ...
}
```

### Gestion des images

**Flow upload** :
1. Upload vers Vercel Blob via `/api/admin/upload`
2. Génération blur placeholder avec Sharp
3. Stockage Asset en base avec `blurDataUrl`, `width`, `height`
4. Association à Work/Composer/Expertise via relation

**Pattern d'affichage** :
```tsx
import Image from 'next/image'

<Image
  src={work.coverImage.url}
  alt={locale === 'fr' ? work.titleFr : work.titleEn}
  width={work.coverImage.width}
  height={work.coverImage.height}
  placeholder="blur"
  blurDataURL={work.coverImage.blurDataUrl}
/>
```

### Styling (Tailwind + shadcn/ui)

**Couleur signature** : Neon yellow `#d5ff0a` (var `--primary`)

**Composants shadcn/ui** :
- Style : New York
- Icons : Lucide React
- Aliases : `@/components/ui`, `@/lib/utils`

**Configuration** : `components.json`, Tailwind CSS 4 avec `@tailwindcss/postcss`

### Tests E2E (Playwright)

**Organisation** :
- 5 spec files dans `/e2e/`
- Config : `playwright.config.ts`
- Base URL : `http://localhost:3000` (configurable via env)

**Exécution** :
- Parallélisation : 2 workers en local, sharding 2 en CI
- Screenshots on failure, traces on retry
- HTML reporter en local, GitHub en CI

**Pattern de test** :
```tsx
test('should display works gallery', async ({ page }) => {
  await page.goto('/fr/projets')
  await expect(page.getByRole('heading', { name: 'Projets' })).toBeVisible()
  const workCards = page.getByTestId('work-card')
  await expect(workCards).toHaveCount(await workCards.count())
})
```

**Important** : Toujours démarrer le serveur Next.js (`pnpm dev`) avant de lancer les tests.

### CI/CD (GitHub Actions)

**Pipeline `.github/workflows/ci.yml`** :
1. **Lint & Type Check** : ESLint + tsc strict
2. **Prisma Validation** : format, validate, migrate diff
3. **Build** : Next.js build avec cache
4. **E2E Tests** : Playwright (sharded 1/2 + 2/2)
   - ⚠️ Conditionnels : uniquement sur PR ou `[e2e]` dans commit message
5. **CI Success Summary**
6. **Deploy Ready** (main/master uniquement)

**Environment CI** :
- Node 20, pnpm 9
- PostgreSQL via DATABASE_URL
- Timeout : 10-30 min par job

**Déploiement** : Automatique sur Vercel (main/master)

### Variables d'environnement

```bash
# Base de données (Neon PostgreSQL)
DATABASE_URL="postgresql://..."        # Connection pooling
DIRECT_URL="postgresql://..."          # Direct connection (migrations)

# Site
NEXT_PUBLIC_SITE_URL="https://carolinesenyk.fr"

# Email (Resend)
RESEND_API_KEY="re_..."

# Stockage images (optionnel, local en dev)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### Conventions de code

**TypeScript** :
- Strict mode activé
- Prefer `type` over `interface` (eslint rule)
- Types Prisma : `WorkWithDetails = Prisma.WorkGetPayload<{ include: { ... } }>`

**Nommage** :
- Composants : PascalCase
- Server components : async functions
- Client components : prefix `"use client"`
- Helpers : camelCase
- Constants : UPPER_SNAKE_CASE

**Imports** :
- Aliases : `@/` → racine projet
- `import type` pour imports types uniquement
- Ordre : Next.js, React, external, internal, types

**Performance** :
- `React.cache()` pour déduplication requêtes serveur
- `generateStaticParams` pour SSG
- Image optimization avec `next/image`
- Lazy loading composants lourds

**Sécurité** :
- `server-only` pour libs sensibles
- Validation Zod sur tous POST/PATCH
- Password hashing avec bcryptjs
- Sanitization input utilisateur

### Points d'attention

1. **Hydration** : `suppressHydrationWarning` sur `<html>` et `<body>` nécessaire pour i18n

2. **Locales** : Toujours vérifier que `params.locale` est valide (`fr` ou `en`), fallback sur `fr`

3. **Traductions** : Toujours fournir FR et EN pour les champs translatables en base

4. **Relations Prisma** : Toujours inclure les relations nécessaires pour éviter N+1 queries

5. **Images** : Toujours générer blur placeholder lors de l'upload

6. **Tests E2E** : Ne s'exécutent qu'avec `[e2e]` dans le message de commit ou sur PR

7. **Migrations** : Toujours tester avec `pnpm db:migrate:check` avant de commit

8. **Build** : Vérifier que le build passe (`pnpm build`) avant de push

### Ressources utiles

- Next.js 16 docs : https://nextjs.org/docs
- Prisma docs : https://www.prisma.io/docs
- shadcn/ui : https://ui.shadcn.com
- Playwright : https://playwright.dev
- Tailwind CSS 4 : https://tailwindcss.com

### Contact

Projet développé pour Caroline Senyk (https://carolinesenyk.fr)
