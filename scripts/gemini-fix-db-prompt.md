# Mission : Réparer la base de données après migration Legacy → Full DB

## 🎯 Objectif

Je viens de migrer mon portfolio professionnel d'un système legacy (JSON + fichiers statiques) vers un système full database avec Prisma + PostgreSQL. La migration a introduit des problèmes de chemins d'images et de nommage que je dois corriger.

**Besoin** : Aide pour créer des scripts de correction robustes et une stratégie de migration sécurisée.

---

## 📋 Contexte de la migration

### Timeline (16-19 novembre 2025)

**Commits clés :**

1. **16 nov** : Migration initiale Prisma (création schéma complet)
2. **17 nov** : Ajout système d'authentification Better Auth
3. **18 nov 10h** : **MIGRATION MAJEURE** Portfolio → Projets
   - Renommage routes : `/[locale]/portfolio/` → `/[locale]/projets/`
   - Renommage dossier images : `/images/portfolio/` → `/images/projets/`
   - 34 fichiers modifiés, 3237 insertions, 2633 suppressions
4. **18 nov 11h** : Backup DB créé (`synck_backup_2025-11-18T11-51-45.json`)
5. **18 nov 14h** : Refonte Artists → Composers
6. **18 nov 15h** : Scripts de migration legacy + suppression ancien code
7. **19 nov 12h** : Fix normalisation chemins images (tentative incomplète)

### Changements structurels majeurs

| Avant (Legacy) | Après (Full DB Prisma) |
|----------------|------------------------|
| JSON `metadata.json` | Tables relationnelles + Translations |
| `titleFr`/`titleEn` directs dans JSON | `WorkTranslation` (locale, title, description) |
| Artistes | Composers + ComposerTranslation |
| Portfolio | Projets (Works) |
| Liens externes simples | ComposerLink (multi-plateformes) |
| Images non trackées | Asset centralisé avec blurDataUrl |
| `/images/portfolio/` | `/images/projets/` |

---

## 📊 Situation actuelle

### Sauvegarde de référence

**Fichier** : `backups/synck_backup_2025-11-18T11-51-45.json`
**Date** : 18 novembre 2025, 11:51:45
**Version** : 1.0.0

**Statistiques** :
- **Users** : 1 admin
- **Assets** : 312 chemins (TOUS avec `/images/portfolio/`)
- **Categories** : 6 catégories
- **Labels** : 5 labels
- **Composers** : 65 compositeurs
- **Works** : 251 projets
- **Contributions** : Relations Work ↔ Composer

### Fichiers réels sur disque

**Localisation** : `/public/images/projets/`
**Total** : 416 fichiers

**Structure** :
```
/public/images/projets/
├── albums/          (27 fichiers - PGO0022.jpg, PGO0023.jpg, etc.)
├── clips/           (18 fichiers - Acid.png, Ailleurs.png, etc.)
├── documentaires/   (265 fichiers)
│   ├── 13prods/     (119 fichiers)
│   ├── ligne-de-mire/
│   ├── little-big-story/
│   ├── pop-films/
│   └── via-decouvertes-films/
├── evenements/      (9 fichiers)
├── photosCompo/     (67 fichiers - LaurentDury.jpeg, DUCER.jpeg, etc.)
├── photosynchro/    (21 fichiers)
└── vinyles/         (9 fichiers)
```

**Écart** : +104 fichiers non trackés en DB (fichiers template, duplicatas ?)

---

## 🚨 Problèmes identifiés (par ordre de gravité)

### 🔴 CRITIQUE #1 : Chemins obsolètes (312 assets concernés)

**Problème** : TOUS les chemins en DB utilisent encore `/images/portfolio/` au lieu de `/images/projets/`

**Exemples concrets** :

