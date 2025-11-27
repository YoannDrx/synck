# Synck Seed

Reset et seed la base de donnees de developpement.

## Actions a effectuer

1. **Confirmation** (optionnel)
   - Demande confirmation avant de reset si doute

2. **Execution**
   - Execute `pnpm db:setup` (alias de db:reset:seed)
   - Attend la fin de l'execution

3. **Verification**
   - Verifie que le seed a reussi
   - Affiche les statistiques (nombre de works, artists, categories, etc.)

4. **Rapport**
   Retourne :
   - Status: OK/ERREUR
   - Nombre d'entites creees
   - Temps d'execution
   - Prochaine etape (lancer `pnpm dev`)

## Attention

Cette commande :

- Reset COMPLETEMENT la base de developpement
- Ne touche PAS la production
- Utilise `.env.local` (Neon dev branch)
