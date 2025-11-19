import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyze() {
  console.log('=== ANALYSE BASE DE DONNÉES NEON ===\n');
  
  const composers = await prisma.composer.findMany({
    include: {
      translations: true,
      links: true,
      image: true,
      _count: {
        select: { contributions: true }
      }
    },
    orderBy: { slug: 'asc' }
  });
  
  console.log('1. COMPOSITEURS:');
  console.log('Total en DB:', composers.length);
  
  const mutantNinja = composers.find(c => 
    c.translations.some(t => t.name.toLowerCase().includes('mutant'))
  );
  
  if (mutantNinja) {
    console.log('\nMUTANT NINJA RECORDS:');
    console.log('Slug:', mutantNinja.slug);
    console.log('ExternalUrl (legacy):', mutantNinja.externalUrl);
    console.log('Liens (ComposerLink):');
    mutantNinja.links.forEach(link => {
      console.log('  - Platform:', link.platform, 'URL:', link.url);
    });
  }
  
  const composersWithMultipleLinks = composers.filter(c => c.links.length > 1);
  console.log('\nCompositeurs avec liens multiples:', composersWithMultipleLinks.length);
  
  const works = await prisma.work.findMany({
    include: {
      translations: true,
      category: { include: { translations: true } },
      _count: { select: { contributions: true } }
    }
  });
  
  console.log('\n2. WORKS:');
  console.log('Total en DB:', works.length);
  console.log('Avec Spotify URL:', works.filter(w => w.spotifyUrl).length);
  console.log('Avec External URL:', works.filter(w => w.externalUrl).length);
  console.log('Avec Genre:', works.filter(w => w.genre).length);
  console.log('Avec ISRC:', works.filter(w => w.isrcCode).length);
  
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
      _count: { select: { works: true } }
    }
  });
  
  console.log('\n3. CATEGORIES:');
  console.log('Total en DB:', categories.length);
  categories.forEach(cat => {
    const name = cat.translations.find(t => t.locale === 'fr')?.name || 'N/A';
    console.log('  -', cat.slug, ':', name, '(', cat._count.works, 'works)');
  });
  
  const labels = await prisma.label.findMany({
    include: {
      translations: true,
      _count: { select: { works: true } }
    }
  });
  
  console.log('\n4. LABELS:');
  console.log('Total en DB:', labels.length);
  
  const expertises = await prisma.expertise.findMany({
    include: { translations: true }
  });
  
  console.log('\n5. EXPERTISES:');
  console.log('Total en DB:', expertises.length);
  expertises.forEach(exp => {
    const title = exp.translations.find(t => t.locale === 'fr')?.title || 'N/A';
    console.log('  -', exp.slug, ':', title);
  });
  
  await prisma.$disconnect();
}

analyze().catch(console.error);
