import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const worksToFix = [
  {
    slug: 'blood-sex-royalty',
    imagePath: '/images/projets/photosynchro/bloodsex-royalty.jpg',
    title: 'Blood, Sex & Royalty'
  },
  {
    slug: 'the-trip',
    imagePath: '/images/projets/vinyles/the-trip.jpg',
    title: 'The Trip'
  },
  {
    slug: 'egocentric-visuo-spatial-perspective-2',
    imagePath: '/images/projets/clips/egocentric-visuo-spatial-perspective.jpg',
    title: 'Egocentric Visuo-Spatial Perspective'
  }
]

async function addMissingWorksImages() {
  console.log('🖼️  AJOUT DES IMAGES MANQUANTES\n')
  console.log('='.repeat(80))

  let added = 0
  let skipped = 0
  let errors = 0

  for (const item of worksToFix) {
    console.log(`\n📝 Traitement: "${item.title}"`)
    console.log(`   Slug: ${item.slug}`)
    console.log(`   Image: ${item.imagePath}`)

    try {
      // Vérifier si le work existe
      const work = await prisma.work.findUnique({
        where: { slug: item.slug },
        include: { coverImage: true }
      })

      if (!work) {
        console.log(`   ❌ Work non trouvé`)
        errors++
        continue
      }

      if (work.coverImage) {
        console.log(`   ⏭️  Work a déjà une image: ${work.coverImage.path}`)
        skipped++
        continue
      }

      // Vérifier si l'asset existe déjà
      let asset = await prisma.asset.findFirst({
        where: { path: item.imagePath }
      })

      if (!asset) {
        // Créer l'asset
        asset = await prisma.asset.create({
          data: { path: item.imagePath }
        })
        console.log(`   ✅ Asset créé: ${asset.id}`)
      } else {
        console.log(`   ℹ️  Asset existe déjà: ${asset.id}`)
      }

      // Assigner l'asset au work comme coverImage
      await prisma.work.update({
        where: { id: work.id },
        data: { coverImageId: asset.id }
      })

      console.log(`   ✅ Image assignée au work`)
      added++

    } catch (error) {
      console.log(`   ❌ Erreur: ${error}`)
      errors++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`\n📊 Résultats:`)
  console.log(`   ✅ Images ajoutées: ${added}`)
  console.log(`   ⏭️  Ignorés (déjà présents): ${skipped}`)
  console.log(`   ❌ Erreurs: ${errors}`)
  console.log('\n' + '='.repeat(80))
}

addMissingWorksImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
