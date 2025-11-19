# Guide d'utilisation des fichiers pour Gemini

Ce dossier contient tous les fichiers nécessaires pour demander à Gemini de t'aider à réparer les problèmes de base de données après la migration Legacy → Prisma.

## 📁 Fichiers créés

### 1. Prompt principal (RECOMMANDÉ)
**Fichier** : `gemini-fix-db-prompt.md`
**Taille** : ~2000 mots
**Usage** : Copier-coller intégralement dans Gemini

**Contenu** :
- ✅ Contexte complet de la migration
- ✅ Timeline des commits (16-19 nov 2025)
- ✅ Analyse détaillée des 3 problèmes critiques
- ✅ Exemples concrets avec tableaux comparatifs
- ✅ Scripts fournis à améliorer
- ✅ Questions précises pour Gemini
- ✅ Résultats attendus

**Avantages** :
- Gemini aura TOUT le contexte
- Questions actionnables
- Exemples réels

### 2. Résumé exécutif (VERSION COURTE)
**Fichier** : `gemini-summary.md`
**Taille** : ~500 mots
**Usage** : Version condensée si le prompt complet est trop long

**Contenu** :
- Résumé des 3 problèmes
- Questions clés
- Fichiers annexes disponibles

### 3. Exemples de données
**Fichier** : `gemini-examples-data.json`
**Taille** : JSON avec exemples réels
**Usage** : Fournir à Gemini si demandé

**Contenu** :
- 10 assets de la sauvegarde
- 3 works avec traductions
- 3 composers
- Statistiques

### 4. Script de diagnostic
**Fichier** : `diagnostic-images.ts`
**Taille** : ~360 lignes TypeScript
**Usage** : Exécuter avant de contacter Gemini

**Commande** :
```bash
pnpm tsx scripts/diagnostic-images.ts
```

**Résultat** :
- Génère `diagnostic-report.json` avec analyse complète
- Affiche statistiques dans le terminal
- Identifie tous les problèmes automatiquement

**Fournis ce rapport à Gemini !**

---

## 🚀 Workflow recommandé

### Étape 1 : Exécuter le diagnostic

```bash
cd /Users/yoannandrieux/Projets/synck
pnpm tsx scripts/diagnostic-images.ts
```

Cela va générer `scripts/diagnostic-report.json` avec :
- Liste complète des chemins obsolètes
- Fichiers manquants avec suggestions
- Problèmes de casse détectés
- Assets orphelins

### Étape 2 : Ouvrir Gemini

Va sur https://gemini.google.com/ (ou https://aistudio.google.com/)

### Étape 3 : Copier le prompt principal

**Option A (RECOMMANDÉE)** :
```bash
cat scripts/gemini-fix-db-prompt.md | pbcopy
```
Puis coller dans Gemini.

**Option B (si trop long)** :
```bash
cat scripts/gemini-summary.md | pbcopy
```
Et mentionner que les détails sont dans `gemini-fix-db-prompt.md`.

### Étape 4 : Joindre le rapport de diagnostic

Uploader `scripts/diagnostic-report.json` dans Gemini ou copier-coller les statistiques clés.

### Étape 5 : Joindre des exemples (optionnel)

Si Gemini demande des exemples concrets :
```bash
cat scripts/gemini-examples-data.json | pbcopy
```

---

## 📊 À quoi s'attendre

### Gemini va probablement te demander

1. **Le schéma Prisma complet**
   ```bash
   cat prisma/schema.prisma | pbcopy
   ```

2. **Le rapport de diagnostic complet**
   ```bash
   cat scripts/diagnostic-report.json | pbcopy
   ```

3. **Des exemples de fichiers réels**
   ```bash
   ls -la public/images/projets/albums/ | head -20
   ```

### Gemini devrait fournir

1. ✅ **Script corrigé** `fix-all-image-issues.ts`
   - Gestion robuste des variantes de casse
   - Mapping fichiers réels
   - Dry-run mode
   - Logs détaillés

2. ✅ **Fonction améliorée** `normalizeImagePath()`
   - Sans `.toLowerCase()` agressif
   - Avec index des fichiers réels
   - Gestion multi-extensions

3. ✅ **Plan d'action étape par étape**
   - Ordre sécurisé d'exécution
   - Stratégie de rollback
   - Commandes exactes

4. ✅ **Script de validation**
   - Tests automatiques
   - Vérification cohérence DB ↔ disque
   - Utilisable en CI

---

## 🔧 Scripts disponibles (actuels)

### Script de restauration DB
```bash
pnpm tsx scripts/restore-database.ts
```
Restaure la sauvegarde du 18 nov (`synck_backup_2025-11-18T11-51-45.json`).

### Script de correction (À AMÉLIORER avec Gemini)
```bash
# NE PAS EXÉCUTER ENCORE (problèmes de casse non résolus)
# pnpm tsx scripts/fix-all-image-issues.ts
```

Problèmes actuels :
- ❌ Ne gère pas les variantes de casse
- ❌ Pas de dry-run mode
- ❌ Logs insuffisants

**Attendre version améliorée de Gemini !**

---

## ⚠️ IMPORTANT : Avant toute correction

1. **Backup DB actuelle**
   ```bash
   # Déjà fait : synck_backup_2025-11-18T11-51-45.json
   # Mais refaire un backup frais :
   pnpm tsx scripts/backup-database.ts
   ```

2. **Tester en local d'abord**
   - Ne JAMAIS exécuter directement en production
   - Vérifier avec `pnpm dev` après corrections
   - Lancer tests E2E : `pnpm test`

3. **Rollback strategy**
   Si problème après corrections :
   ```bash
   pnpm tsx scripts/restore-database.ts backups/synck_backup_[DATE].json
   ```

---

## 📝 Exemple de conversation avec Gemini

**Toi** :
```
Bonjour Gemini,

J'ai besoin d'aide pour réparer ma base de données après une migration.
Voici le contexte complet :

[COLLER gemini-fix-db-prompt.md]

J'ai aussi généré un rapport de diagnostic automatique :
[COLLER statistiques de diagnostic-report.json]

Peux-tu m'aider à créer des scripts robustes pour corriger les 312 chemins
obsolètes et gérer les problèmes de casse ?
```

**Gemini** :
```
Je vais t'aider à créer des scripts sécurisés. D'abord, quelques questions :

1. Peux-tu me partager le schéma Prisma complet ?
2. As-tu accès au fichier diagnostic-report.json complet ?
3. Quelle est ta stratégie de rollback préférée ?

Voici mon plan proposé :
[...]
```

---

## 🎯 Checklist finale

Avant de contacter Gemini :

- [ ] Rapport de diagnostic généré (`diagnostic-report.json`)
- [ ] Backup DB récent disponible
- [ ] Prompt principal lu et compris
- [ ] Questions clés identifiées
- [ ] Stratégie de rollback en tête

Après réponse de Gemini :

- [ ] Scripts fournis sauvegardés
- [ ] Tests en local effectués (dry-run)
- [ ] Validation manuelle sur 5-10 assets
- [ ] Tests E2E passés
- [ ] Commit des corrections
- [ ] Backup final après corrections

---

## 🚨 En cas de problème

Si les scripts de Gemini ne fonctionnent pas :

1. **Partager les erreurs exactes** avec Gemini
2. **Fournir des exemples précis** de chemins problématiques
3. **Demander un dry-run mode** pour tester sans modifier la DB
4. **Restaurer le backup** si nécessaire

---

**Bonne chance ! 🚀**

Gemini devrait pouvoir t'aider à résoudre tous ces problèmes avec les informations fournies.
