# Configuration GitHub Actions CI/CD

Ce document explique comment configurer le workflow GitHub Actions pour votre projet.

## 📋 Aperçu du workflow

Le workflow `.github/workflows/ci.yml` effectue les vérifications suivantes:

1. **Lint**: Vérifie la qualité du code avec ESLint
2. **Prisma**: Valide le schéma et vérifie que les migrations sont à jour
3. **Build**: Compile l'application Next.js
4. **Tests E2E**: Exécute les tests Playwright sur 2 shards parallèles
5. **Deploy Ready**: Confirme que le déploiement Vercel peut commencer

## 🔐 Configuration des secrets GitHub

Pour que le workflow fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub:

### 1. Accéder aux secrets

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

### 2. Secrets requis

#### `DATABASE_URL`
URL de connexion à votre base de données PostgreSQL Neon.

**Format:**
```
postgresql://username:password@host/database?sslmode=require
```

**Exemple:**
```
postgresql://myuser:XXXXXXXXXX@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```
_(Remplacez `XXXXXXXXXX` par votre vrai mot de passe)_

**Où trouver:**
- Connectez-vous à [Neon Console](https://console.neon.tech/)
- Sélectionnez votre projet
- Allez dans **Dashboard** → **Connection Details**
- Copiez la **Connection string** (mode Pooled)

#### `DIRECT_URL`
URL de connexion directe à la base de données (pour les migrations).

**Format:** Identique à `DATABASE_URL` mais en mode **Direct connection**

**Où trouver:**
- Même endroit que `DATABASE_URL`
- Sélectionnez **Direct connection** au lieu de **Pooled**

### 3. Secrets optionnels

#### `RESEND_API_KEY`
Si vous utilisez Resend pour l'envoi d'emails (non requis pour les tests).

#### `BLOB_READ_WRITE_TOKEN`
Si vous utilisez Vercel Blob pour le stockage d'images (non requis pour les tests).

## 🚀 Déclenchement du workflow

Le workflow se déclenche automatiquement sur:
- ✅ Push sur `main`, `master`, ou `layout-expertise`
- ✅ Pull Request vers ces branches

### Branches surveillées

Vous pouvez modifier les branches dans `.github/workflows/ci.yml`:

```yaml
on:
  push:
    branches: [main, master, layout-expertise]  # ← Modifier ici
  pull_request:
    branches: [main, master, layout-expertise]  # ← Et ici
```

## 📊 Résultats des tests

### Voir les résultats

1. Allez dans l'onglet **Actions** de votre repository
2. Cliquez sur le workflow exécuté
3. Consultez les jobs:
   - ✅ Vert = Succès
   - ❌ Rouge = Échec
   - 🟡 Jaune = En cours

### Artifacts téléchargeables

En cas d'échec des tests, vous pouvez télécharger:
- **playwright-report**: Rapport HTML détaillé
- **playwright-screenshots**: Screenshots des pages en échec

## 🔧 Vérifications Prisma

### Vérifier les migrations localement

Avant de push, vérifiez que vos migrations sont à jour:

```bash
# Vérifier si le schéma correspond aux migrations
npm run db:migrate:check

# Si des changements sont détectés, créer une migration
npm run db:migrate

# Commit les fichiers de migration
git add prisma/migrations
git commit -m "feat: add new migration"
```

### Erreur "pending migrations"

Si le workflow échoue avec "Schema changes detected":

1. Vous avez modifié `prisma/schema.prisma`
2. Mais vous n'avez pas créé de migration

**Solution:**
```bash
npm run db:migrate
git add prisma/migrations
git commit -m "feat: add migration for schema changes"
git push
```

## 🐛 Debugging

### Les tests échouent en CI mais passent localement

1. **Variables d'environnement manquantes**
   - Vérifiez que tous les secrets sont configurés dans GitHub
   - Consultez les logs du workflow pour voir les erreurs exactes

2. **Problème de database**
   - Vérifiez que `DATABASE_URL` est correct
   - Assurez-vous que la DB Neon est accessible depuis GitHub Actions

3. **Problème de build**
   - Vérifiez les logs du job "Build Application"
   - Assurez-vous que toutes les dépendances sont listées dans `package.json`

### Tester localement avant de push

```bash
# 1. Linter
npm run lint

# 2. Build
npm run build

# 3. Tests E2E
npm run test
```

## 📝 Modifier le workflow

### Ajouter une nouvelle étape

Éditez `.github/workflows/ci.yml`:

```yaml
- name: Mon nouveau step
  run: npm run mon-script
```

### Ajouter un nouveau job

```yaml
jobs:
  mon-job:
    name: Mon Job
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Mon action
        run: echo "Hello"
```

### Désactiver temporairement un job

Commentez ou ajoutez `if: false`:

```yaml
jobs:
  test:
    if: false  # ← Désactive ce job
    name: Tests
    # ...
```

## 🔗 Intégration Vercel

Le workflow vérifie que tout est OK avant le déploiement Vercel.

### Configuration Vercel

1. Vercel détecte automatiquement les commits sur `main`/`master`
2. **Attendre les GitHub Actions**: Dans Vercel Settings
   - Allez dans **Git** → **Deploy Hooks**
   - Activez **Wait for GitHub checks**

Ainsi Vercel ne déploie que si les tests passent! ✅

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)

## ⚠️ Notes importantes

1. **Ne commitez jamais vos secrets** dans le code
2. **Utilisez toujours les GitHub Secrets** pour les données sensibles
3. **Testez localement** avant de push
4. **Les migrations doivent être committées** avec votre code

## 🎯 Checklist avant le premier push

- [ ] Secrets GitHub configurés (`DATABASE_URL`, `DIRECT_URL`)
- [ ] Tests passent localement (`npm run test`)
- [ ] Build fonctionne (`npm run build`)
- [ ] Migrations committées (`git status prisma/migrations`)
- [ ] `.env.example` à jour
- [ ] README.md mis à jour si nécessaire

---

**Prêt pour le CI/CD! 🚀**
