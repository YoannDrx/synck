#!/bin/bash
# Script de verification des tokens du design system
# Echoue si des couleurs Tailwind hardcoded sont trouvees dans les composants
# (hors exceptions valides comme les categoryAccents et palettes)

set -e

echo "Verification des tokens du design system..."

# Patterns de couleurs Tailwind a eviter
PATTERNS="lime-[0-9]\|emerald-[0-9]\|teal-[0-9]"

# Fichiers avec des couleurs intentionnellement variees (categoryAccents, palettes)
# Ces fichiers sont exclus car ils utilisent des couleurs differentes par categorie
EXCLUDED_FILES="motion-orbs.tsx\|infinite-marquee.tsx\|documentaires-gallery.tsx\|projets-page-client.tsx\|projet-detail-client.tsx"

# Recherche dans les composants (exclut node_modules, .next et fichiers intentionnels)
FOUND=$(grep -rn "$PATTERNS" \
  --include="*.tsx" \
  --include="*.ts" \
  components/ app/ \
  2>/dev/null | grep -v "$EXCLUDED_FILES" || true)

if [ -n "$FOUND" ]; then
  echo ""
  echo "ERREUR: Couleurs Tailwind hardcoded trouvees!"
  echo "Utilisez les variables CSS a la place (ex: var(--brand-neon))"
  echo ""
  echo "Occurrences trouvees:"
  echo "$FOUND"
  echo ""
  echo "Regles:"
  echo "  - text-lime-300    -> text-[var(--brand-neon)]"
  echo "  - bg-lime-300      -> bg-[var(--brand-neon)]"
  echo "  - border-lime-300  -> border-[var(--brand-neon)]"
  echo "  - emerald-400      -> var(--brand-emerald)"
  echo "  - teal-500         -> var(--brand-teal)"
  echo ""
  echo "Note: certains fichiers sont exclus (categoryAccents, palettes)"
  echo "      car ils utilisent des couleurs variees intentionnellement."
  echo ""

  # Compter les occurrences
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  echo "Total: $COUNT occurrences a corriger"

  # Mode strict active - bloque le CI
  exit 1
else
  echo "OK: Aucune couleur Tailwind hardcoded trouvee."
  echo "(Fichiers avec couleurs intentionnelles exclus)"
  exit 0
fi
