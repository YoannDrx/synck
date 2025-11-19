import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function compare() {
  console.log('=== COMPARAISON DÉTAILLÉE DB vs FICHIERS ===\n');
  
  // COMPOSITEURS
  const composersDB = await prisma.composer.findMany({
    include: {
      translations: true,
      links: true
    }
  });
  
  const metadataFr = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/projets/fr/metadata.json'), 'utf8')
  );
  
  const composersJSON = new Map<string, any>();
  metadataFr.forEach((work: any) => {
    if (work.compositeurs && Array.isArray(work.compositeurs)) {
      work.compositeurs.forEach((comp: any) => {
        if (comp.name && !composersJSON.has(comp.name)) {
          composersJSON.set(comp.name, comp);
        }
      });
    }
  });
  
  console.log('COMPOSITEURS:');
  console.log('DB:', composersDB.length);
  console.log('JSON:', composersJSON.size);
  console.log('Différence:', composersDB.length - composersJSON.size);
  
  // Vérifier les liens
  console.log('\nLIENS COMPOSITEURS:');
  let composersWithLinksInDB = 0;
  let composersWithMultipleLinksInDB = 0;
  
  composersDB.forEach(comp => {
    if (comp.links.length > 0 || comp.externalUrl) {
      composersWithLinksInDB++;
    }
    if (comp.links.length > 1) {
      composersWithMultipleLinksInDB++;
    }
  });
  
  let composersWithLinksInJSON = 0;
  composersJSON.forEach(comp => {
    if (comp.links) {
      composersWithLinksInJSON++;
    }
  });
  
  console.log('DB avec liens (ComposerLink ou externalUrl):', composersWithLinksInDB);
  console.log('DB avec liens multiples (ComposerLink):', composersWithMultipleLinksInDB);
  console.log('JSON avec liens:', composersWithLinksInJSON);
  
  // WORKS
  const worksDB = await prisma.work.findMany({
    include: {
      translations: true
    }
  });
  
  console.log('\nWORKS:');
  console.log('DB:', worksDB.length);
  console.log('JSON:', metadataFr.length);
  console.log('Différence:', worksDB.length - metadataFr.length);
  
  // EXPERTISES
  const expertisesDB = await prisma.expertise.findMany({
    include: {
      translations: true
    }
  });
  
  const expertisesFrDir = path.join(process.cwd(), 'content/expertises/fr');
  const expertisesEnDir = path.join(process.cwd(), 'content/expertises/en');
  
  const expertisesFr = fs.existsSync(expertisesFrDir) 
    ? fs.readdirSync(expertisesFrDir).filter(f => f.endsWith('.md'))
    : [];
  const expertisesEn = fs.existsSync(expertisesEnDir)
    ? fs.readdirSync(expertisesEnDir).filter(f => f.endsWith('.md'))
    : [];
  
  console.log('\nEXPERTISES:');
  console.log('DB:', expertisesDB.length);
  console.log('Fichiers FR:', expertisesFr.length);
  console.log('Fichiers EN:', expertisesEn.length);
  
  // Liste expertises DB
  console.log('\nExpertises en DB:');
  expertisesDB.forEach(exp => {
    const titleFr = exp.translations.find(t => t.locale === 'fr')?.title;
    console.log(`  - ${exp.slug}: ${titleFr}`);
  });
  
  console.log('\nExpertises fichiers FR:');
  expertisesFr.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  await prisma.$disconnect();
}

compare().catch(console.error);
