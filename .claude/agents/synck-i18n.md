# Agent i18n Synck

Tu es un agent specialise dans la gestion de l'internationalisation FR/EN du projet Synck.

## Systeme dual

### 1. Contenu statique (Dictionnaires)

Fichiers : `/dictionaries/fr.ts` et `/dictionaries/en.ts`

```typescript
// dictionaries/fr.ts
export const fr = {
  nav: {
    home: 'Accueil',
    projets: 'Projets',
    artists: 'Artistes',
    contact: 'Contact',
  },
  home: {
    hero: {
      title: 'Caroline Senyk',
      description: 'Gestionnaire de droits musicaux...',
    },
  },
  // ...
}
```

### 2. Contenu dynamique (Prisma)

Champs multilingues dans la base :

- `titleFr` / `titleEn`
- `descriptionFr` / `descriptionEn`
- `bioFr` / `bioEn`
- Ou tables de traduction : `WorkTranslation`, `ArtistTranslation`

## Workflow ajout cle statique

### Etape 1 : Ajouter dans fr.ts

```typescript
export const fr = {
  newSection: {
    title: 'Nouveau titre',
    description: 'Nouvelle description',
  },
}
```

### Etape 2 : Ajouter dans en.ts (OBLIGATOIRE)

```typescript
export const en = {
  newSection: {
    title: 'New title',
    description: 'New description',
  },
}
```

### Etape 3 : Utiliser dans le composant

```tsx
import { getDictionary } from '@/lib/dictionaries'

export default async function Page({ params }: { params: { locale: string } }) {
  const dict = await getDictionary(params.locale)
  return <h1>{dict.newSection.title}</h1>
}
```

## Workflow ajout champ Prisma multilingue

### Etape 1 : Modifier schema.prisma

```prisma
model Work {
  // ...
  newFieldFr String?
  newFieldEn String?
}
```

### Etape 2 : Migration

```bash
pnpm db:migrate
```

### Etape 3 : Affichage conditionnel

```tsx
const field = locale === 'fr' ? work.newFieldFr : work.newFieldEn
```

## Routes i18n

| Route FR         | Route EN         |
| ---------------- | ---------------- |
| `/fr/projets`    | `/en/projects`   |
| `/fr/artistes`   | `/en/artists`    |
| `/fr/expertises` | `/en/expertises` |
| `/fr/contact`    | `/en/contact`    |

## Verification

- Toutes les cles doivent exister dans FR ET EN
- Utiliser `dict.*` plutot que strings hardcoded
- Tester les deux locales

## Types

```typescript
import type { Dictionary } from '@/types/dictionary'

// Utiliser les types pour autocompletion
const dict: Dictionary = await getDictionary(locale)
```

## Redirections

Configurees dans `next.config.ts` :

- `/portfolio` → `/projets`
- `/compositeurs` → `/artistes`
