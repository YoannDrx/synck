# 🔍 BILAN COMPLET - SYSTÈME LEGACY

**Date**: 2025-11-18
**Analyse**: Système legacy vs. Prisma DB

---

## ✅ DÉJÀ MIGRÉ VERS PRISMA (100% DB)

Ces éléments sont **entièrement migrés** et **ne dépendent plus des fichiers Markdown** :

### 1. **Compositeurs (Composers)**
- ✅ **65 compositeurs** dans la DB
- ✅ Toutes les images liées
- ✅ Liens sociaux via table `ComposerLink`
- ✅ Contributions aux œuvres
- 📍 Page: `/[locale]/compositeurs`
- 📍 Lib: `lib/prismaProjetsUtils.ts` → `getComposersFromPrisma()`

### 2. **Projets / Œuvres (Works)**
- ✅ **186 œuvres** dans la DB
- ✅ Images de couverture (107 documentaires liés)
- ✅ Traductions (fr/en)
- ✅ Catégories, labels, genres
- ✅ Descriptions migrées depuis les fichiers MD
- 📍 Page: `/[locale]/projets`
- 📍 Lib: `lib/prismaProjetsUtils.ts` → `getWorksFromPrisma()`

### 3. **Catégories**
- ✅ **5 catégories** dans la DB
- ✅ Traductions
- ✅ Images de couverture
- 📍 API: `/api/categories`

### 4. **Labels**
- ✅ **Labels** dans la DB
- ✅ Images et métadonnées
- 📍 Intégré dans les œuvres

---

## ❌ ENCORE EN SYSTÈME LEGACY (Markdown)

Ces éléments utilisent **ENCORE les fichiers Markdown** et **n'ont PAS été migrés** vers Prisma :

### 1. **Blog / Articles** 🚨 LEGACY ACTIF

**Données**:
- 📁 **42 fichiers Markdown** dans `content/posts/`
- 🗄️ **0 entrées** dans la table Prisma `BlogPost`

**Code legacy**:
- 📄 `lib/blogUtils.ts` (102 lignes)
  - Fonctions: `getSortedPostsData()`, `getAllPostIds()`, `getPostData()`
  - Lit les fichiers `.md` avec `fs.readFileSync()`
  - Parse avec `gray-matter`
  - Convertit en HTML avec `remark`

**Utilisé par**:
- 🌐 `/api/blog/route.ts` → API pour récupérer les posts
- 🎨 `components/sections/experiments-section.tsx` → Section "Blog" sur la homepage
- 📍 **Aucune page de listing blog** (`app/[locale]/blog` n'existe pas!)
- 📍 **Aucune page détail d'article** (`app/[locale]/blog/[slug]` n'existe pas!)

**⚠️ Observation**: Le blog est en **demi-état** :
- Les fichiers Markdown existent
- Une API les expose
- Mais **aucune page publique** ne les affiche !
- Utilisé uniquement sur la homepage (3 derniers articles)

---

### 2. **Expertises** 🚨 LEGACY ACTIF

**Données**:
- 📁 **7 fichiers FR** dans `content/expertises/fr/`
- 📁 **7 fichiers EN** dans `content/expertises/en/`
- 🗄️ **0 entrées** dans la table Prisma `Expertise`

**Fichiers**:
```
content/expertises/fr/
├── dossier-subvention.md
├── droits-auteur.md
├── droits-voisins.md
├── gestion-administrative-et-editoriale.md
├── gestion-distribution.md
├── mise-en-page.md
└── sous-edition.md
```

**Code legacy**:
- 📄 `lib/expertiseUtils.ts` (178 lignes)
  - Fonctions: `getAllExpertises()`, `getExpertise()`, `getAllExpertiseSlugs()`
  - Lit les fichiers `.md` avec `fs.readFileSync()`
  - Parse avec `gray-matter`
  - Split le contenu en sections via délimiteurs

**Utilisé par**:
- 🌐 `/api/expertises/route.ts` → API pour récupérer les expertises
- 📄 `app/[locale]/expertises/page.tsx` → Page de listing
- 📄 `app/[locale]/expertises/[slug]/page.tsx` → Pages détails
- 🎨 `components/sections/expertises-section.tsx` → Section homepage

**✅ Pages complètes** : Listing + détails fonctionnels

---

