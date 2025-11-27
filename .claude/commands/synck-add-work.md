# Synck Add Work

Workflow guide pour ajouter un nouveau work (oeuvre musicale).

## Informations a collecter

Demande a l'utilisateur :

1. **Titre FR** (obligatoire)
2. **Titre EN** (obligatoire)
3. **Categorie** (Musique, Documentaire, Film, etc.)
4. **Label** (optionnel)
5. **Annee** (optionnel)
6. **Description FR** (optionnel)
7. **Description EN** (optionnel)
8. **Artistes associes** (optionnel)

## Generation du slug

Genere automatiquement depuis le titre FR :

- Lowercase
- Remplace espaces par tirets
- Supprime caracteres speciaux
- Exemple: "La Belle Histoire" → "la-belle-histoire"

## Creation

### Option A : Via Prisma (recommande pour dev)

```typescript
await prisma.work.create({
  data: {
    slug: 'la-belle-histoire',
    titleFr: 'La Belle Histoire',
    titleEn: 'The Beautiful Story',
    year: 2024,
    status: 'DRAFT',
    category: { connect: { slug: 'musique' } },
    // ...
  },
})
```

### Option B : Via API Admin

```bash
curl -X POST http://localhost:3000/api/admin/projects \
  -H "Content-Type: application/json" \
  -d '{"slug": "...", "titleFr": "...", ...}'
```

## Verification

Apres creation :

1. Verifie que le work existe en base
2. Affiche l'URL de preview : `/{locale}/projets/{slug}`
3. Rappelle que le statut est DRAFT (non publie)

## Prochaines etapes

- Ajouter une image de couverture
- Associer des artistes
- Passer en PUBLISHED quand pret
