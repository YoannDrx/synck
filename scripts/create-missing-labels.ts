import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Labels à créer (producteurs de documentaires)
const LABELS_TO_CREATE = [
  {
    slug: '13prods',
    name: {
      fr: '13 Productions',
      en: '13 Productions'
    },
    description: {
      fr: 'Société de production audiovisuelle spécialisée dans les documentaires',
      en: 'Audiovisual production company specialized in documentaries'
    },
    website: null
  },
  {
    slug: 'ligne-de-mire',
    name: {
      fr: 'Ligne de Mire',
      en: 'Ligne de Mire'
    },
    description: {
      fr: 'Société de production de documentaires',
      en: 'Documentary production company'
    },
    website: null
  },
  {
    slug: 'little-big-story',
    name: {
      fr: 'Little Big Story',
      en: 'Little Big Story'
    },
    description: {
      fr: 'Société de production de documentaires',
      en: 'Documentary production company'
    },
    website: null
  },
  {
    slug: 'pop-films',
    name: {
      fr: 'Pop Films',
      en: 'Pop Films'
    },
    description: {
      fr: 'Société de production audiovisuelle',
      en: 'Audiovisual production company'
    },
    website: null
  },
  {
    slug: 'via-decouvertes-films',
    name: {
      fr: 'Via Découvertes Films',
      en: 'Via Découvertes Films'
    },
    description: {
      fr: 'Société de production de documentaires',
      en: 'Documentary production company'
    },
    website: null
  }
];

async function main() {
  console.log('\n📋 CRÉATION DES LABELS MANQUANTS\n');

  let created = 0;
  let existing = 0;

  for (const labelData of LABELS_TO_CREATE) {
    try {
      // Vérifier si le label existe déjà
      const existingLabel = await prisma.label.findUnique({
        where: { slug: labelData.slug },
        include: { translations: true }
      });

      if (existingLabel) {
        console.log(`✓ Label "${labelData.slug}" existe déjà (ID: ${existingLabel.id})`);
        existing++;
        continue;
      }

      // Créer le label avec ses traductions
      const label = await prisma.label.create({
        data: {
          slug: labelData.slug,
          website: labelData.website,
          isActive: true,
          order: created,
          translations: {
            create: [
              {
                locale: 'fr',
                name: labelData.name.fr,
                description: labelData.description.fr
              },
              {
                locale: 'en',
                name: labelData.name.en,
                description: labelData.description.en
              }
            ]
          }
        },
        include: {
          translations: true
        }
      });

      console.log(`✅ Label "${labelData.slug}" créé avec succès`);
      console.log(`   ID: ${label.id}`);
      console.log(`   FR: ${labelData.name.fr}`);
      console.log(`   EN: ${labelData.name.en}\n`);

      created++;
    } catch (error) {
      console.error(`❌ Erreur lors de la création de "${labelData.slug}":`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 RÉSUMÉ:`);
  console.log(`   - ${created} labels créés`);
  console.log(`   - ${existing} labels déjà existants`);
  console.log(`   - ${created + existing}/${LABELS_TO_CREATE.length} total`);
  console.log('='.repeat(60) + '\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Erreur:', error);
  prisma.$disconnect();
  process.exit(1);
});