| Base de données (backup 18/11) | Fichier réel | Status |
|-------------------------------|--------------|--------|
| `/images/portfolio/photosCompo/LaurentDury.jpeg` | `/images/projets/photosCompo/LaurentDury.jpeg` | ❌ Préfixe incorrect |
| `/images/portfolio/albums/pgo0022.jpg` | `/images/projets/albums/PGO0022.jpg` | ❌ Préfixe + casse |
| `/images/portfolio/clips/Acid.png` | `/images/projets/clips/Acid.png` | ❌ Préfixe seulement |

**Impact** : Les images ne se chargent pas car Next.js cherche dans `/public/images/portfolio/` qui n'existe plus.

**Code actuel (seed.ts, lignes 15-27)** :
```typescript
function normalizeImagePath(imagePath: string | undefined | null): string | null {
  if (!imagePath) return null;

  const normalized = imagePath
    .replace("/images/portfolio/", "/images/projets/")
    .replace(/\.jpeg$/i, ".jpg")
    .toLowerCase(); // ⚠️ PROBLÈME : Met tout en minuscules !

  return normalized;
}
```

**Problème du `.toLowerCase()`** :
- Fichier réel : `/images/projets/albums/PGO0022.jpg` (MAJUSCULES)
- Après normalisation : `/images/projets/albums/pgo0022.jpg` (minuscules)
- Résultat : ❌ Image non trouvée !

---

### 🟠 HAUTE #2 : Problèmes de casse multiples

**Le projet utilise des conventions de nommage MIXTES** (aucune cohérence) :

#### Albums (27 fichiers)
```
Fichiers réels : PGO0022.jpg, PGO0023.jpg, PGO0024.jpg (MAJUSCULES)
DB (normalized) : pgo0022.jpg, pgo0023.jpg (minuscules après seed)
```

#### Photos compositeurs (67 fichiers)
```
2080.jpeg          ← Nombres seulement
9oClock.jpeg       ← camelCase
AeonSeven.jpeg     ← PascalCase
DUCER.jpeg         ← UPPERCASE
LaurentDury.jpeg   ← PascalCase
dDamage.jpeg       ← Première lettre minuscule !
```

#### Clips (18 fichiers)
```
Acid.png                                      ← PascalCase
alien-suites-remixes.png                      ← kebab-case
egocentric visuo-spatial perspective.png      ← ESPACES dans le nom !
Modulhater-Klang-Brutt.png                   ← PascalCase + tirets
```

#### Documentaires (265 fichiers)
```
la-greve-du-siecle.JPG          ← Extension MAJUSCULE
les-femmes-du-IIIeme-reich.JPG  ← Extension MAJUSCULE
pas-folle-la-liberte.jpg        ← Extension minuscule
marcus-klingberg-un-pur-espion2.JPG  ← Suffixe numérique
```

**Impact** : Impossible de normaliser avec un simple `.toLowerCase()` sans créer des 404.

---

### 🟡 MOYENNE #3 : Extensions multiples (.jpg, .JPG, .jpeg, .JPEG, .png, .PNG)

**Problème** : Le regex `/\.jpeg$/i` dans seed.ts ne capture que les fichiers finissant par `.jpeg` mais ne gère pas :
- Les fichiers `.JPEG` (majuscules complètes)
- Les fichiers au milieu d'un path avec querystring
- Les fichiers `.JPG` (qui ne devraient PAS être convertis en `.jpg`)

**Exemples** :
```
Fichier réel : photo1-droitsdauteur.jpeg  ← Devrait être .jpg
Fichier réel : la-greve-du-siecle.JPG    ← Devrait RESTER .JPG
```

---

### 🟢 BASSE #4 : Métadonnées manquantes

Beaucoup d'assets n'ont pas :
- `blurDataUrl` (placeholders pour chargement progressif)
- `width`, `height` (dimensions)
- `aspectRatio` (ratio calculé)

**Impact** : Expérience utilisateur dégradée (pas de placeholders floutés pendant le chargement).

---

## 🗂️ Données techniques

### Schéma Prisma actuel (extrait)

