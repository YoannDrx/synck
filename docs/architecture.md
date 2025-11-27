# Architecture Synck

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│  Next.js App Router + React 19 + Tailwind CSS 4             │
├─────────────────────────────────────────────────────────────┤
│                         API                                  │
│  /api/public/* (REST)    │    /api/admin/* (Protected)      │
├─────────────────────────────────────────────────────────────┤
│                      DATABASE                                │
│  PostgreSQL (Neon) + Prisma ORM 6.19                        │
├─────────────────────────────────────────────────────────────┤
│                      STORAGE                                 │
│  Vercel Blob (images) + Local disk fallback                 │
└─────────────────────────────────────────────────────────────┘
```

## Structure des dossiers

```
/app
├── [locale]/           # Routes i18n (fr, en)
│   ├── page.tsx        # HomePage
│   ├── projets/        # Galerie works
│   ├── artistes/       # Liste artistes
│   ├── expertises/     # Pages expertise
│   ├── blog/           # Blog
│   ├── contact/        # Formulaire contact
│   └── admin/          # Panel admin (protege)
└── api/                # API Routes REST
    ├── auth/           # Better Auth
    ├── contact/        # Formulaire public
    ├── projets/        # Works publiques
    └── admin/          # CRUD protege

/components
├── ui/                 # shadcn/ui primitives (24 composants)
├── admin/              # Composants admin
├── cards/              # Cards (Work, Artist, etc.)
├── layout/             # Header, Footer, Nav
├── motion/             # Animations Framer Motion
└── sections/           # Sections pages (Hero, Gallery)

/lib
├── prisma.ts           # Client Prisma singleton
├── auth.ts             # Config Better Auth
├── i18n-config.ts      # Config i18n
└── utils.ts            # Utilitaires generaux

/prisma
├── schema.prisma       # Schema base de donnees
├── migrations/         # 20 migrations SQL
└── seed.ts             # Script de seed
```

## Modeles Prisma

### Entites principales

- **Work**: Oeuvres musicales (500+)
- **Artist**: Compositeurs/artistes
- **Category**: Categories (Musique, Documentaire, etc.)
- **Label**: Maisons de production
- **Expertise**: Pages contenu markdown
- **Asset**: Images centralisees

### Relations

- Work → Category (1:N)
- Work → Label (1:N)
- Work ↔ Artist via Contribution (N:M)
- Work → Asset (coverImage, images[])

## Authentification

- **Framework**: Better Auth 1.4.0
- **Sessions**: 7 jours, refresh quotidien
- **2FA**: TOTP (optionnel)
- **Protection**: Middleware `proxy.ts` sur `/[locale]/admin/*`

## Internationalisation

### Systeme dual

1. **Statique**: Dictionnaires TypeScript (`/dictionaries/fr.ts`, `/dictionaries/en.ts`)
2. **Dynamique**: Champs Prisma `*Fr/*En` ou `translations[]`

### Routes

- `/fr/*` - Francais (defaut)
- `/en/*` - Anglais
