import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function findMissing() {
  console.log('=== IDENTIFICATION DES DONNÉES MANQUANTES ===\n');
  
  const worksDB = await prisma.work.findMany({
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      }
    },
    orderBy: {
      slug: 'asc'
    }
  });
  
  const metadataFr = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/projets/fr/metadata.json'), 'utf8')
  );
  
  const slugsInJSON = new Set(metadataFr.map((w: any) => w.slug));
  
  console.log('WORKS DANS DB MAIS PAS DANS JSON:');
  console.log('Total:', worksDB.length - metadataFr.length, 'works manquants\n');
  
  const missingWorks = worksDB.filter(work => !slugsInJSON.has(work.slug));
  
  missingWorks.forEach(work => {
    const titleFr = work.translations.find(t => t.locale === 'fr')?.title;
    const categoryFr = work.category.translations.find(t => t.locale === 'fr')?.name;
    console.log('Slug:', work.slug);
    console.log('  Titre:', titleFr);
    console.log('  Categorie:', categoryFr);
    console.log('  Annee:', work.year || 'N/A');
    console.log('  Spotify:', work.spotifyUrl ? 'Oui' : 'Non');
    console.log('  External:', work.externalUrl ? 'Oui' : 'Non');
    console.log('');
  });
  
  console.log('\n=== LIENS COMPOSITEURS ===\n');
  
  const composersDB = await prisma.composer.findMany({
    include: {
      translations: true,
      links: true
    },
    orderBy: {
      slug: 'asc'
    }
  });
  
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
  
  console.log('COMPOSITEURS AVEC LIENS EN DB:');
  composersDB.forEach(comp => {
    const totalLinks = comp.links.length + (comp.externalUrl ? 1 : 0);
    if (totalLinks > 0) {
      const name = comp.translations.find(t => t.locale === 'fr')?.name;
      console.log('\n', name, ':');
      
      if (comp.externalUrl) {
        console.log('  - externalUrl:', comp.externalUrl);
      }
      
      comp.links.forEach(link => {
        console.log('  - ComposerLink (', link.platform, '):', link.url);
      });
      
      const jsonComp = composersJSON.get(name || '');
      if (jsonComp) {
        console.log('  JSON links:', jsonComp.links);
      } else {
        console.log('  ATTENTION: PAS TROUVE DANS JSON');
      }
    }
  });
  
  console.log('\n\n=== EXPERTISE MANQUANTE ===\n');
  
  const expertisesDB = await prisma.expertise.findMany({
    include: {
      translations: true
    }
  });
  
  const expertisesFr = fs.existsSync(path.join(process.cwd(), 'content/expertises/fr'))
    ? fs.readdirSync(path.join(process.cwd(), 'content/expertises/fr')).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
    : [];
  
  expertisesDB.forEach(exp => {
    if (!expertisesFr.includes(exp.slug)) {
      const titleFr = exp.translations.find(t => t.locale === 'fr')?.title;
      console.log('EN DB MAIS PAS EN FICHIER:', exp.slug);
      console.log('   Titre:', titleFr);
    }
  });
  
  await prisma.$disconnect();
}

findMissing().catch(console.error);
