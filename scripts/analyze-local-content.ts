import fs from 'fs';
import path from 'path';

function analyzeJSON() {
  console.log('=== ANALYSE FICHIERS LOCAUX ===\n');
  
  // 1. Metadata FR
  const metadataFrPath = path.join(process.cwd(), 'content/projets/fr/metadata.json');
  const metadataFr = JSON.parse(fs.readFileSync(metadataFrPath, 'utf8'));
  
  console.log('1. WORKS (metadata.json FR):');
  console.log('Total:', metadataFr.length);
  
  // Extraire compositeurs uniques
  const composersSet = new Set<string>();
  const composersLinks = new Map<string, any>();
  
  metadataFr.forEach((work: any) => {
    if (work.compositeurs && Array.isArray(work.compositeurs)) {
      work.compositeurs.forEach((comp: any) => {
        if (comp.name) {
          composersSet.add(comp.name);
          if (comp.links) {
            composersLinks.set(comp.name, comp.links);
          }
        }
      });
    }
  });
  
  console.log('\n2. COMPOSITEURS (extraits des works):');
  console.log('Total unique:', composersSet.size);
  
  // Chercher Mutant Ninja
  const mutantNinjaName = Array.from(composersSet).find(name => 
    name.toLowerCase().includes('mutant')
  );
  
  if (mutantNinjaName) {
    console.log('\nMUTANT NINJA RECORDS dans JSON:');
    console.log('Nom:', mutantNinjaName);
    const links = composersLinks.get(mutantNinjaName);
    console.log('Liens:', JSON.stringify(links, null, 2));
    console.log('Type:', typeof links);
  }
  
  // Analyser formats de liens
  console.log('\nFORMATS DE LIENS:');
  const linkFormats = new Map<string, number>();
  composersLinks.forEach((links, name) => {
    const type = typeof links === 'string' ? 'string' : 
                 typeof links === 'object' && links !== null && Object.keys(links).length === 0 ? 'empty-object' :
                 typeof links === 'object' ? 'object' : 'unknown';
    linkFormats.set(type, (linkFormats.get(type) || 0) + 1);
  });
  linkFormats.forEach((count, type) => {
    console.log(`  ${type}: ${count} compositeurs`);
  });
  
  // Analyser métadonnées works
  const worksWithSpotify = metadataFr.filter((w: any) => w.linkSpotify);
  const worksWithExternal = metadataFr.filter((w: any) => w.externalLink);
  const worksWithGenre = metadataFr.filter((w: any) => w.genre);
  const worksWithRelease = metadataFr.filter((w: any) => w.releaseDate);
  
  console.log('\nMÉTADONNÉES WORKS dans JSON:');
  console.log('  - Avec Spotify:', worksWithSpotify.length);
  console.log('  - Avec External Link:', worksWithExternal.length);
  console.log('  - Avec Genre:', worksWithGenre.length);
  console.log('  - Avec Release Date:', worksWithRelease.length);
  
  // Catégories
  const categoriesSet = new Set<string>();
  metadataFr.forEach((work: any) => {
    if (work.category) {
      categoriesSet.add(work.category);
    }
  });
  
  console.log('\n3. CATÉGORIES dans JSON:');
  console.log('Total unique:', categoriesSet.size);
  Array.from(categoriesSet).forEach(cat => {
    const count = metadataFr.filter((w: any) => w.category === cat).length;
    console.log(`  - ${cat}: ${count} works`);
  });
  
  // Descriptions
  const descDirFr = path.join(process.cwd(), 'content/projets/fr/descriptions');
  const descDirEn = path.join(process.cwd(), 'content/projets/en/descriptions');
  
  let descCountFr = 0;
  let descCountEn = 0;
  
  if (fs.existsSync(descDirFr)) {
    descCountFr = fs.readdirSync(descDirFr).length;
  }
  if (fs.existsSync(descDirEn)) {
    descCountEn = fs.readdirSync(descDirEn).length;
  }
  
  console.log('\n4. DESCRIPTIONS MARKDOWN:');
  console.log('FR:', descCountFr);
  console.log('EN:', descCountEn);
  
  // Expertises
  const expertisesDirFr = path.join(process.cwd(), 'content/expertises/fr');
  const expertisesDirEn = path.join(process.cwd(), 'content/expertises/en');
  
  let expertiseCountFr = 0;
  let expertiseCountEn = 0;
  
  if (fs.existsSync(expertisesDirFr)) {
    expertiseCountFr = fs.readdirSync(expertisesDirFr).filter(f => f.endsWith('.md')).length;
  }
  if (fs.existsSync(expertisesDirEn)) {
    expertiseCountEn = fs.readdirSync(expertisesDirEn).filter(f => f.endsWith('.md')).length;
  }
  
  console.log('\n5. EXPERTISES MARKDOWN:');
  console.log('FR:', expertiseCountFr);
  console.log('EN:', expertiseCountEn);
}

analyzeJSON();
