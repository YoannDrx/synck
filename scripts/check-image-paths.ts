import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const IMAGE_BASE = '/Users/yoannandrieux/Projets/synck/public';

async function main() {
  console.log('\n🔍 VÉRIFICATION DES CHEMINS D\'IMAGES\n');

  const works = await prisma.work.findMany({
    where: {
      category: {
        slug: 'documentaire'
      }
    },
    include: {
      coverImage: true,
      translations: {
        where: { locale: 'fr' }
      },
      label: true
    },
    orderBy: {
      order: 'asc'
    }
  });

  console.log(`📊 ${works.length} documentaires trouvés\n`);
  console.log('='.repeat(80) + '\n');

  let missingCount = 0;
  let okCount = 0;

  for (const work of works) {
    const translation = work.translations[0];
    const imagePath = work.coverImage?.path;

    if (!imagePath) {
      console.log(`⚠️  PAS D'IMAGE : "${translation?.title || work.slug}" (${work.label?.slug})`);
      missingCount++;
      continue;
    }

    const fullPath = path.join(IMAGE_BASE, imagePath);
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      console.log(`❌ FICHIER MANQUANT : "${translation?.title || work.slug}"`);
      console.log(`   Chemin BDD: ${imagePath}`);
      console.log(`   Label: ${work.label?.slug}`);
      console.log('');
      missingCount++;
    } else {
      okCount++;
    }
  }

  console.log('='.repeat(80));
  console.log(`\n📊 RÉSUMÉ:`);
  console.log(`   ✅ ${okCount} images OK`);
  console.log(`   ❌ ${missingCount} images manquantes`);
  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Erreur:', error);
  prisma.$disconnect();
  process.exit(1);
});
