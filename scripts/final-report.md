# ANALYSE COMPLÈTE DB vs FICHIERS LOCAUX

Date: 2025-11-19
Branche: fix_clean_organize

## RÉSUMÉ EXÉCUTIF

### ⚠️ RISQUES IDENTIFIÉS

**CRITIQUE - 68 works manquants dans metadata.json**
- Ces works existent en DB mais ne sont PAS dans les fichiers locaux
- Si vous faites un reset DB avec le seed actuel, ces 68 works seront PERDUS
- Export de sauvegarde créé: `scripts/missing-works-export.json`

**CRITIQUE - 7 liens SoundCloud de Mutant Ninja Records**
- En DB: 7 liens (1 YouTube + 6 SoundCloud)
- Dans JSON: 1 seul lien (YouTube uniquement)
- Si vous faites un reset, 6 liens SoundCloud seront PERDUS
- Export de sauvegarde créé: `scripts/composer-links-export.json`

**MOYEN - 1 expertise manquante**
- Expertise "mise-en-page" existe en DB mais pas en fichier .md
- Sera perdue lors du reset

**MOYEN - Labels**
- 5 labels existent en DB
- Aucune fonction seedLabels() dans seed.ts
- Les labels ont été créés manuellement ou via un autre script
- Risque de perte si non documentés

---

## 1. COMPOSITEURS

### Statistiques
- **Total en DB**: 65
- **Total dans JSON**: 65
- **✅ Différence**: 0 (tous les compositeurs sont dans le JSON)

### ⚠️ LIENS COMPOSITEURS

**EN BASE DE DONNÉES:**
- Compositeurs avec liens: 1 (Mutant Ninja Records)
- Liens multiples (table ComposerLink): 1 compositeur

**Mutant Ninja Records - Détail des liens en DB:**
```
- externalUrl (legacy): https://www.youtube.com/@MutantNinjaRecords
- ComposerLink (youtube): https://www.youtube.com/@MutantNinjaRecords
- ComposerLink (soundcloud): https://soundcloud.com/mutantninja
- ComposerLink (soundcloud): https://soundcloud.com/tcheep
- ComposerLink (soundcloud): https://soundcloud.com/Liqid
- ComposerLink (soundcloud): https://soundcloud.com/Bonetrips
- ComposerLink (soundcloud): https://soundcloud.com/arom-de-la-spirale
- ComposerLink (soundcloud): https://soundcloud.com/chicho-cortez
```
**Total: 7 liens + 1 externalUrl**

**DANS metadata.json:**
```json
{
  "name": "Mutant Ninja Records",
  "compoImg": "/images/projets/photosCompo/MutantNinja.png",
  "links": "https://www.youtube.com/@MutantNinjaRecords"
}
```
**Total: 1 seul lien (string)**

### 🔴 RISQUE: 6 liens SoundCloud seront PERDUS

**Format des liens dans JSON:**
- **Format string** (63 compositeurs): `"links": "https://url.com"`
- **Format object** (1 compositeur): `"links": { "soundcloud": "https://url.com" }`
- **Format empty object** (1 compositeur): `"links": {}`

**📝 Note:** Le seed.ts actuel (lignes 226-238) ne gère que le premier lien trouvé:
```typescript
if (typeof data.links === "string") {
  externalUrl = data.links;
} else if (typeof data.links === "object" && data.links !== null) {
  const urlValues = Object.values(data.links).filter(
    (v): v is string => typeof v === "string",
  );
  externalUrl = urlValues.length > 0 ? urlValues[0] : null; // ⚠️ Premier uniquement
}
```

**✅ STOCKÉ dans:** `scripts/composer-links-export.json`

---

## 2. WORKS

### Statistiques
- **Total en DB**: 253
- **Total dans metadata.json**: 185
- **🔴 Différence**: 68 works MANQUANTS dans JSON

### Métadonnées

