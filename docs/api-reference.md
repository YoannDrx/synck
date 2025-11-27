# API Reference Synck

Base URL: `https://carolinesenyk.fr/api`

## Routes Publiques

### GET /api/projets

Liste des oeuvres publiees.

**Query params**:

- `locale`: `fr` | `en` (defaut: `fr`)
- `limit`: number (optionnel)
- `category`: string (slug, optionnel)
- `label`: string (slug, optionnel)

**Response**: `Work[]`

### GET /api/artists

Liste des artistes.

**Query params**:

- `locale`: `fr` | `en`

**Response**: `Artist[]`

### GET /api/categories

Categories actives.

**Query params**:

- `locale`: `fr` | `en`

**Response**: `Category[]`

### POST /api/contact

Envoi formulaire contact.

**Body**:

```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

**Response**: `{ success: boolean }`

## Routes Admin (Authentifiees)

Toutes les routes `/api/admin/*` requierent une session authentifiee avec role `ADMIN`.

### Projects

| Method | Endpoint                         | Description      |
| ------ | -------------------------------- | ---------------- |
| GET    | `/admin/projects`                | Liste paginee    |
| POST   | `/admin/projects`                | Creer            |
| GET    | `/admin/projects/[id]`           | Details          |
| PUT    | `/admin/projects/[id]`           | Modifier         |
| DELETE | `/admin/projects/[id]`           | Supprimer        |
| POST   | `/admin/projects/[id]/duplicate` | Dupliquer        |
| POST   | `/admin/projects/bulk`           | Actions en masse |

### Artists

| Method | Endpoint              | Description |
| ------ | --------------------- | ----------- |
| GET    | `/admin/artists`      | Liste       |
| POST   | `/admin/artists`      | Creer       |
| PUT    | `/admin/artists/[id]` | Modifier    |
| DELETE | `/admin/artists/[id]` | Supprimer   |

### Categories

| Method | Endpoint                 | Description |
| ------ | ------------------------ | ----------- |
| GET    | `/admin/categories`      | Liste       |
| POST   | `/admin/categories`      | Creer       |
| PUT    | `/admin/categories/[id]` | Modifier    |
| DELETE | `/admin/categories/[id]` | Supprimer   |

### Labels

| Method | Endpoint             | Description |
| ------ | -------------------- | ----------- |
| GET    | `/admin/labels`      | Liste       |
| POST   | `/admin/labels`      | Creer       |
| PUT    | `/admin/labels/[id]` | Modifier    |
| DELETE | `/admin/labels/[id]` | Supprimer   |

### Assets

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| GET    | `/admin/assets`             | Liste              |
| POST   | `/admin/upload`             | Upload image       |
| DELETE | `/admin/assets/[id]`        | Supprimer          |
| POST   | `/admin/assets/bulk-delete` | Supprimer multiple |

### Export/Import

| Method | Endpoint                  | Description     |
| ------ | ------------------------- | --------------- |
| GET    | `/admin/exports/projects` | Export works    |
| GET    | `/admin/exports/artists`  | Export artistes |
| GET    | `/admin/exports/all`      | Export tout     |
| POST   | `/admin/imports/projects` | Import works    |
| GET    | `/admin/exports/history`  | Historique      |

### Monitoring

| Method | Endpoint                       | Description  |
| ------ | ------------------------------ | ------------ |
| GET    | `/admin/logs`                  | Audit logs   |
| GET    | `/admin/stats`                 | Statistiques |
| GET    | `/admin/monitoring/duplicates` | Duplicates   |

## Codes d'erreur

| Code | Description              |
| ---- | ------------------------ |
| 200  | Success                  |
| 201  | Created                  |
| 400  | Bad Request (validation) |
| 401  | Unauthorized             |
| 403  | Forbidden                |
| 404  | Not Found                |
| 500  | Server Error             |