```prisma
model Asset {
  id          String   @id @default(cuid())
  path        String   @unique
  alt         String?
  blurDataUrl String?  @db.Text
  width       Int?
  height      Int?
  aspectRatio Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations polymorphes
  workImages      Work[]      @relation("WorkImages")
  workCover       Work[]      @relation("WorkCover")
  composerImages  Composer[]  @relation("ComposerImages")
  // ...
}

model Work {
  id           String   @id @default(cuid())
  slug         String   @unique
  categoryId   String
  coverImageId String?
  coverImage   Asset?   @relation("WorkCover", fields: [coverImageId], references: [id])
  // ...

  translations  WorkTranslation[]
  contributions Contribution[]
  images        Asset[]           @relation("WorkImages")
}

model WorkTranslation {
  id          String  @id @default(cuid())
  workId      String
  locale      String  // 'fr' or 'en'
  title       String
  description String? @db.Text
  role        String?

  work Work @relation(fields: [workId], references: [id], onDelete: Cascade)

  @@unique([workId, locale])
}
```

### Exemples de la sauvegarde JSON

**Asset typique** :
```json
{
  "id": "cmi1vf4p9009gskeju76b3mlt",
  "path": "/images/portfolio/albums/pgo0022.jpg",
  "alt": "Album PGO0022",
  "blurDataUrl": null,
  "width": null,
  "height": null,
  "aspectRatio": null,
  "createdAt": "2025-11-16T15:28:30.185Z",
  "updatedAt": "2025-11-16T15:28:30.185Z"
}
```

**Work avec traductions** :
```json
{
  "id": "cmi1vf4ta009iskej35rmfc0s",
  "slug": "minimal-stories",
  "categoryId": "cmi1venl40000skejyoxc60l4",
  "coverImageId": "cmi1vf4p9009gskeju76b3mlt",
  "year": 2019,
  "isActive": true,
  "translations": [
    {
      "locale": "fr",
      "title": "Minimal Stories",
      "description": "Album de musique minimaliste..."
    },
    {
      "locale": "en",
      "title": "Minimal Stories",
      "description": "Minimalist music album..."
    }
  ],
  "contributions": [
    {
      "composerId": "cmi1veof9000hskejejfo3d22",
      "role": "composer",
      "order": 0
    }
  ]
}
```

---

## 💡 Scripts de correction fournis (à améliorer)

### Script SQL simple (correction préfixe)

```sql
-- Correction immédiate des 312 chemins
UPDATE "Asset"
SET path = REPLACE(path, '/images/portfolio/', '/images/projets/')
WHERE path LIKE '/images/portfolio/%';
```

**Avantages** : Rapide, atomique
**Inconvénients** : Ne résout pas les problèmes de casse

### Script TypeScript complet (correction + métadonnées)