**DANS LA DB:**
- Avec Spotify URL: 34
- Avec External URL: 135
- Avec Genre: 37
- Avec ISRC: 0
- Avec Release Date: (non compté mais présent)

**DANS metadata.json:**
- Avec Spotify: 34 ✅
- Avec External Link: 135 ✅
- Avec Genre: 37 ✅
- Avec Release Date: 37 ✅

### 🔴 68 WORKS MANQUANTS

**Catégorie des works manquants:**
- Documentaire: 64 works
- documentaires (minuscule): 4 works

**Exemples de works qui seront PERDUS:**
1. **ainsi-soit-il** (2019)
   - Titre: "Ainsi Soit-Il"
   - Catégorie: Documentaire
   - Label: 13PRODS
   - Image: `/images/projets/documentaires/13prods/ainsi-soit-il.jpg`

2. **gal-au-nom-de-la-raison-detat** (2018)
   - Titre: "GAL - Au Nom de la Raison d'État"
   - Catégorie: Documentaire
   - Label: 13PRODS

3. **vikings-la-saga-des-femmes** (2023)
   - Titre: "Vikings - La Saga des Femmes"
   - Catégorie: Documentaire

**Liste complète:** Voir `scripts/missing-works-export.json`

**✅ STOCKÉ dans:** `scripts/missing-works-export.json` (72 KB, 68 works complets)

**Structure de l'export:**
```json
{
  "totalMissing": 68,
  "exported": "2025-11-19T16:34:59.068Z",
  "works": [
    {
      "slug": "...",
      "titleFr": "...",
      "titleEn": "...",
      "descriptionFr": "...",
      "category": { "slug": "...", "nameFr": "...", "nameEn": "..." },
      "label": { "slug": "...", "nameFr": "...", "nameEn": "..." },
      "year": 2019,
      "coverImage": { "path": "...", "width": null, "height": null },
      "composers": [],
      ...
    }
  ]
}
```

---

## 3. CATÉGORIES

### Statistiques
- **Total en DB**: 6
- **Total dans JSON**: 5

### Détail des catégories en DB:

1. **album-de-librairie-musicale** (27 works)
   - FR: "Album de librairie musicale"
   - EN: "Music Library Album"

2. **synchros** (19 works)
   - FR: "synchros"
   - EN: "synchros"

3. **vinyle** (9 works)
   - FR: "Vinyle"
   - EN: "Vinyl"

4. **clips** (15 works)
   - FR: "clips"
   - EN: "clips"

5. **documentaire** (175 works)
   - FR: "Documentaire"
   - EN: "Documentary"

6. **documentaires** (8 works)
   - FR: "documentaires"
   - EN: "documentaires"

### ✅ SAFE

**Source:** Les catégories sont extraites automatiquement du JSON par le seed.ts (lignes 133-179).

**Fonction:** `seedCategories()` lit les catégories uniques du metadata.json FR et crée automatiquement les translations FR/EN.

**⚠️ Note:** Il y a une duplication "documentaire" vs "documentaires" (singulier/pluriel) qui devrait être nettoyée.

---

## 4. LABELS

### Statistiques
- **Total en DB**: 5

### ⚠️ PROBLÈME: Pas de fonction seedLabels()

Le fichier `seed.ts` **NE CONTIENT PAS** de fonction pour créer les labels.

**Labels actuellement en DB** (source inconnue):
- Label 1: ???
- Label 2: ???
- Label 3: ???
- Label 4: ???
- Label 5: ???

**🔍 Investigation nécessaire:**
- Les labels ont-ils été créés manuellement via l'admin panel ?
- Proviennent-ils d'une ancienne version du seed ?
- Y a-t-il un backup quelque part ?

**Données disponibles dans les works manquants:**
- Label "13PRODS" mentionné dans plusieurs documentaires

**✅ ACTION REQUISE:** 
1. Exporter les labels actuels de la DB
2. Créer une fonction `seedLabels()` dans seed.ts
3. Ou documenter la liste des labels à recréer manuellement

