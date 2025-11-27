# Synck Design Audit

Audit complet du design system pour identifier les incoherences.

## Actions a effectuer

### 1. Recherche de couleurs hardcoded

Recherche dans `/components/` et `/app/` :

- `lime-[0-9]` (ex: lime-300, lime-400)
- `emerald-[0-9]` (ex: emerald-400)
- `teal-[0-9]` (ex: teal-500)
- `text-white` (potentiel, selon contexte)
- `border-white/` (devrait etre var(--color-border))

### 2. Verification des tokens

Verifie que les tokens du design system sont utilises :

- `var(--brand-neon)` pour lime
- `var(--brand-emerald)` pour emerald
- `var(--color-text-primary)` pour blanc
- `var(--color-border)` pour bordures

### 3. Analyse des composants

Pour chaque fichier avec des couleurs hardcoded :

- Localisation (fichier:ligne)
- Couleur actuelle
- Remplacement recommande

## Rapport

### Format du rapport

```
AUDIT DESIGN SYSTEM - SYNCK
============================

Fichiers analyses : X
Incoherences trouvees : Y

DETAILS PAR FICHIER
-------------------

[fichier.tsx]
  Ligne X: text-lime-300 → text-[var(--brand-neon)]
  Ligne Y: bg-emerald-400 → bg-[var(--brand-emerald)]

RESUME
------
- Couleurs lime: N occurrences
- Couleurs emerald: N occurrences
- Couleurs teal: N occurrences

ACTIONS RECOMMANDEES
--------------------
1. Corriger les fichiers critiques (hero, header, contact)
2. Activer le mode strict dans CI
3. Documenter les exceptions valides
```

## Priorisations

1. **Critique** : Fichiers de layout/navigation
2. **Haute** : Composants de section
3. **Moyenne** : Composants admin
4. **Basse** : Composants utilitaires