### 3. **Descriptions de projets** 📦 LEGACY ARCHIVÉ

**Données**:
- 📁 **36 fichiers FR** dans `content/projets/fr/descriptions/`
- 📁 **36 fichiers EN** dans `content/projets/en/descriptions/`

**Statut**:
- ✅ **Migrées** vers `WorkTranslation.description`
- 📦 Fichiers conservés pour **archive/référence uniquement**
- 🔧 Utilisés par `scripts/migrate-legacy-data-complete.ts` et `prisma/seed.ts`
- ❌ **NON utilisés** par l'application en production

**→ Peuvent être supprimés** *(si migration confirmée complète)*

---

## 📊 RÉSUMÉ DES TABLES PRISMA

| Table | Entrées DB | Migration |
|-------|-----------|-----------|
| `Composer` | 65 | ✅ Complète |
| `Work` | 186 | ✅ Complète |
| `Category` | 5 | ✅ Complète |
| `Asset` | ~200+ | ✅ Complète |
| `BlogPost` | **0** | ❌ Pas migrée |
| `Expertise` | **0** | ❌ Pas migrée |

---

## 🗑️ FICHIERS ET DOSSIERS À SUPPRIMER

### Option 1: Supprimer TOUT le legacy (recommandé après migration Blog + Expertises)

```bash
# Supprimer le dossier content/ complet
rm -rf content/

# Supprimer les utils legacy
rm lib/blogUtils.ts
rm lib/expertiseUtils.ts

# Supprimer les API routes legacy
rm -rf app/api/blog/
rm -rf app/api/expertises/

# Supprimer les pages expertises legacy
rm -rf app/[locale]/expertises/
```

### Option 2: Supprimer uniquement les descriptions de projets (déjà migrées)

```bash
# Supprimer les descriptions MD (déjà en DB)
rm -rf content/projets/
```

---

## ⚠️ ACTIONS REQUISES AVANT SUPPRESSION

### 1. Migrer le Blog vers Prisma

**Étapes**:
1. Créer un script de migration `scripts/migrate-blog-to-prisma.ts`
2. Parser les 42 fichiers MD de `content/posts/`
3. Insérer dans `BlogPost` + `BlogPostTranslation`
4. Créer les pages `/[locale]/blog` et `/[locale]/blog/[slug]`
5. Remplacer `lib/blogUtils.ts` par `lib/prismaBlogUtils.ts`
6. Mettre à jour l'API `/api/blog/route.ts`
7. Mettre à jour `components/sections/experiments-section.tsx`

### 2. Migrer les Expertises vers Prisma

**Étapes**:
1. Créer un script de migration `scripts/migrate-expertises-to-prisma.ts`
2. Parser les 14 fichiers MD (7 FR + 7 EN)
3. Insérer dans `Expertise` + `ExpertiseTranslation`
4. Remplacer `lib/expertiseUtils.ts` par `lib/prismaExpertiseUtils.ts`
5. Mettre à jour l'API `/api/expertises/route.ts`
6. Mettre à jour les pages `/[locale]/expertises/*`
7. Mettre à jour `components/sections/expertises-section.tsx`

---

## 📝 ORDRE DE MIGRATION RECOMMANDÉ

```
1. ✅ Compositeurs           → FAIT
2. ✅ Projets/Works          → FAIT
3. ✅ Catégories             → FAIT
4. ❌ Blog                   → À FAIRE (prioritaire)
5. ❌ Expertises             → À FAIRE (prioritaire)
6. 🧹 Nettoyage fichiers MD → Après validation complète
```

---

## 🎯 CONCLUSION

**État actuel** : Le projet est à **~70% migré** vers Prisma.

**Système hybride** :
- ✅ Compositeurs & Projets → 100% Prisma
- ❌ Blog & Expertises → 100% Markdown legacy

**Recommandation** :
1. **Migrer Blog + Expertises** vers Prisma (2-3h de travail)
2. **Tester** les pages et APIs
3. **Supprimer** le dossier `content/` complet
4. **Supprimer** `lib/blogUtils.ts` et `lib/expertiseUtils.ts`
5. **100% Prisma** ✨

---

**Questions ?**
- Veux-tu que je crée les scripts de migration pour Blog et Expertises ?
- Dois-je commencer la migration maintenant ?
- Préfères-tu garder le blog/expertises en Markdown ?
