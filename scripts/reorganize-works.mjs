#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKS_FILE = path.join(__dirname, '../seed-data/works.json');

console.log('🔄 Réorganisation de works.json...\n');

const worksData = JSON.parse(fs.readFileSync(WORKS_FILE, 'utf-8'));

// Fonction pour obtenir le premier slug de production company
const getFirstProductionCompany = (work) => {
  if (!work.productionCompanySlug) return '';
  if (Array.isArray(work.productionCompanySlug)) {
    return work.productionCompanySlug[0] || '';
  }
  return work.productionCompanySlug;
};

// Grouper par catégorie logique
const worksByCategory = {
  'albums': [],
  'synchros': [],
  'vinyles': [],
  'documentaires': []
};

for (const work of worksData) {
  const category = work.category?.toLowerCase();

  if (category === 'album-de-librairie-musicale') {
    worksByCategory['albums'].push(work);
  } else if (category === 'synchro' || category === 'clip') {
    worksByCategory['synchros'].push(work);
  } else if (category === 'vinyle') {
    worksByCategory['vinyles'].push(work);
  } else if (category === 'documentaire') {
    worksByCategory['documentaires'].push(work);
  } else {
    console.warn(`⚠️  Catégorie inconnue pour "${work.titleFr}": ${work.category}`);
  }
}

// Trier chaque catégorie
// Albums : par ordre alphabétique
worksByCategory['albums'].sort((a, b) => {
  return (a.titleFr || '').localeCompare(b.titleFr || '', 'fr', { sensitivity: 'base' });
});

// Synchros (synchro + clip) : par ordre alphabétique
worksByCategory['synchros'].sort((a, b) => {
  return (a.titleFr || '').localeCompare(b.titleFr || '', 'fr', { sensitivity: 'base' });
});

// Vinyles : par ordre alphabétique
worksByCategory['vinyles'].sort((a, b) => {
  return (a.titleFr || '').localeCompare(b.titleFr || '', 'fr', { sensitivity: 'base' });
});

// Documentaires : par société de production puis par ordre alphabétique
worksByCategory['documentaires'].sort((a, b) => {
  const companyA = getFirstProductionCompany(a);
  const companyB = getFirstProductionCompany(b);

  if (companyA === companyB) {
    return (a.titleFr || '').localeCompare(b.titleFr || '', 'fr', { sensitivity: 'base' });
  }
  return companyA.localeCompare(companyB);
});

// Reconstruire le tableau dans l'ordre et réattribuer les numéros d'ordre
const reorganizedWorks = [];
let currentOrder = 1;

console.log('📊 Statistiques par catégorie:\n');

// Ordre d'affichage des catégories
const categoryDisplayOrder = ['albums', 'synchros', 'vinyles', 'documentaires'];

for (const categoryKey of categoryDisplayOrder) {
  const works = worksByCategory[categoryKey];
  const displayName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
  console.log(`   ${displayName}: ${works.length} works`);

  for (const work of works) {
    work.order = currentOrder++;
    reorganizedWorks.push(work);
  }
}

console.log(`\n   Total: ${reorganizedWorks.length} works\n`);

// Sauvegarder
fs.writeFileSync(WORKS_FILE, JSON.stringify(reorganizedWorks, null, 2), 'utf-8');

console.log('✅ Fichier réorganisé avec succès!');
console.log(`   Ordre: Albums (${worksByCategory['albums'].length}) → Synchros (${worksByCategory['synchros'].length}) → Vinyles (${worksByCategory['vinyles'].length}) → Documentaires (${worksByCategory['documentaires'].length})`);

// Afficher un aperçu des documentaires par société de production
console.log('\n📁 Documentaires par société de production:');
const docsByCompany = {};
for (const doc of worksByCategory['documentaires']) {
  const company = getFirstProductionCompany(doc);
  if (!docsByCompany[company]) {
    docsByCompany[company] = 0;
  }
  docsByCompany[company]++;
}

for (const [company, count] of Object.entries(docsByCompany).sort()) {
  const displayName = company
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  console.log(`   ${displayName}: ${count}`);
}
