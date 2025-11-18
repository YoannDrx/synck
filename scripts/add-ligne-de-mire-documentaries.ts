import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper: slugify text
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

async function main() {
  console.log('🎬 Ajout des documentaires Ligne de Mire...\n')

  // 1. Créer ou trouver la catégorie "Documentaire"
  console.log('📁 Création de la catégorie Documentaire...')
  const category = await prisma.category.upsert({
    where: { slug: 'documentaire' },
    update: {},
    create: {
      slug: 'documentaire',
      order: 10,
      isActive: true,
      translations: {
        create: [
          { locale: 'fr', name: 'Documentaire' },
          { locale: 'en', name: 'Documentary' },
        ],
      },
    },
  })
  console.log(`✅ Catégorie créée: ${category.slug}`)

  // 2. Créer ou trouver le label "Ligne de Mire"
  console.log('\n🏢 Création du label Ligne de Mire...')
  const label = await prisma.label.upsert({
    where: { slug: 'ligne-de-mire' },
    update: {},
    create: {
      slug: 'ligne-de-mire',
      order: 0,
      isActive: true,
      translations: {
        create: [
          { locale: 'fr', name: 'Ligne de Mire' },
          { locale: 'en', name: 'Ligne de Mire' },
        ],
      },
    },
  })
  console.log(`✅ Label créé: ${label.slug}`)

  // 3. Définir les documentaires
  const documentaries = [
    {
      title: 'Inde - Les Paysans',
      titleEn: 'India - The Farmers',
      slug: 'inde-les-paysans',
      imagePath: '/images/portfolio/documentaires/ligne-de-mire/INDE-LES-PAYSANS.jpg',
      year: 2020,
      descriptionFr: 'Un documentaire sur les paysans indiens et leurs défis quotidiens.',
      descriptionEn: 'A documentary about Indian farmers and their daily challenges.',
    },
    {
      title: 'Portrait d\'un Père',
      titleEn: 'Portrait of a Father',
      slug: 'portrait-dun-pere',
      imagePath: '/images/portfolio/documentaires/ligne-de-mire/PORTRAIT.webp',
      year: 2021,
      descriptionFr: 'Un portrait intime et touchant d\'un père.',
      descriptionEn: 'An intimate and touching portrait of a father.',
    },
    {
      title: 'Sœurs de la Terre',
      titleEn: 'Sisters of the Earth',
      slug: 'soeurs-de-la-terre',
      imagePath: '/images/portfolio/documentaires/ligne-de-mire/SOEURS.jpeg',
      year: 2021,
      descriptionFr: 'Un documentaire sur les femmes et leur lien avec la terre.',
      descriptionEn: 'A documentary about women and their connection to the earth.',
    },
    {
      title: 'Un Pasteur',
      titleEn: 'A Pastor',
      slug: 'un-pasteur',
      imagePath: '/images/portfolio/documentaires/ligne-de-mire/UnPasteur.png',
      year: 2022,
      descriptionFr: 'Le portrait d\'un pasteur et son engagement spirituel.',
      descriptionEn: 'The portrait of a pastor and his spiritual commitment.',
    },
    {
      title: 'Vikings - La Saga des Femmes',
      titleEn: 'Vikings - The Women\'s Saga',
      slug: 'vikings-la-saga-des-femmes',
      imagePath: '/images/portfolio/documentaires/ligne-de-mire/VIKINGS-LA-SAGA-DES-FEMMES.jpg',
      year: 2023,
      descriptionFr: 'Découvrez le rôle méconnu des femmes vikings dans l\'histoire.',
      descriptionEn: 'Discover the unknown role of Viking women in history.',
    },
  ]

  // 4. Créer les documentaires
  console.log('\n🎬 Création des documentaires...\n')

  for (const doc of documentaries) {
    // Créer l'asset pour l'image de couverture
    const coverAsset = await prisma.asset.upsert({
      where: { path: doc.imagePath },
      update: {},
      create: {
        path: doc.imagePath,
        alt: doc.title,
      },
    })

    // Créer le documentaire
    const work = await prisma.work.upsert({
      where: { slug: doc.slug },
      update: {},
      create: {
        slug: doc.slug,
        categoryId: category.id,
        labelId: label.id,
        coverImageId: coverAsset.id,
        year: doc.year,
        isActive: true,
        isFeatured: false,
        order: 0,
        translations: {
          create: [
            {
              locale: 'fr',
              title: doc.title,
              description: doc.descriptionFr,
              role: 'Gestionnaire des droits',
            },
            {
              locale: 'en',
              title: doc.titleEn,
              description: doc.descriptionEn,
              role: 'Rights Manager',
            },
          ],
        },
      },
    })

    console.log(`✅ Documentaire créé: ${doc.title} (${doc.year})`)
  }

  console.log('\n🎉 Tous les documentaires Ligne de Mire ont été ajoutés avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'ajout des documentaires:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
