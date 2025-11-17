# 🚀 Guide de Migration Neon + Prisma pour Synck

**Date** : 16 novembre 2025
**Projet** : `/Users/yoannandrieux/Projets/synck`
**Base de données** : Neon PostgreSQL (même instance que portfolio-caro)

---

## ✅ Étapes déjà complétées

### 1. Fichiers copiés depuis portfolio-caro

**✅ Dossier `prisma/`** (complet)
- `prisma/schema.prisma` - Schéma complet avec 9 modèles
- `prisma/seed.ts` - Script de migration des données
- `prisma/migrations/` - Historique des migrations

**✅ Bibliothèques `lib/`**
- `lib/prisma.ts` - Singleton Prisma Client
- `lib/prismaPortfolioUtils.ts` - Fonctions utilitaires Prisma

**✅ Configuration**
- `.env` - Variables d'environnement DATABASE_URL et DIRECT_URL
- `package.json` - Scripts Prisma ajoutés :
  - `npm run db:seed` - Seed de la base de données
  - `npm run db:studio` - Interface graphique Prisma
  - `npm run db:migrate` - Migrations de schéma
  - `npm run db:generate` - Génération du Prisma Client

### 2. Dépendances installées

✅ `@prisma/client@6.19.0`
✅ `prisma@6.19.0`
✅ `ts-node@10.9.2` (dev)

### 3. Prisma Client généré

✅ Le Prisma Client a été généré et est prêt à être utilisé

---

## 📊 Base de données actuelle

Vous utilisez la **même instance Neon** que portfolio-caro :
- **Project ID**: `old-brook-39127538`
- **Région**: `aws-eu-central-1` (Francfort, EU)
- **Données**: 185 works, 65 compositeurs, 5 catégories

### Données disponibles

```typescript
// 5 Catégories
- Album de librairie musicale (Music library album)
- Documentaire (Documentary)
- Série (Series)
- Courts métrages (Short films)
- Clip musical (Music video)

// 65 Compositeurs uniques
- Laurent Dury, Ducer, Charlie May, ABID...

// 185 Works (projets portfolio)
- Minimal Stories, EDM From Paris, Blood Sex & Royalty...
```

---

## 🎯 Prochaines étapes à réaliser

### Étape 1 : Adapter le contenu actuel

Vous avez actuellement des données hardcodées dans `lib/data.ts` :

```typescript
// Actuellement :
export const projectShowcase: Project[] = [
  {
    name: "Pulse Bloom",
    subtitle: "Immersive wellness corridors",
    description: "...",
    cycle: "CYCLE 04",
    accent: "from-emerald-400 via-lime-300 to-yellow-300",
    tags: ["Biofeedback", "Sound design", "Spatial UI"],
  },
  // ...
]
```

**Option A** : Migrer ces données vers Prisma (recommandé)
**Option B** : Garder ces données en dur et utiliser Prisma uniquement pour les données Caroline

### Étape 2 : Si vous choisissez Option A - Créer un nouveau seed

Créer un fichier `prisma/seed-synck.ts` qui :
1. Vide la base de données actuelle
2. Insère vos propres données (projects, experiments, etc.)
3. Adapte le schéma Prisma si besoin

### Étape 3 : Si vous choisissez Option B - Créer des utilitaires hybrides

Créer `lib/dataUtils.ts` qui :
1. Combine les données hardcodées ET Prisma
2. Permet de basculer progressivement vers Prisma

---

## 🔧 Commandes utiles

```bash
# Se déplacer dans le projet synck
cd /Users/yoannandrieux/Projets/synck

# Voir la base de données (interface graphique)
npm run db:studio

# Générer le Prisma Client (après modification du schema)
npm run db:generate

# Créer une migration (après modification du schema.prisma)
npm run db:migrate

# Seed de la base (données Caroline actuelle)
npm run db:seed

# Dev server
npm run dev
```

---

