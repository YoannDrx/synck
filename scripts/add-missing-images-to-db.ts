import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const missingImages = [
  {
    slug: 'numero-387-disparu-en-mediterranee',
    imagePath: '/images/projets/documentaires/little-big-story/387.jpg',
    title: 'Numero 387 disparu en méditerranée'
  },
  {
    slug: 'makaeta-la-terre-convoitee',
    imagePath: '/images/projets/documentaires/13prods/makatea.jpg',
    title: 'Makatea la terre convoitée'
  },
  {
    slug: 'le-3e-reich-n-aura-pas-la-bombe',
    imagePath: '/images/projets/documentaires/13prods/le-iiieme-reich-naurapaslabombe.jpg',
    title: 'Le troisième Reich n\'aura pas la bombe'
  },
  {
    slug: 'juppe-un-roman-bordelais',
    imagePath: '/images/projets/documentaires/13prods/juppe.jpg',
    title: 'Juppé un roman bordelais'
  },
  {
    slug: 'matrine-aubry-la-dame-de-lille',
    imagePath: '/images/projets/documentaires/13prods/martineaubry.jpg',
    title: 'Martine Aubry la dame de Lille'
  },
  {
    slug: 'concordat-et-laicite-l-exception',
    imagePath: '/images/projets/documentaires/13prods/laicite-et-concordat.jpg',
    title: 'Concordat et laïcité, l\'exception'
  },
  {
    slug: 'se-mettre-au-vert-une-utopie-en-perigord',
    imagePath: '/images/projets/documentaires/13prods/se-mettre-au-vert-expertise.jpg',
    title: 'Se mettre au vert, une utopie en Périgord'
  },
  {
    slug: 'entendez-nous-violences-intrafamiliales-en-polynesie',
    imagePath: '/images/projets/documentaires/13prods/entendez-nous-expertise.jpg',
    title: 'Entendez-nous, violences intrafamiliales en Polynésie'
  }
]

async function addMissingImagesToDB() {
  console.log('🖼️  AJOUT DES IMAGES MANQUANTES À LA DB\n')
  console.log('='.repeat(80))

  let added = 0
  let skipped = 0
  let errors = 0

  for (const item of missingImages) {
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
        console.log(`   ❌ Work non trouvé, ignoré`)
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
          data: {
            path: item.imagePath
          }
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

addMissingImagesToDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
