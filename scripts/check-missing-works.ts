import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const missingWorks = [
  { title: 'Blood, sex, royalty', category: 'synchros' },
  { title: 'The trip', category: 'vinyle' },
  { title: 'Egocentric visuo-spatial perspective', category: 'clips' }
]

async function checkMissingWorks() {
  console.log('🔍 VÉRIFICATION DES WORKS MANQUANTS\n')
  console.log('='.repeat(80))

  for (const item of missingWorks) {
    console.log(`\n📝 Recherche: "${item.title}" (catégorie: ${item.category})`)

    // Chercher par titre dans les translations
    const works = await prisma.work.findMany({
      where: {
        isActive: true,
        category: { slug: item.category },
        translations: {
          some: {
            OR: [
              { title: { contains: item.title, mode: 'insensitive' } },
              { title: { equals: item.title, mode: 'insensitive' } }
            ]
          }
        }
      },
      include: {
        coverImage: true,
        translations: { where: { locale: 'fr' } },
        category: true
      }
    })

    if (works.length === 0) {
      console.log('   ❌ Work non trouvé dans la DB')

      // Chercher par mots-clés
      const keywords = item.title.toLowerCase().split(' ').filter(w => w.length > 3)
      console.log(`   🔎 Recherche par mots-clés: ${keywords.join(', ')}`)

      const allWorksInCategory = await prisma.work.findMany({
        where: {
          isActive: true,
          category: { slug: item.category }
        },
        include: {
          coverImage: true,
          translations: { where: { locale: 'fr' } }
        }
      })

      const partialMatches = allWorksInCategory.filter(work => {
        const title = work.translations[0]?.title?.toLowerCase() || ''
        return keywords.some(kw => title.includes(kw))
      })

      if (partialMatches.length > 0) {
        console.log(`   💡 Correspondances partielles trouvées:`)
        partialMatches.forEach(work => {
          console.log(`      - "${work.translations[0]?.title}" (slug: ${work.slug})`)
          console.log(`        Image: ${work.coverImage?.path || 'N/A'}`)
        })
      }
    } else {
      works.forEach(work => {
        const title = work.translations[0]?.title || work.slug
        console.log(`   ✅ Work trouvé: "${title}"`)
        console.log(`      Slug: ${work.slug}`)
        console.log(`      Catégorie: ${work.category.slug}`)
        console.log(`      Image: ${work.coverImage?.path || '❌ PAS D\'IMAGE'}`)
      })
    }
  }

  console.log('\n' + '='.repeat(80))
}

checkMissingWorks()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
