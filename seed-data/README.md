# 📦 Seed Data

Ce dossier contient toutes les données nécessaires pour seeder la base de données.

## 📁 Structure

```
seed-data/
├── categories.json          # Catégories avec traductions FR/EN
├── labels.json              # Labels/maisons de production
├── composers.json           # Compositeurs avec liens multiples fusionnés
├── works.json               # Works unifiés FR+EN (filtrés par images valides)
├── expertises/              # Fichiers markdown des expertises
│   ├── fr/                  # 6 expertises FR
│   └── en/                  # 6 expertises EN
└── descriptions/            # Descriptions markdown des works
    ├── fr/                  # 36 descriptions FR
    └── en/                  # 36 descriptions EN
```

Le seed Prisma lit aussi, si présent, `content/composer-bios/` (FR/EN, fichiers `.md` nommés par slug) pour remplir automatiquement le champ `bio` des compositeurs. Si seule la version française existe, elle est réutilisée pour l'anglais.

## 🔄 Génération des fichiers

Les fichiers JSON sont générés automatiquement via les scripts :

```bash
# Générer categories.json depuis metadata
pnpm tsx scripts/generate-categories.ts

# Générer composers.json (fusion metadata + composer-links)
pnpm tsx scripts/generate-composers.ts

# Générer works.json unifié FR+EN avec validation images
pnpm tsx scripts/generate-works.ts
```

## 📊 Statistiques actuelles

- **8 catégories** (avec traductions)
- **4 labels** (13prods, little-big-story, pop-films, via-decouvertes-films)
- **76 compositeurs** (64 avec liens multiples)
- **253 works** dans works.json
  - **113 works avec images valides** (seedés)
  - **140 works sans images** (filtrés automatiquement)
- **6 expertises** (FR + EN)
- **36 descriptions** works (FR + EN)

## 🎨 Format des fichiers

### categories.json

```json
{
  "id": 1,
  "slug": "album-de-librairie-musicale",
  "nameFr": "Album de librairie musicale",
  "nameEn": "Album de librairie musicale",
  "color": "#d5ff0a",
  "icon": "disc",
  "order": 0,
  "isActive": true
}
```

### composers.json

```json
{
  "id": 1,
  "slug": "ugly-mac-beer",
  "name": "Ugly Mac Beer",
  "image": "public/images/projets/photoscompo/uglymacbeer.jpg",
  "externalUrl": "https://www.youtube.com/...",
  "links": [
    {
      "platform": "youtube",
      "url": "https://www.youtube.com/...",
      "label": null,
      "order": 0
    },
    {
      "platform": "soundcloud",
      "url": "https://soundcloud.com/...",
      "label": "SoundCloud",
      "order": 1
    }
  ],
  "order": 0,
  "isActive": true
}
```

### works.json

```json
{
  "slug": "minimal-stories",
  "titleFr": "Minimal Stories",
  "titleEn": "Minimal Stories",
  "subtitleFr": "See Details",
  "subtitleEn": "See Details",
  "descriptionFr": "",
  "descriptionEn": "",
  "category": "Album de librairie musicale",
  "coverImage": "public/images/projets/albums/pgo0022.jpg",
  "coverImageExists": true,
  "releaseDate": "03/09/2018",
  "genre": "Instrumentaux / Minimaliste",
  "duration": null,
  "isrc": null,
  "externalUrl": "https://open.spotify.com/...",
  "spotifyUrl": "https://open.spotify.com/...",
  "labelSlug": null,
  "composers": [
    {
      "slug": "laurent-dury",
      "name": "Laurent Dury",
      "role": "composer"
    }
  ],
  "isActive": true,
  "order": 1
}
```

## 🚀 Utilisation

Le seed utilise uniquement les fichiers de ce dossier :

```bash
# Reset + seed
pnpm prisma migrate reset --force

# Seed uniquement
pnpm db:seed
```

## ✅ Avantages de cette structure

1. **Source de vérité unique** : Un seul endroit pour toutes les données
2. **Validation automatique** : Les works sans images sont filtrés
3. **Fusion intelligente** : Compositeurs + liens multiples fusionnés
4. **Traductions centralisées** : FR + EN dans les mêmes fichiers
5. **Maintenabilité** : Fichiers JSON simples et lisibles

## 🔍 Validation des images

Le script `generate-works.ts` vérifie l'existence physique de chaque image :

- ✅ `coverImageExists: true` → Work sera seedé
- ❌ `coverImageExists: false` → Work sera filtré

Seuls les works avec des images valides sont insérés en base de données.

## 📝 Notes importantes

- Les chemins d'images sont normalisés en lowercase + .jpg
- Les labels sont détectés automatiquement depuis les chemins (documentaires/13prods/ → label: 13prods)
- Les compositeurs sont mappés par slug normalisé
- Les expertises markdown doivent avoir le même nom de fichier en FR et EN
