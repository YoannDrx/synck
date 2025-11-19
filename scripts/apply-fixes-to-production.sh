#!/bin/bash

echo "🚀 APPLICATION DES CORRECTIONS EN PRODUCTION"
echo "=============================================="
echo ""
echo "Cette commande va :"
echo "1. Corriger les chemins d'assets (casse + extensions)"
echo "2. Ajouter les dimensions manquantes aux images"
echo ""
echo "⚠️  IMPORTANT : Assurez-vous que le fichier .env pointe vers PRODUCTION"
echo ""
read -p "Continuer? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "📝 Étape 1/2 : Correction des chemins d'assets..."
npx tsx scripts/fix-asset-paths.ts

echo ""
echo "📐 Étape 2/2 : Ajout des dimensions..."
npx tsx scripts/populate-dimensions-with-sharp.ts

echo ""
echo "✅ TERMINÉ !"
echo ""
echo "Les corrections ont été appliquées en production."
echo "Vérifiez votre site en ligne pour confirmer que les images s'affichent."
