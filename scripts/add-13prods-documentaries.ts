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
  console.log('🎬 Ajout des documentaires 13PRODS...\n')

  // 1. Trouver la catégorie "Documentaire"
  console.log('📁 Récupération de la catégorie Documentaire...')
  const category = await prisma.category.findUnique({
    where: { slug: 'documentaire' },
  })

  if (!category) {
    throw new Error('Catégorie Documentaire non trouvée. Veuillez d\'abord exécuter le script Ligne de Mire.')
  }
  console.log(`✅ Catégorie trouvée: ${category.slug}`)

  // 2. Créer ou trouver le label "13PRODS"
  console.log('\n🏢 Création du label 13PRODS...')
  const label = await prisma.label.upsert({
    where: { slug: '13prods' },
    update: {},
    create: {
      slug: '13prods',
      order: 1,
      isActive: true,
      translations: {
        create: [
          { locale: 'fr', name: '13PRODS' },
          { locale: 'en', name: '13PRODS' },
        ],
      },
    },
  })
  console.log(`✅ Label créé: ${label.slug}`)

  // 3. Définir les documentaires
  const documentaries = [
    {
      title: 'Ainsi Soit-Il',
      titleEn: 'So Be It',
      slug: 'ainsi-soit-il',
      imagePath: '/images/portfolio/documentaires/13prods/AINSI SOIT IL.jpg',
      year: 2019,
      descriptionFr: 'Un documentaire sur la foi et la spiritualité.',
      descriptionEn: 'A documentary about faith and spirituality.',
    },
    {
      title: 'Anny Duperey - Artiste',
      titleEn: 'Anny Duperey - Artist',
      slug: 'anny-duperey-artiste',
      imagePath: '/images/portfolio/documentaires/13prods/ANNY DUPEREY.jpg',
      year: 2020,
      descriptionFr: 'Portrait de l\'actrice et artiste Anny Duperey.',
      descriptionEn: 'Portrait of actress and artist Anny Duperey.',
    },
    {
      title: 'Bastelica - Fesch',
      titleEn: 'Bastelica - Fesch',
      slug: 'bastelica-fesch',
      imagePath: '/images/portfolio/documentaires/13prods/BASTELICA FESCH.jpg',
      year: 2021,
      descriptionFr: 'Un documentaire sur l\'histoire de Bastelica et le Cardinal Fesch.',
      descriptionEn: 'A documentary about the history of Bastelica and Cardinal Fesch.',
    },
    {
      title: 'Chanter Ensemble',
      titleEn: 'Singing Together',
      slug: 'chanter-ensemble',
      imagePath: '/images/portfolio/documentaires/13prods/CHANTER ENSEMBLE 13PRODS.jpg',
      year: 2020,
      descriptionFr: 'Un documentaire sur le chant choral et le lien social.',
      descriptionEn: 'A documentary about choral singing and social bonds.',
    },
    {
      title: 'Des Joujoux par Milliers',
      titleEn: 'Thousands of Toys',
      slug: 'des-joujoux-par-milliers',
      imagePath: '/images/portfolio/documentaires/13prods/DES JOUJOUX PAR MILLIERS.jpg',
      year: 2019,
      descriptionFr: 'Un documentaire sur l\'univers des jouets et de l\'enfance.',
      descriptionEn: 'A documentary about the world of toys and childhood.',
    },
    {
      title: 'Les Frères Vergès',
      titleEn: 'The Vergès Brothers',
      slug: 'les-freres-verges',
      imagePath: '/images/portfolio/documentaires/13prods/FRERES VERGES.jpg',
      year: 2020,
      descriptionFr: 'Portrait des frères Vergès, avocats emblématiques.',
      descriptionEn: 'Portrait of the Vergès brothers, iconic lawyers.',
    },
    {
      title: 'GAL - Au Nom de la Raison d\'État',
      titleEn: 'GAL - In the Name of Reason of State',
      slug: 'gal-au-nom-de-la-raison-detat',
      imagePath: '/images/portfolio/documentaires/13prods/GAL.jpg',
      year: 2018,
      descriptionFr: 'Enquête sur les Groupes Antiterroristes de Libération.',
      descriptionEn: 'Investigation into the Anti-Terrorist Liberation Groups.',
    },
    {
      title: 'Guyane - Vivre avec le Jaguar',
      titleEn: 'French Guiana - Living with the Jaguar',
      slug: 'guyane-vivre-avec-le-jaguar',
      imagePath: '/images/portfolio/documentaires/13prods/GUYANE VIVRE AVEC .jpg',
      year: 2021,
      descriptionFr: 'La cohabitation entre l\'homme et le jaguar en Guyane.',
      descriptionEn: 'The coexistence between humans and jaguars in French Guiana.',
    },
    {
      title: 'Jimmy Somerville - Smalltown Boy',
      titleEn: 'Jimmy Somerville - Smalltown Boy',
      slug: 'jimmy-somerville',
      imagePath: '/images/portfolio/documentaires/13prods/jimmy_somerville.jpg',
      year: 2020,
      descriptionFr: 'Portrait du chanteur emblématique Jimmy Somerville.',
      descriptionEn: 'Portrait of iconic singer Jimmy Somerville.',
    },
    {
      title: 'Joseph Kessel - L\'Armée des Ombres',
      titleEn: 'Joseph Kessel - Army of Shadows',
      slug: 'joseph-kessel',
      imagePath: '/images/portfolio/documentaires/13prods/JOSEPH KESSEL.jpeg',
      year: 2019,
      descriptionFr: 'Hommage à l\'écrivain et journaliste Joseph Kessel.',
      descriptionEn: 'Tribute to writer and journalist Joseph Kessel.',
    },
    {
      title: 'Khaled Kelkal - Itinéraire d\'un Terroriste',
      titleEn: 'Khaled Kelkal - Journey of a Terrorist',
      slug: 'khaled-kelkal',
      imagePath: '/images/portfolio/documentaires/13prods/KHALED KELKAL.png',
      year: 2017,
      descriptionFr: 'Enquête sur le parcours de Khaled Kelkal.',
      descriptionEn: 'Investigation into the journey of Khaled Kelkal.',
    },
    {
      title: 'La Pride des Champs',
      titleEn: 'The Fields Pride',
      slug: 'la-pride-des-champs',
      imagePath: '/images/portfolio/documentaires/13prods/LA PRIDE DES CHAMPS.jpg',
      year: 2022,
      descriptionFr: 'La Pride dans les campagnes françaises.',
      descriptionEn: 'Pride in the French countryside.',
    },
    {
      title: 'La Tragique Histoire de Fritz Haber',
      titleEn: 'The Tragic Story of Fritz Haber',
      slug: 'la-tragique-histoire-de-fritz-haber',
      imagePath: '/images/portfolio/documentaires/13prods/LA TRAGIQUE HISTOIRE.jpg',
      year: 2018,
      descriptionFr: 'L\'histoire du chimiste Fritz Haber, prix Nobel controversé.',
      descriptionEn: 'The story of chemist Fritz Haber, controversial Nobel Prize winner.',
    },
    {
      title: 'Les Antilles Empoisonnées',
      titleEn: 'The Poisoned Antilles',
      slug: 'les-antilles-empoisonnees',
      imagePath: '/images/portfolio/documentaires/13prods/LES ANTILLES EMPOISONNEES.jpg',
      year: 2019,
      descriptionFr: 'Enquête sur la pollution au chlordécone aux Antilles.',
      descriptionEn: 'Investigation into chlordecone pollution in the Antilles.',
    },
    {
      title: 'Les Doléances',
      titleEn: 'The Grievances',
      slug: 'les-doleances',
      imagePath: '/images/portfolio/documentaires/13prods/LESDOLEANCES.png',
      year: 2019,
      descriptionFr: 'Un documentaire sur les cahiers de doléances contemporains.',
      descriptionEn: 'A documentary about contemporary books of grievances.',
    },
    {
      title: 'Les Enfants de Huahine en Occitanie',
      titleEn: 'The Children of Huahine in Occitania',
      slug: 'les-enfants-de-huahine',
      imagePath: '/images/portfolio/documentaires/13prods/LES-ENFANTS-DE-HUAHINE.jpg',
      year: 2020,
      descriptionFr: 'Rencontre entre les cultures polynésienne et occitane.',
      descriptionEn: 'Encounter between Polynesian and Occitan cultures.',
    },
    {
      title: 'Les Enfants de Madame Massu',
      titleEn: 'Madame Massu\'s Children',
      slug: 'les-enfants-de-madame-massu',
      imagePath: '/images/portfolio/documentaires/13prods/LES ENFANTS DE MADAME MASSU.jpg',
      year: 2021,
      descriptionFr: 'L\'histoire des enfants de Madame Massu.',
      descriptionEn: 'The story of Madame Massu\'s children.',
    },
    {
      title: 'Les Loups Noirs d\'Alsace',
      titleEn: 'The Black Wolves of Alsace',
      slug: 'les-loups-noirs-dalsace',
      imagePath: '/images/portfolio/documentaires/13prods/LES-LOUPS-NOIRS-D_ALSACE.jpg',
      year: 2021,
      descriptionFr: 'Documentaire sur les soldats alsaciens pendant la guerre.',
      descriptionEn: 'Documentary about Alsatian soldiers during the war.',
    },
    {
      title: 'Les Raisins du Désespoir',
      titleEn: 'The Grapes of Despair',
      slug: 'les-raisins-du-desespoir',
      imagePath: '/images/portfolio/documentaires/13prods/LES RAISINS DU DESESPOIR.jpg',
      year: 2018,
      descriptionFr: 'La crise viticole française et ses conséquences.',
      descriptionEn: 'The French wine crisis and its consequences.',
    },
    {
      title: 'Les Yeux dans les Vieux',
      titleEn: 'Looking at the Elderly',
      slug: 'les-yeux-dans-les-vieux',
      imagePath: '/images/portfolio/documentaires/13prods/LES-YEUX-DANS-LES-VIEUX.jpeg',
      year: 2020,
      descriptionFr: 'Un regard tendre sur nos aînés.',
      descriptionEn: 'A tender look at our elders.',
    },
    {
      title: 'Martinique - Les Yeux Ouverts',
      titleEn: 'Martinique - Eyes Wide Open',
      slug: 'martinique-les-yeux-ouverts',
      imagePath: '/images/portfolio/documentaires/13prods/MARTINIQUE LES YEUX OUVERTS.jpeg',
      year: 2019,
      descriptionFr: 'Un regard neuf sur la Martinique contemporaine.',
      descriptionEn: 'A fresh look at contemporary Martinique.',
    },
    {
      title: 'Montmartre est une Fête',
      titleEn: 'Montmartre is a Celebration',
      slug: 'montmartre-est-une-fete',
      imagePath: '/images/portfolio/documentaires/13prods/MONTMARTRE EST UNE FETE.jpg',
      year: 2021,
      descriptionFr: 'Célébration du quartier mythique de Montmartre.',
      descriptionEn: 'Celebration of the legendary Montmartre district.',
    },
    {
      title: 'Mort d\'un Berger',
      titleEn: 'Death of a Shepherd',
      slug: 'mort-dun-berger',
      imagePath: '/images/portfolio/documentaires/13prods/mort_d_un_berger.jpg',
      year: 2020,
      descriptionFr: 'Enquête sur la mort mystérieuse d\'un berger.',
      descriptionEn: 'Investigation into the mysterious death of a shepherd.',
    },
    {
      title: 'Nous Soignants',
      titleEn: 'We the Caregivers',
      slug: 'nous-soignants',
      imagePath: '/images/portfolio/documentaires/13prods/NOUS SOIGNANTS2.png',
      year: 2020,
      descriptionFr: 'Hommage aux soignants pendant la crise sanitaire.',
      descriptionEn: 'Tribute to caregivers during the health crisis.',
    },
    {
      title: 'Terrorisme Arménien',
      titleEn: 'Armenian Terrorism',
      slug: 'terrorisme-armenien',
      imagePath: '/images/portfolio/documentaires/13prods/TERRORISME-ARMENIEN.jpg',
      year: 2018,
      descriptionFr: 'Enquête sur le terrorisme arménien en France.',
      descriptionEn: 'Investigation into Armenian terrorism in France.',
    },
    {
      title: 'YMCA - Une Flamme qui ne s\'Éteint Jamais',
      titleEn: 'YMCA - A Flame That Never Dies',
      slug: 'ymca-une-flamme',
      imagePath: '/images/portfolio/documentaires/13prods/YMCA.jpg',
      year: 2019,
      descriptionFr: 'L\'histoire du mouvement YMCA.',
      descriptionEn: 'The history of the YMCA movement.',
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

  console.log(`\n🎉 Tous les ${documentaries.length} documentaires 13PRODS ont été ajoutés avec succès!`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'ajout des documentaires:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
