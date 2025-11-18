import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAntillesDjebel() {
  console.log('🆕 CRÉATION DU WORK "DES ANTILLES AU DJEBEL"\n')
  console.log('='.repeat(80))

  try {
    // Récupérer la catégorie documentaires
    const category = await prisma.category.findUnique({
      where: { slug: 'documentaires' }
    })

    if (!category) {
      console.log('❌ Catégorie "documentaires" non trouvée')
      return
    }

    console.log(`✅ Catégorie trouvée: ${category.id}`)

    // Récupérer le label 13-prods
    const label = await prisma.label.findUnique({
      where: { slug: '13-prods' }
    })

    if (label) {
      console.log(`✅ Label trouvé: ${label.slug}`)
    } else {
      console.log(`⚠️  Label "13-prods" non trouvé, création sans label`)
    }

    // Créer l'asset pour l'image
    const imagePath = '/images/projets/documentaires/13prods/des-antilles-au-djebel.jpg'
    let asset = await prisma.asset.findFirst({
      where: { path: imagePath }
    })

    if (!asset) {
      asset = await prisma.asset.create({
        data: { path: imagePath }
      })
      console.log(`✅ Asset créé: ${asset.id}`)
    } else {
      console.log(`ℹ️  Asset existe déjà: ${asset.id}`)
    }

    // Créer le work
    const work = await prisma.work.create({
      data: {
        slug: 'des-antilles-au-djebel-les-antillais-dans-la-guerre-dalgerie',
        categoryId: category.id,
        labelId: label?.id,
        coverImageId: asset.id,
        externalUrl: 'https://www.13prods.fr/des-antilles-au-djebel/',
        isActive: true,
        order: 0,
        translations: {
          create: [
            {
              locale: 'fr',
              title: 'Des Antilles au Djebel, les Antillais dans la guerre d\'Algérie',
              description: ''
            }
          ]
        }
      },
      include: {
        translations: true,
        coverImage: true
      }
    })

    console.log(`\n✅ Work créé avec succès!`)
    console.log(`   ID: ${work.id}`)
    console.log(`   Slug: ${work.slug}`)
    console.log(`   Titre: ${work.translations[0]?.title}`)
    console.log(`   Image: ${work.coverImage?.path}`)
    console.log(`   Lien: ${work.externalUrl}`)

  } catch (error) {
    console.log(`❌ Erreur: ${error}`)
  }

  console.log('\n' + '='.repeat(80))
}

createAntillesDjebel()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