---

## 5. EXPERTISES

### Statistiques
- **Total en DB**: 7
- **Total fichiers FR**: 6
- **Total fichiers EN**: 6

### Expertises en DB:

1. ✅ **dossier-subvention** - "Gestion des dossiers de subvention"
2. ✅ **droits-auteur** - "Gestion des droits d'auteur"
3. ✅ **droits-voisins** - "Gestion des droits voisins"
4. ✅ **gestion-administrative-et-editoriale** - "Gestion administrative et éditoriale"
5. ✅ **gestion-distribution** - "Gestion de la distribution physique et digitale"
6. ⚠️ **mise-en-page** - "Exemple de mise en page" (PAS DE FICHIER)
7. ✅ **sous-edition** - "Gestion des oeuvres en sous-édition"

### Fichiers markdown disponibles:

**FR:**
- dossier-subvention.md ✅
- droits-auteur.md ✅
- droits-voisins.md ✅
- gestion-administrative-et-editoriale.md ✅
- gestion-distribution.md ✅
- sous-edition.md ✅

**EN:**
- dossier-subvention.md ✅
- droits-auteur.md ✅
- droits-voisins.md ✅
- gestion-administrative-et-editoriale.md ✅
- gestion-distribution.md ✅
- sous-edition.md ✅

### ⚠️ MANQUANT: mise-en-page.md

L'expertise "mise-en-page" existe en DB mais n'a pas de fichier markdown correspondant.

**Impact:** Cette expertise sera perdue lors du reset, sauf si vous:
1. L'exportez depuis la DB
2. Créez les fichiers `mise-en-page.md` (FR et EN)
3. Ou la supprimez de la liste hardcodée dans seed.ts (ligne 476-484)

**📝 Note:** La fonction `seedExpertises()` a une liste hardcodée de 7 slugs (ligne 476-484):
```typescript
const slugs = [
  "dossier-subvention",
  "droits-auteur",
  "droits-voisins",
  "gestion-administrative-et-editoriale",
  "gestion-distribution",
  "mise-en-page", // ⚠️ Pas de fichier
  "sous-edition",
];
```

---

## 6. DESCRIPTIONS MARKDOWN

### Statistiques
- **Descriptions FR**: 36 fichiers
- **Descriptions EN**: 36 fichiers
- **Works dans JSON**: 185

**📊 Ratio:** 36/185 = 19.5% des works ont des descriptions markdown détaillées.

**✅ SAFE:** Les descriptions sont gérées automatiquement par `getDescriptionFromMarkdown()` dans le seed.

---

## 7. ASSETS / IMAGES

**Non analysé dans ce rapport.**

Suggestion: Vérifier que toutes les images référencées dans:
- `missing-works-export.json` (coverImage.path)
- Les 68 works manquants

existent bien dans `public/images/projets/`.

---

## RECOMMANDATION FINALE

### 🔴 NE PAS FAIRE DE RESET SANS ACTIONS PRÉALABLES

**Avant tout reset de la base de données, vous DEVEZ:**

### 1. ✅ SAUVEGARDES DÉJÀ CRÉÉES

- ✅ `scripts/missing-works-export.json` (68 works)
- ✅ `scripts/composer-links-export.json` (liens Mutant Ninja)

### 2. 🔴 ACTIONS CRITIQUES REQUISES

#### A. Récupérer les 68 works manquants

**Option 1 (Recommandée):** Ajouter au metadata.json
```bash
# Script à créer: scripts/merge-missing-works.ts
# Fusionne missing-works-export.json dans metadata.json FR et EN
```

**Option 2:** Créer un second seed
```bash
# Script à créer: scripts/seed-missing-works.ts
# Seed séparé uniquement pour les works manquants
```

#### B. Sauvegarder les liens Mutant Ninja

