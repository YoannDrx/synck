# 🚀 Workflow de Déploiement

## 📋 Vue d'ensemble

Ce projet utilise un workflow de déploiement automatisé où **`works.json` et `composers.json` sont la source de vérité** pour les données en production.

## 🔄 Pipeline de déploiement

### 1️⃣ Développement local

```bash
# Modification des données
vim seed-data/works.json        # Ajouter/modifier des projets
vim seed-data/composers.json    # Ajouter/modifier des compositeurs

# Reset et seed de la base locale
pnpm db:reset:seed

# Vérification
pnpm dev                        # → http://localhost:3000
```

**Résultat** : Base de données locale synchronisée avec les fichiers JSON

---

### 2️⃣ Pull Request

```bash
# Création d'une branche
git checkout -b feat/ajout-nouveaux-projets

# Commit des modifications
git add seed-data/
git commit -m "feat: ajout de 20 nouveaux projets de synchro"
git push -u origin feat/ajout-nouveaux-projets

# Créer la PR sur GitHub
gh pr create
```

**CI sur la PR** :
- ✅ Lint & TypeCheck
- ✅ Prisma validation & migration check
- ✅ Build Next.js
- ✅ **Tests E2E** (sur base PostgreSQL locale avec seed)

---

### 3️⃣ Merge sur main

```bash
# Une fois la PR approuvée
gh pr merge
```

**CI sur main** :
- ✅ Lint & TypeCheck
- ✅ Prisma validation & migration check
- ✅ Build Next.js
- ❌ Tests E2E skippés (déjà validés dans la PR)

---

### 4️⃣ Déploiement Vercel (automatique)

**Script `vercel-build.js`** :

```bash
1. pnpm exec prisma migrate deploy    # ✅ Applique les migrations
2. pnpm exec prisma generate           # ✅ Génère le client Prisma
3. pnpm db:seed:prod                   # ✅ Seed idempotent (UPSERT)
4. pnpm exec next build                # ✅ Build Next.js
```

**Résultat** : Production synchronisée avec `works.json` et `composers.json`

---

## 🎯 Principe clé : Seed idempotent

Le seed utilise des **UPSERT** (create or update) :

```typescript
// Si le work existe (même slug) → UPDATE
// Sinon → CREATE

await prisma.work.upsert({
  where: { slug: "acid" },
  create: { /* nouvelles données */ },
  update: { /* mise à jour */ }
});
```

### Ce qui est préservé :
- ❌ Rien n'est préservé si modifié via l'admin panel
- ✅ Les données de `works.json` écrasent toujours

### Ce qui est synchronisé :
- ✅ Titre, description, catégorie
- ✅ Images, compositeurs, URLs
- ✅ Ordre, statut (actif/inactif)

---

## 🛠️ Gestion des données

### Option A : Modifier via `works.json` (recommandé)

```bash
# 1. Modifier le fichier JSON
vim seed-data/works.json

# 2. Tester localement
pnpm db:reset:seed
pnpm dev

# 3. Commit + Push
git add seed-data/works.json
git commit -m "feat: ajout projet X"
git push

# 4. Merge PR → Production mise à jour automatiquement
```

**✅ Avantages** :
- Données versionnées dans Git
- Dev et prod toujours synchronisés
- Historique complet des changements

### Option B : Modifier via l'admin panel

```
⚠️ ATTENTION : Les modifications via l'admin panel
seront ÉCRASÉES au prochain déploiement !
```

**Workflow recommandé** :
1. Faire les modifications dans l'admin
2. Exporter les données vers `works.json`
3. Commit le JSON
4. Push → déploiement

---

## 📊 Compteurs de projets

### Développement
```bash
pnpm db:seed         # → 241 projets (works.json)
```

### Production (après déploiement)
```
https://carolinesenyk.fr/fr/projets → 241 projets
```

**Si les compteurs ne correspondent pas** :
- ❌ Le seed n'a pas été exécuté en production
- ❌ Le fichier `works.json` n'est pas à jour
- ❌ Le script `vercel-build.js` a échoué

---

## 🐛 Troubleshooting

### Production a moins de projets que dev

**Cause** : Le seed ne s'est pas exécuté ou a échoué.

**Solution** :
```bash
# Vérifier les logs Vercel
vercel logs <deployment-url>

# Re-déployer manuellement
vercel --prod
```

### Modifications admin panel perdues

**Cause** : Le seed a écrasé les modifications.

**Solution** :
1. Ne plus modifier via l'admin panel
2. Toujours modifier `works.json` en priorité
3. Ou désactiver le seed en prod (non recommandé)

### Seed échoue en production

**Logs à vérifier** :
```bash
vercel logs --follow
```

**Causes fréquentes** :
- Images manquantes (vérifier que les fichiers existent dans `/public/images/`)
- Compositeurs référencés non créés
- Erreur de format dans `works.json`

---

## 📝 Checklist avant déploiement

- [ ] `works.json` et `composers.json` sont à jour
- [ ] `pnpm db:reset:seed` fonctionne localement
- [ ] Toutes les images existent dans `/public/images/`
- [ ] Les tests E2E passent (`pnpm test`)
- [ ] La PR a été approuvée
- [ ] Les migrations Prisma sont prêtes

---

## 🔐 Variables d'environnement requises

**Vercel Dashboard → Settings → Environment Variables** :

```bash
DATABASE_URL="postgresql://..."      # Neon pooled connection
DIRECT_URL="postgresql://..."        # Neon direct connection
NEXT_PUBLIC_SITE_URL="https://carolinesenyk.fr"
RESEND_API_KEY="re_..."             # Email service
BLOB_READ_WRITE_TOKEN="..."         # Vercel Blob (optionnel)
```

---

## 📚 Commandes utiles

```bash
# Développement
pnpm dev                    # Démarrer le serveur local
pnpm db:reset:seed          # Reset et seed la base
pnpm db:seed                # Seed uniquement
pnpm db:studio              # Interface Prisma Studio

# Tests
pnpm test                   # Tous les tests E2E
pnpm test:ui                # Tests avec interface UI

# Production (local)
pnpm build                  # Build de production
pnpm start                  # Démarrer le serveur prod

# Base de données
pnpm db:migrate             # Créer une migration
pnpm db:migrate:check       # Vérifier l'état des migrations
```