```typescript
// scripts/fix-all-image-issues.ts
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import imageSize from 'image-size'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Starting image path fixes...\n')

  // 1. Fix portfolio → projets prefix
  const updated = await prisma.$executeRaw`
    UPDATE "Asset"
    SET path = REPLACE(path, '/images/portfolio/', '/images/projets/')
    WHERE path LIKE '/images/portfolio/%'
  `
  console.log(`✅ Updated ${updated} asset paths\n`)

  // 2. Process all assets
  const assets = await prisma.asset.findMany()
  let fixed = 0
  let missing = 0

  for (const asset of assets) {
    const fullPath = path.join(process.cwd(), 'public', asset.path)

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Missing: ${asset.path}`)
      missing++

      // TODO: Essayer variantes de casse ?
      continue
    }

    const updates: any = {}

    // Add dimensions if missing
    if (!asset.width || !asset.height) {
      const dims = imageSize(fullPath)
      updates.width = dims.width
      updates.height = dims.height
      updates.aspectRatio = dims.width && dims.height ? dims.width / dims.height : null
    }

    // Add blur placeholder if missing
    if (!asset.blurDataUrl) {
      const buffer = await sharp(fullPath)
        .resize(20, 20, { fit: 'inside' })
        .blur()
        .toBuffer()
      updates.blurDataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
    }

    if (Object.keys(updates).length > 0) {
      await prisma.asset.update({
        where: { id: asset.id },
        data: updates
      })
      fixed++
    }
  }

  console.log(`\n✅ Fixed ${fixed} assets`)
  console.log(`⚠️  ${missing} missing files`)
  console.log('\n🎉 Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Problème actuel** : Ne gère pas les variantes de casse (pgo0022.jpg vs PGO0022.jpg).

---

## ❓ Questions pour Gemini

### 1. Stratégie de correction globale

Quelle approche recommandes-tu ?

**Option A** : SQL direct en production
```sql
UPDATE "Asset" SET path = REPLACE(path, '/images/portfolio/', '/images/projets/');
```

**Option B** : Script TypeScript avec validation
```typescript
// Vérifier existence fichier avant update
// Essayer variantes casse si 404
// Logger toutes les corrections
```

**Option C** : Migration Prisma + seed
```typescript
// Créer migration Prisma
// Re-seeder avec normalisation améliorée
```

**Quelle option est la plus sûre ?** Comment gérer le rollback en cas d'erreur ?

---

### 2. Gestion robuste de la casse

Comment créer un **mapping automatique** qui gère toutes les variantes ?

**Exemples de variantes possibles** :
```
DB : /images/projets/albums/pgo0022.jpg

Fichiers réels possibles :
- /images/projets/albums/PGO0022.jpg  ← MAJUSCULES
- /images/projets/albums/pgo0022.jpg  ← minuscules
- /images/projets/albums/Pgo0022.jpg  ← PascalCase
- /images/projets/albums/PGO0022.JPG  ← Extension majuscule
```

**Algorithme souhaité** :
1. Normaliser préfixe portfolio → projets
2. Extraire nom fichier de base
3. Chercher fichier réel (case-insensitive)
4. Utiliser le chemin EXACT du fichier trouvé
5. Mettre à jour DB avec chemin réel

**Comment implémenter cela efficacement ?**

---

### 3. Normalisation améliorée (seed.ts)

Le `.toLowerCase()` actuel est trop agressif. Quelle approche pour :

✅ Convertir `/images/portfolio/` → `/images/projets/`
✅ Gérer `.jpeg` → `.jpg` (seulement si fichier n'existe pas en .jpeg)
❌ **NE PAS** modifier la casse du nom de fichier
❌ **NE PAS** modifier `.JPG` → `.jpg`

**Proposition** :
```typescript
function normalizeImagePath(imagePath: string, filesIndex: Map<string, string>): string | null {
  if (!imagePath) return null;

  // 1. Fix préfixe
  let normalized = imagePath.replace("/images/portfolio/", "/images/projets/");

  // 2. Chercher fichier exact (case-sensitive)
  if (filesIndex.has(normalized)) {
    return filesIndex.get(normalized);
  }

  // 3. Chercher variantes (case-insensitive)
  const basename = path.basename(normalized).toLowerCase();
  for (const [key, value] of filesIndex.entries()) {
    if (path.basename(key).toLowerCase() === basename) {
      return value; // Retourner chemin exact du fichier
    }
  }

  // 4. Essayer .jpeg → .jpg
  const withJpg = normalized.replace(/\.jpeg$/i, '.jpg');
  if (filesIndex.has(withJpg)) {
    return filesIndex.get(withJpg);
  }

  console.warn(`⚠️ Fichier introuvable : ${imagePath}`);
  return normalized; // Retourner quand même (pour debugging)
}
```

**Est-ce la bonne approche ?** Y a-t-il des edge cases à gérer ?

---

### 4. Génération du mapping fichiers réels

Comment générer efficacement un `Map<string, string>` de TOUS les fichiers réels ?

**Besoin** :
- Scanner `/public/images/projets/**/*`
- Inclure TOUTES les extensions (jpg, JPG, jpeg, JPEG, png, PNG)
- Index par chemin relatif (depuis `/images/projets/`)
- Case-sensitive (garder casse exacte)

**Proposition** :
```typescript
import { glob } from 'glob'

async function generateFilesIndex(): Promise<Map<string, string>> {
  const files = await glob('public/images/projets/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}', {
    nocase: false, // Case-sensitive
    absolute: false
  })

  const index = new Map<string, string>()

  for (const file of files) {
    const relativePath = file.replace('public', '')
    index.set(relativePath, relativePath)

    // Index aussi par nom de fichier seul (pour recherche flexible)
    const basename = path.basename(relativePath)
    index.set(basename.toLowerCase(), relativePath)
  }

  return index
}
```

**Optimisations possibles ?** Faut-il mettre en cache ?

---

### 5. Ordre d'exécution sécurisé

Quelle séquence pour minimiser les risques ?

**Proposition** :
```
1. Backup DB actuelle (pg_dump)
2. Générer mapping fichiers réels → index.json
3. Exécuter script de correction avec dry-run (logs seulement)
4. Vérifier logs manuellement
5. Exécuter script réel (update DB)
6. Régénérer Prisma Client (npx prisma generate)
7. Relancer app en dev (pnpm dev)
8. Tests manuels 5-10 pages
9. Tests E2E automatiques (Playwright)
10. Si OK → commit, sinon rollback (restore backup)
```

**Manque-t-il des étapes ?** Comment automatiser la validation ?

---

### 6. Validation automatique

Comment détecter automatiquement les futures incohérences ?

**Idées** :
- Script hebdomadaire vérifiant tous les assets
- Test Playwright vérifiant images de 10 works aléatoires
- CI check bloquant si asset en DB sans fichier réel
- Monitoring 404 en production (Sentry ?)

**Quel outil recommandes-tu ?** Comment l'intégrer au workflow ?

---

## 🎯 Résultats attendus

### Scripts à fournir

1. ✅ **Script de correction amélioré** (`fix-all-image-issues.ts`)
   - Gestion casse robuste
   - Variantes automatiques
   - Dry-run mode
   - Logs détaillés

2. ✅ **Fonction normalizeImagePath corrigée** (seed.ts)
   - Sans `.toLowerCase()` agressif
   - Avec mapping fichiers réels
   - Gestion extensions multiples

3. ✅ **Script de diagnostic** (`diagnostic-images.ts`)
   - Liste tous problèmes
   - Génère rapport JSON
   - Suggestions de correction

4. ✅ **Script de validation** (`validate-images.ts`)
   - Vérifie cohérence DB ↔ disque
   - Utilisable en CI

### Plan d'action étape par étape

1. Backup DB
2. Générer index fichiers réels
3. Corriger préfixe portfolio → projets (SQL)
4. Corriger casse (script TypeScript avec mapping)
5. Générer métadonnées (blurDataUrl, dimensions)
6. Validation (tests + audit visuel)
7. Commit + déploiement

### Recommandations long terme

- Convention de nommage unifiée ?
- Script de validation pré-commit ?
- Documentation workflow uploads ?

---

## 📎 Fichiers annexes fournis

- `backups/synck_backup_2025-11-18T11-51-45.json` (312 assets)
- `scripts/gemini-examples-data.json` (20 exemples concrets)
- `scripts/diagnostic-images.ts` (script de diagnostic)
- `prisma/schema.prisma` (schéma complet)

---

## 🙏 Merci Gemini !

J'ai besoin de ton expertise pour :
1. Valider la stratégie proposée
2. Améliorer les scripts fournis
3. Identifier les edge cases manqués
4. Proposer un plan d'action sécurisé

**Priorité** : Ne rien casser en production, corriger les 312 chemins obsolètes, gérer la casse de manière robuste.
