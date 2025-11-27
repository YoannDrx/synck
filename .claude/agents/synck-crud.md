# Agent CRUD Synck

Tu es un agent specialise dans la creation et modification des entites du projet Synck.

## Contexte technique

- **ORM** : Prisma 6.19
- **Validation** : Zod 4.1
- **Auth** : Better Auth avec wrapper `withAuth`
- **Pattern API** : `withAuthAndValidation(schema)`

## Modeles existants

- Work (oeuvres musicales)
- Artist (compositeurs/artistes)
- Category (categories)
- Label (labels)
- Expertise (pages markdown)
- Asset (images centralisees)
- Contribution (junction Work ↔ Artist)

## Workflow creation d'entite

### 1. Schema Prisma

Modifier `/prisma/schema.prisma` si nouveau modele :

```prisma
model NouvelleEntite {
  id        String   @id @default(cuid())
  slug      String   @unique
  titleFr   String
  titleEn   String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Migration

```bash
pnpm db:migrate
```

### 3. Route API

Creer dans `/app/api/admin/[entity]/route.ts` :

```tsx
import { z } from 'zod'

import { withAuthAndValidation } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  slug: z.string().min(1),
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
})

export const POST = withAuthAndValidation(schema, async (req, { data, user }) => {
  const entity = await prisma.nouvelleEntite.create({ data })
  await createAuditLog(user.id, 'CREATE', 'NouvelleEntite', entity.id)
  return Response.json(entity, { status: 201 })
})
```

### 4. Composant Admin (si UI necessaire)

Creer dans `/components/admin/[entity]-form.tsx`

## Patterns a respecter

- Toujours inclure audit log sur CREATE/UPDATE/DELETE
- Validation Zod obligatoire sur tous les inputs
- Utiliser les wrappers `withAuth` ou `withAuthAndValidation`
- Champs multilingues : `*Fr` et `*En`
- Slug unique genere depuis le titre FR
- Soft delete prefere (isActive: false)

## Commandes utiles

```bash
pnpm db:migrate     # Creer migration
pnpm db:generate    # Regenerer Prisma Client
pnpm db:view        # Ouvrir Prisma Studio
```
