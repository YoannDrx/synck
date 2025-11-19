# Résumé Exécutif : Problèmes DB après migration Legacy → Prisma

## 🎯 Contexte rapide

Migration d'un portfolio professionnel du **16 au 19 novembre 2025** :
- Ancien système : JSON + fichiers statiques
- Nouveau système : Prisma + PostgreSQL + Next.js 16
- Commit clé : Renommage `/images/portfolio/` → `/images/projets/` (18 nov, 34 fichiers modifiés)

**Backup de référence** : `synck_backup_2025-11-18T11-51-45.json` (18 nov 11h51)

---

## 🚨 3 Problèmes critiques identifiés

### 1. Chemins obsolètes (312 assets)

**Tous** les chemins en DB utilisent encore `/images/portfolio/` au lieu de `/images/projets/`

```
DB :   /images/portfolio/albums/pgo0022.jpg
Réel : /images/projets/albums/PGO0022.jpg  ❌ 404
```

### 2. Problèmes de casse multiples

Normalisation `.toLowerCase()` trop agressive dans `seed.ts` :

```typescript
// Actuel (CASSÉ)
.toLowerCase() // pgo0022.jpg

// Réel sur disque
PGO0022.jpg // MAJUSCULES !
```

**Conventions mixtes** :
- Albums : `PGO0022.jpg` (UPPERCASE)
- Compositeurs : `LaurentDury.jpeg`, `DUCER.jpeg`, `9oClock.jpeg` (mixte !)
- Clips : `Acid.png`, `alien-suites-remixes.png` (PascalCase + kebab-case)

### 3. Extensions multiples (.jpg, .JPG, .jpeg, .JPEG)

Regex `/\.jpeg$/i` ne capture pas `.JPG` (majuscules complètes)

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| Assets en DB | 312 |
| Fichiers réels | 416 |
| Écart | +104 fichiers non trackés |
| Chemins obsolètes | 312 (100%) |
| Métadonnées manquantes | ~250 (blurDataUrl, dimensions) |

---

## ❓ Questions clés pour Gemini

### 1. Stratégie de correction

SQL direct ou script TypeScript avec validation ?

```sql
-- Option A : Rapide mais risqué
UPDATE "Asset" SET path = REPLACE(path, '/images/portfolio/', '/images/projets/');
```

```typescript
// Option B : Plus lent mais safer
// Vérifier existence fichier avant update
// Essayer variantes casse si 404
// Logger toutes corrections
```

**Laquelle est la plus sûre ?**

### 2. Gestion casse robuste

Comment créer mapping automatique gérant variantes ?

```
DB : /images/projets/albums/pgo0022.jpg

Fichiers possibles :
- PGO0022.jpg  ← MAJUSCULES (réel)
- pgo0022.jpg  ← minuscules
- Pgo0022.jpg  ← PascalCase
- PGO0022.JPG  ← Extension majuscule
```

**Algorithme proposé** :
1. Normaliser préfixe portfolio → projets
2. Scanner tous fichiers réels → index Map
3. Chercher fichier (case-insensitive)
4. Utiliser chemin EXACT du fichier trouvé
5. Update DB avec chemin réel

**Est-ce optimal ?**

### 3. Ordre d'exécution sécurisé

```
1. Backup DB (pg_dump)
2. Générer index fichiers réels
3. Dry-run (logs only)
4. Vérifier logs manuellement
5. Exécuter update DB
6. Régénérer Prisma Client
7. Tests E2E
8. Si KO → rollback
```

**Manque-t-il des étapes critiques ?**

---

## 📎 Fichiers fournis

### 1. Prompt complet
`scripts/gemini-fix-db-prompt.md` (~2000 mots)
- Contexte détaillé
- Exemples concrets
- Scripts fournis
- Questions approfondies

### 2. Exemples JSON
`scripts/gemini-examples-data.json`
- 10 assets de la sauvegarde
- 3 works
- 3 composers

### 3. Script diagnostic
`scripts/diagnostic-images.ts`
- Scanne tous assets
- Vérifie existence fichiers
- Détecte problèmes casse
- Génère rapport JSON

**Usage** :
```bash
pnpm tsx scripts/diagnostic-images.ts
# Génère : scripts/diagnostic-report.json
```

### 4. Script correction (à améliorer)
`scripts/fix-all-image-issues.ts`
- Correction préfixe
- Génération blurDataUrl
- Ajout dimensions
- **Problème** : Ne gère pas variantes casse !

---

## 🎯 Résultats attendus

### Scripts à fournir par Gemini

1. ✅ `fix-all-image-issues.ts` corrigé
   - Mapping fichiers réels
   - Gestion variantes casse
   - Dry-run mode
   - Logs détaillés

2. ✅ `normalizeImagePath()` amélioré (seed.ts)
   - Sans `.toLowerCase()` agressif
   - Avec index fichiers réels
   - Gestion extensions multiples

3. ✅ Plan d'action étape par étape
   - Ordre sécurisé
   - Rollback strategy
   - Validation automatique

### Recommandations long terme

- Convention nommage unifiée ?
- Script validation pré-commit ?
- CI check images manquantes ?

---

## 🙏 Aide demandée

1. Valider stratégie proposée
2. Améliorer scripts fournis (surtout gestion casse)
3. Identifier edge cases manqués
4. Plan d'action sécurisé

**Priorité** : Ne rien casser, corriger 312 chemins, gérer casse robustement.

---

**Voir prompt complet** : `scripts/gemini-fix-db-prompt.md`