**Option 1:** Modifier metadata.json pour supporter plusieurs liens
```json
{
  "name": "Mutant Ninja Records",
  "links": {
    "youtube": "https://www.youtube.com/@MutantNinjaRecords",
    "soundcloud": [
      "https://soundcloud.com/mutantninja",
      "https://soundcloud.com/tcheep",
      "https://soundcloud.com/Liqid",
      "https://soundcloud.com/Bonetrips",
      "https://soundcloud.com/arom-de-la-spirale",
      "https://soundcloud.com/chicho-cortez"
    ]
  }
}
```

**Option 2:** Modifier le seed pour lire depuis composer-links-export.json

#### C. Exporter et documenter les LABELS

```bash
# Script à créer: scripts/export-labels.ts
npx tsx scripts/export-labels.ts > scripts/labels-backup.json
```

Puis créer `seedLabels()` dans seed.ts

#### D. Gérer l'expertise "mise-en-page"

**Option 1:** L'exporter depuis la DB et créer les .md
**Option 2:** La retirer de la liste hardcodée si elle n'est plus utilisée

### 3. ⚠️ ACTIONS MOYENNES

- Nettoyer la duplication "documentaire" vs "documentaires"
- Vérifier que toutes les images existent

### 4. ✅ SAFE POUR RESET

- Compositeurs (noms uniquement)
- Catégories
- Works du metadata.json (185)
- Expertises (6 sur 7)
- Descriptions markdown

---

## STATISTIQUES FINALES

| Entité | DB | Fichiers | Delta | Risque |
|--------|-----|----------|-------|--------|
| **Compositeurs** | 65 | 65 | 0 | ✅ SAFE |
| **Liens compositeurs** | 7 (MNR) | 1 | -6 | 🔴 CRITIQUE |
| **Works** | 253 | 185 | -68 | 🔴 CRITIQUE |
| **Catégories** | 6 | 5 | +1 | ✅ SAFE* |
| **Labels** | 5 | 0 | -5 | ⚠️ MOYEN |
| **Expertises** | 7 | 6 | -1 | ⚠️ MOYEN |
| **Descriptions** | - | 36 | - | ✅ SAFE |

*Auto-générées depuis JSON

---

## FICHIERS CRÉÉS POUR SAUVEGARDE

1. **scripts/missing-works-export.json** (72 KB)
   - 68 works complets avec toutes métadonnées
   - Traductions FR et EN
   - Images, compositeurs, catégories, labels

2. **scripts/composer-links-export.json** (1.4 KB)
   - Liens de Mutant Ninja Records
   - 7 liens (1 YouTube + 6 SoundCloud)

3. **scripts/analyze-db-content.ts**
   - Script pour analyser le contenu de la DB

4. **scripts/analyze-local-content.ts**
   - Script pour analyser les fichiers locaux

5. **scripts/compare-db-vs-files.ts**
   - Script de comparaison DB vs fichiers

6. **scripts/find-missing-data.ts**
   - Script pour identifier les données manquantes

7. **scripts/export-missing-data.ts**
   - Script d'export des données manquantes

---

## PROCHAINES ÉTAPES RECOMMANDÉES

### Priorité 1 - CRITIQUE
1. ✅ Créer un backup complet de la DB actuelle
2. ✅ Intégrer les 68 works dans metadata.json
3. ✅ Ajouter les liens Mutant Ninja dans metadata.json
4. ✅ Modifier le seed pour gérer les liens multiples

### Priorité 2 - MOYEN
5. ⚠️ Exporter et documenter les labels
6. ⚠️ Créer seedLabels() dans seed.ts
7. ⚠️ Gérer l'expertise "mise-en-page"

### Priorité 3 - NETTOYAGE
8. Nettoyer "documentaire" vs "documentaires"
9. Vérifier l'existence de toutes les images
10. Tester le seed complet sur une DB test

---

**Date du rapport:** 2025-11-19 17:34 UTC
**Branche:** fix_clean_organize
**Auteur:** Claude Code Analysis
