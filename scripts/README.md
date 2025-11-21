# Scripts

Ce dossier contient les scripts utilitaires essentiels pour le projet.

## 📁 Structure

```
scripts/
├── db/                      # Scripts de gestion de base de données (7 fichiers)
│   ├── reset-dev.ts         # Reset de la base de développement
│   ├── seed-dev.ts          # Seed de la base de développement
│   ├── reset-seed-dev.ts    # Reset + Seed de la base de développement
│   ├── reset-only-prod.ts   # Reset de la base de production (sans seed)
│   ├── seed-prod.ts         # Seed de la base de production
│   ├── reset-seed-prod.ts   # Reset + Seed de la base de production
│   └── README.md            # Documentation des scripts DB
├── run-ts.cjs               # Runner TypeScript pour exécuter les scripts en sandbox
├── generate-categories.ts   # Génère seed-data/categories.json
├── generate-composers.ts    # Génère seed-data/composers.json
└── generate-works.ts        # Génère seed-data/works.json
```

## 🎯 Scripts de base de données

Ces scripts sont accessibles via les commandes npm définies dans `package.json` :

### Développement (local)

```bash
# Reset la base de données de développement
pnpm db:reset

# Seed la base de données de développement
pnpm db:seed

# Reset + Seed en une commande
pnpm db:reset:seed
```

### Production

```bash
# Reset UNIQUEMENT la base de production (sans seed automatique)
pnpm db:reset:prod

# Seed la base de production
pnpm db:seed:prod

# Reset + Seed de la base de production
pnpm db:reset:seed:prod
```

**⚠️ IMPORTANT** : Les scripts de production incluent des confirmations de sécurité pour éviter les suppressions accidentelles.

## 🔧 Scripts de génération de seed data

Ces scripts génèrent les fichiers JSON utilisés par `prisma/seed.ts` à partir des données sources (markdown, base de données existante, etc.).

### generate-categories.ts

Génère `seed-data/categories.json` avec les catégories de works (Musique, Documentaire, etc.).

```bash
pnpm tsx scripts/generate-categories.ts
```

### generate-composers.ts

Génère `seed-data/composers.json` avec la liste complète des compositeurs, leurs images et liens.

```bash
pnpm tsx scripts/generate-composers.ts
```

### generate-works.ts

Génère `seed-data/works.json` avec toutes les works (albums, documentaires, clips, etc.) incluant :
- Métadonnées (titre, genre, date, etc.)
- Associations avec catégories, labels, compositeurs
- Chemins vers les images de couverture

```bash
pnpm tsx scripts/generate-works.ts
```

**Note** : Ces scripts doivent être réexécutés chaque fois que les données sources changent pour mettre à jour les fichiers JSON de seed.

## 🚀 Runner TypeScript (run-ts.cjs)

Script interne utilisé par tous les scripts de base de données pour exécuter du TypeScript en mode sandbox avec le bon contexte d'environnement.

**Utilisation** : Ce script est appelé automatiquement par les commandes npm `db:*`, vous n'avez pas besoin de l'exécuter directement.

## 📝 Workflow de seed

1. **Modifier les données sources** (markdown, images, etc.)
2. **Regénérer les fichiers JSON** si nécessaire :
   ```bash
   pnpm tsx scripts/generate-categories.ts
   pnpm tsx scripts/generate-composers.ts
   pnpm tsx scripts/generate-works.ts
   ```
3. **Seed la base de données** :
   ```bash
   pnpm db:seed           # Pour dev
   pnpm db:seed:prod      # Pour production
   ```

## 🗑️ Historique de nettoyage

Le 21/11/2024, ce dossier a été nettoyé pour supprimer **84 fichiers obsolètes** (scripts de migration ponctuels, fichiers de sortie, etc.). Ces fichiers restent disponibles dans l'historique Git si besoin.

Les 11 fichiers conservés sont les seuls scripts essentiels et réutilisables du projet.
