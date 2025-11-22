#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKS_FILE = path.join(__dirname, '../seed-data/works.json');

console.log('🧹 Nettoyage et transformation de works.json...\n');

// Lire le fichier works.json
const worksData = JSON.parse(fs.readFileSync(WORKS_FILE, 'utf-8'));

let cleaned = 0;
let transformed = 0;

// Parcourir tous les works
for (const work of worksData) {
  // 1. Supprimer les champs inutiles
  const hadDuration = 'duration' in work;
  const hadIsrc = 'isrc' in work;
  const hadLabelSlug = 'labelSlug' in work;

  delete work.duration;
  delete work.isrc;
  delete work.labelSlug;

  if (hadDuration || hadIsrc || hadLabelSlug) {
    cleaned++;
  }

  // 2. Transformer productionCompanySlug en tableau pour les documentaires
  if (work.category?.toLowerCase() === 'documentaire' && work.productionCompanySlug) {
    // Si c'est déjà un tableau, on le laisse tel quel
    if (!Array.isArray(work.productionCompanySlug)) {
      work.productionCompanySlug = [work.productionCompanySlug];
      transformed++;
    }
  }
}

// Sauvegarder le fichier modifié
fs.writeFileSync(WORKS_FILE, JSON.stringify(worksData, null, 2), 'utf-8');

console.log(`✅ Nettoyage terminé!`);
console.log(`   ${cleaned} works nettoyés (duration, isrc, labelSlug supprimés)`);
console.log(`   ${transformed} productionCompanySlug transformés en tableaux`);
console.log(`\n💾 Fichier sauvegardé: ${WORKS_FILE}`);

// Statistiques des sociétés de production
const stats = {};
worksData
  .filter(w => w.category?.toLowerCase() === 'documentaire' && w.productionCompanySlug)
  .forEach(w => {
    const companies = Array.isArray(w.productionCompanySlug)
      ? w.productionCompanySlug
      : [w.productionCompanySlug];

    companies.forEach(company => {
      stats[company] = (stats[company] || 0) + 1;
    });
  });

console.log(`\n📋 Sociétés de production:`);
Object.entries(stats)
  .sort(([, a], [, b]) => b - a)
  .forEach(([company, count]) => {
    console.log(`   - ${company}: ${count} documentaires`);
  });
