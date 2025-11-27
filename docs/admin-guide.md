# Guide Admin Synck

## Acces

URL: `/{locale}/admin` (ex: `/fr/admin`)

Authentification requise: email + password (role ADMIN)

## Fonctionnalites

### Gestion des Projets

- **Liste**: Filtrage par categorie, label, statut
- **Creation**: Formulaire complet avec traductions FR/EN
- **Edition**: Mise a jour avec historique des versions
- **Duplication**: Clone un projet existant
- **Actions en masse**: Export, suppression multiple

### Gestion des Artistes

- **Profils**: Nom, bio, photo, liens sociaux
- **Traductions**: FR/EN
- **Liens**: YouTube, Spotify, SoundCloud, etc.

### Gestion des Categories

- **Couleur**: Hex personnalisee
- **Icone**: Lucide React icons
- **Ordre**: Tri d'affichage

### Gestion des Labels

- **Website**: URL optionnelle
- **Logo**: Image associee

### Gestion des Expertises

- **Contenu**: Markdown avec sections
- **Images**: Cover + images internes

### Mediatheque

- **Upload**: Images vers Vercel Blob
- **Metadata**: Width, height, blur placeholder
- **Suppression**: Individuelle ou en masse

### Export/Import

- **Formats**: JSON, CSV, XLS
- **Entites**: Works, artists, categories, labels
- **Historique**: Trace des exports

### Parametres

- **Profil**: Email, nom, avatar
- **Securite**: Mot de passe, 2FA
- **Sessions**: Historique connexions

### Monitoring

- **Audit logs**: Toutes les actions tracees
- **Duplicates**: Detection automatique
- **Stats**: Metriques globales

## API Admin

Base: `/api/admin/`

| Endpoint         | Methodes          | Description               |
| ---------------- | ----------------- | ------------------------- |
| `/projects`      | GET, POST         | Liste/creation works      |
| `/projects/[id]` | GET, PUT, DELETE  | CRUD work                 |
| `/artists`       | GET, POST         | Liste/creation artistes   |
| `/categories`    | GET, POST         | Liste/creation categories |
| `/labels`        | GET, POST         | Liste/creation labels     |
| `/expertises`    | GET, POST         | Liste/creation expertises |
| `/assets`        | GET, POST, DELETE | Gestion images            |
| `/upload`        | POST              | Upload image              |
| `/exports/*`     | GET               | Export donnees            |
| `/imports/*`     | POST              | Import donnees            |
| `/logs`          | GET               | Audit logs                |
| `/stats`         | GET               | Statistiques              |
