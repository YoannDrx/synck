# Synck Status

Analyse l'etat actuel du projet Synck et retourne un rapport complet.

## Actions a effectuer

1. **Etat de la base de donnees**
   - Execute `pnpm db:status` pour voir l'etat des migrations
   - Compte le nombre d'entites en base si possible

2. **Etat du code**
   - Verifie s'il y a des fichiers non commites avec `git status`
   - Verifie la branche actuelle

3. **Verification design system**
   - Execute `./scripts/check-design-tokens.sh` pour verifier les couleurs hardcoded

4. **Synthese**
   Retourne un rapport structure avec :
   - Etat migrations (OK/PENDING)
   - Fichiers modifies
   - Alertes design system
   - Prochaines actions recommandees
