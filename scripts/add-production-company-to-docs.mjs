#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKS_FILE = path.join(__dirname, '../seed-data/works.json');

console.log('🎬 Ajout des sociétés de production aux documentaires...\n');

// Lire le fichier works.json
const worksData = JSON.parse(fs.readFileSync(WORKS_FILE, 'utf-8'));

let updated = 0;

// Parcourir tous les documentaires
for (const work of worksData) {
  if (work.category?.toLowerCase() !== 'documentaire') continue;

  // Extraire la société de production depuis le chemin de l'image
  if (work.coverImage) {
    // Format: public/images/projets/documentaires/13prods/nom-fichier.jpg
    const pathParts = work.coverImage.split('/');
    const productionCompanyIndex = pathParts.findIndex(part => part === 'documentaires');

    if (productionCompanyIndex !== -1 && productionCompanyIndex + 1 < pathParts.length) {
      const productionCompany = pathParts[productionCompanyIndex + 1];

      // Vérifier que c'est bien un dossier de société de production (pas un fichier)
      if (!productionCompany.includes('.jpg') && !productionCompany.includes('.jpeg') &&
          !productionCompany.includes('.png') && !productionCompany.includes('.webp')) {

        work.productionCompanySlug = productionCompany;
        updated++;

        console.log(`   ✅ ${work.slug}`);
        console.log(`      Société: ${productionCompany}`);
      }
    }
  }
}

// Sauvegarder le fichier modifié
fs.writeFileSync(WORKS_FILE, JSON.stringify(worksData, null, 2), 'utf-8');

console.log(`\n✅ Mise à jour terminée!`);
console.log(`   ${updated} documentaires mis à jour avec leur société de production`);
console.log(`\n💾 Fichier sauvegardé: ${WORKS_FILE}`);

// Lister les sociétés de production uniques trouvées
const productionCompanies = new Set(
  worksData
    .filter(w => w.category?.toLowerCase() === 'documentaire' && w.productionCompanySlug)
    .map(w => w.productionCompanySlug)
);

console.log(`\n📋 Sociétés de production trouvées:`);
for (const company of productionCompanies) {
  const count = worksData.filter(
    w => w.category?.toLowerCase() === 'documentaire' && w.productionCompanySlug === company
  ).length;
  console.log(`   - ${company}: ${count} documentaires`);
}
