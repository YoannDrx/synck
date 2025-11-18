import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔄 FUSION DES CATÉGORIES DOCUMENTAIRE(S)\n');
  console.log('='.repeat(70) + '\n');

  const docSingulier = await prisma.category.findUnique({
    where: { slug: 'documentaire' },
    include: {
      _count: { select: { works: true } },
      translations: true
    }
  });

  const docPluriel = await prisma.category.findUnique({
    where: { slug: 'documentaires' },
    include: {
      _count: { select: { works: true } },
      translations: true
    }
  });

  console.log('📊 ÉTAT ACTUEL:');
  if (docSingulier) {
    console.log('   ✅ "documentaire" (singulier):', docSingulier._count.works, 'works');
  } else {
    console.log('   ⚠️  "documentaire" (singulier): NON TROUVÉ');
  }

  if (docPluriel) {
    console.log('   ⚠️  "documentaires" (pluriel):', docPluriel._count.works, 'works');
  } else {
    console.log('   ✅ "documentaires" (pluriel): NON TROUVÉ');
  }

  if (docSingulier && docPluriel) {
    console.log('\n🔧 FUSION EN COURS...\n');

    const result = await prisma.work.updateMany({
      where: { categoryId: docPluriel.id },
      data: { categoryId: docSingulier.id }
    });

    console.log('   ✅', result.count, 'works déplacés vers "documentaire"');

    await prisma.category.update({
      where: { id: docPluriel.id },
      data: { isActive: false }
    });

    console.log('   ✅ Catégorie "documentaires" désactivée');

    const newCount = await prisma.work.count({
      where: { categoryId: docSingulier.id }
    });

    console.log('\n📊 RÉSULTAT FINAL:', newCount, 'works dans "documentaire"');
  }

  console.log('\n' + '='.repeat(70) + '\n');
  await prisma.$disconnect();
}

main().catch(console.error);
