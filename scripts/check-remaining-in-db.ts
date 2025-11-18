import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const remainingTitles = [
  "Numero 387 disparu en méditerranée",
  "Makatea la terre convoitée",
  "Mes parents ces héros ordinaires",
  "Le troisième Reich n'aura pas la bombe",
  "Juppé un roman bordelais",
  "Martine Aubry la dame de Lille",
  "Concordat et laïcité, l'exception",
  "Des Antilles au Djebel, les Antillais dans la guerre d'Algérie",
  "Se mettre au vert, une utopie en Périgord",
  "Entendez-nous, violences intrafamiliales en Polynésie"
]

async function checkRemainingInDB() {
  console.log('🔍 VÉRIFICATION DES 10 RESTANTS DANS LA DB\n')
  console.log('='.repeat(80))

  const works = await prisma.work.findMany({
    where: {
      isActive: true,
      category: { slug: 'documentaires' }
    },
    include: {
      coverImage: true,
      translations: { where: { locale: 'fr' } }
    }
  })

  console.log(`\n📊 Total documentaires dans la DB: ${works.length}\n`)
  console.log('='.repeat(80))

  for (const searchTitle of remainingTitles) {
    console.log(`\n🔎 Recherche: "${searchTitle}"`)

    // Recherche partielle dans les titres
    const matches = works.filter(work => {
      const dbTitle = work.translations[0]?.title || ''
      const searchLower = searchTitle.toLowerCase()
      const dbLower = dbTitle.toLowerCase()

      // Recherche de correspondances partielles
      const words = searchLower.split(' ').filter(w => w.length > 3)
      const matchingWords = words.filter(word => dbLower.includes(word))

      return matchingWords.length >= Math.min(3, words.length - 1)
    })

    if (matches.length === 0) {
      console.log('   ❌ Aucun match trouvé')
    } else {
      matches.forEach(work => {
        const title = work.translations[0]?.title || work.slug
        const imagePath = work.coverImage?.path || 'N/A'
        console.log(`   ✅ "${title}"`)
        console.log(`      Slug: ${work.slug}`)
        console.log(`      Image: ${imagePath}`)
      })
    }
  }

  console.log('\n' + '='.repeat(80))
}

checkRemainingInDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
