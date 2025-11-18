import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkActualDBPaths() {
  console.log('🔍 VÉRIFICATION DES PATHS RÉELS DANS LA DB\n')
  console.log('=' .repeat(70))

  // Récupérer les premiers compositeurs avec leurs images
  const composers = await prisma.composer.findMany({
    where: {
      isActive: true,
      imageId: { not: null }
    },
    include: {
      image: true,
      translations: {
        where: { locale: 'fr' }
      }
    },
    take: 10
  })

  console.log(`\n📋 PREMIERS 10 COMPOSITEURS AVEC IMAGE:\n`)

  composers.forEach(c => {
    console.log(`${c.translations[0]?.name || c.slug}`)
    console.log(`  imageId: ${c.imageId}`)
    console.log(`  image.path: ${c.image?.path}`)
    console.log('')
  })

  console.log('=' .repeat(70))
}

checkActualDBPaths()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
