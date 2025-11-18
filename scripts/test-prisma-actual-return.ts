import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testPrismaActualReturn() {
  console.log('🔍 TEST : Ce que Prisma retourne RÉELLEMENT\n')
  console.log('=' .repeat(70))

  // Faire EXACTEMENT la même query que getComposersFromPrisma
  const composers = await prisma.composer.findMany({
    where: {
      isActive: true,
    },
    include: {
      translations: {
        where: {
          locale: 'fr',
        },
      },
      image: true,
      contributions: {
        where: {
          work: {
            isActive: true,
          },
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  console.log(`\n📊 Compositeurs récupérés: ${composers.length}\n`)

  // Afficher les 10 premiers
  console.log('📋 PREMIERS 10 COMPOSITEURS:\n')

  composers.slice(0, 10).forEach(c => {
    const name = c.translations[0]?.name || c.slug
    const imagePath = c.image?.path || 'NULL'

    console.log(`${name}`)
    console.log(`  imageId: ${c.imageId}`)
    console.log(`  image.path: ${imagePath}`)

    // Montrer le path EN DÉTAIL caractère par caractère si nécessaire
    if (imagePath !== 'NULL') {
      const filename = imagePath.split('/').pop()
      console.log(`  filename: "${filename}"`)
      console.log(`  length: ${filename?.length}`)
    }
    console.log('')
  })

  // Maintenant, transformer EXACTEMENT comme le fait getComposersFromPrisma
  console.log('=' .repeat(70))
  console.log('🔄 TRANSFORMATION (comme getComposersFromPrisma):\n')

  const transformed = composers.slice(0, 5).map((composer) => {
    const translation = composer.translations[0]
    return {
      id: composer.id,
      slug: composer.slug,
      name: translation?.name || composer.slug,
      bio: translation?.bio || undefined,
      image: composer.image?.path || undefined,
      imageAlt: composer.image?.alt || translation?.name || composer.slug,
      externalUrl: composer.externalUrl || undefined,
      worksCount: composer.contributions.length,
    }
  })

  console.log('Résultat transformé:')
  transformed.forEach(c => {
    console.log(`\n${c.name}`)
    console.log(`  image: "${c.image}"`)
  })

  console.log('\n' + '='.repeat(70))
}

testPrismaActualReturn()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