## 📝 Exemple d'utilisation de Prisma dans synck

### Option 1 : Utiliser les données Caroline existantes

```typescript
// Dans app/page.tsx ou components/sections/projects-section.tsx
import { getPortfolioWorksFromPrisma } from '@/lib/prismaPortfolioUtils'

export default async function ProjectsSection() {
  // Récupère les 185 works de Caroline depuis Neon
  const carolineWorks = await getPortfolioWorksFromPrisma('fr')

  return (
    <section>
      {carolineWorks.map(work => (
        <div key={work.id}>
          <h3>{work.title}</h3>
          <p>{work.category}</p>
        </div>
      ))}
    </section>
  )
}
```

### Option 2 : Créer vos propres utilitaires

```typescript
// lib/synckDataUtils.ts
import { prisma } from './prisma'
import { cache } from 'react'

export const getSynckProjects = cache(async () => {
  const projects = await prisma.work.findMany({
    where: {
      // Filtrer uniquement vos projets (par exemple avec une catégorie spécifique)
      category: {
        slug: 'synck-projects'
      }
    },
    include: {
      coverImage: true,
      translations: {
        where: { locale: 'en' }
      }
    }
  })

  return projects
})
```

---

## 🎨 Adapter le schéma Prisma à votre design

### Votre structure actuelle (lib/data.ts)

```typescript
interface Project {
  name: string
  subtitle: string
  description: string
  cycle: string        // "CYCLE 04"
  accent: string       // "from-emerald-400..."
  tags: string[]
}

interface Experiment {
  name: string
  type: string
  visual: string       // gradient colors
  stack: string[]
}
```

### Adapter le modèle Work dans Prisma

Vous pourriez ajouter des champs à `prisma/schema.prisma` :

```prisma
model Work {
  // ... champs existants

  // Nouveaux champs pour synck
  cycle        String?  // Ex: "CYCLE 04"
  accentFrom   String?  // Ex: "emerald-400"
  accentVia    String?  // Ex: "lime-300"
  accentTo     String?  // Ex: "yellow-300"
  visualType   String?  // Ex: "gradient", "image", etc.
  stackItems   String[] // Ex: ["Biofeedback", "Sound design"]

  // Ou stocker en JSON
  metadata     Json?    // Peut contenir n'importe quoi
}
```

Puis exécuter :
```bash
npm run db:migrate
```

---

## 🤔 Questions à vous poser

1. **Voulez-vous garder les données Caroline ou les remplacer ?**
   - Garder → Utiliser les utilitaires existants
   - Remplacer → Créer un nouveau seed

2. **Voulez-vous un CMS admin pour gérer vos projets ?**
   - Oui → Je peux créer un `/admin` avec formulaires Prisma
   - Non → Gérer les données via JSON/fichiers

3. **Voulez-vous internationalisation (FR/EN) ?**
   - Oui → Utiliser le système de traductions Prisma existant
   - Non → Simplifier le schéma

4. **Images : où les stocker ?**
   - Option A : `/public/images` (actuel)
   - Option B : Cloudinary / Vercel Blob
   - Option C : R2 Cloudflare

---

## 📚 Ressources

- **Prisma Docs** : https://www.prisma.io/docs
- **Neon Console** : https://console.neon.tech
- **Prisma Studio** : `npm run db:studio` (http://localhost:5555)
- **Guide complet** : `/Users/yoannandrieux/Projets/portfolio-caro/docs/PRISMA_SETUP.md`

---

## 🆘 Besoin d'aide ?

**Étapes recommandées** :

1. Ouvrir Prisma Studio pour visualiser les données :
   ```bash
   cd /Users/yoannandrieux/Projets/synck
   npm run db:studio
   ```

2. Décider si vous voulez :
   - **Garder les données Caroline** et créer vos propres catégories/works
   - **Remplacer** par vos propres données

3. Me dire ce que vous voulez faire et je vous aide à l'implémenter ! 🚀
