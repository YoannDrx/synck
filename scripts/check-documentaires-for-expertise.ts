import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDocumentaires() {
  console.log('🔍 VÉRIFICATION DES DOCUMENTAIRES POUR EXPERTISE\n')
  console.log('='.repeat(70))

  // Récupérer la catégorie documentaire
  const docCategory = await prisma.category.findUnique({
    where: { slug: 'documentaires' },
    include: {
      translations: true
    }
  })

  if (!docCategory) {
    console.log('❌ Catégorie "documentaire" introuvable!')
    console.log('\n📋 Catégories disponibles:')
    const categories = await prisma.category.findMany({
      include: { translations: true }
    })
    categories.forEach(c => {
      console.log(`  - ${c.slug} (${c.translations.map(t => t.name).join(', ')})`)
    })
    await prisma.$disconnect()
    return
  }

  console.log(`✅ Catégorie documentaire trouvée: ${docCategory.slug}`)
  console.log(`   ID: ${docCategory.id}`)

  // Récupérer les documentaires
  const documentaires = await prisma.work.findMany({
    where: {
      isActive: true,
      category: {
        slug: 'documentaires'
      }
    },
    include: {
      label: {
        include: {
          translations: {
            where: { locale: 'fr' }
          }
        }
      },
      coverImage: true,
      translations: {
        where: { locale: 'fr' }
      }
    },
    orderBy: {
      order: 'asc'
    }
  })

  console.log(`\n📊 Nombre de documentaires actifs: ${documentaires.length}`)

  if (documentaires.length === 0) {
    console.log('❌ Aucun documentaire trouvé!')
    await prisma.$disconnect()
    return
  }

  // Grouper par label
  const byLabel = documentaires.reduce((acc, doc) => {
    const labelName = doc.label?.translations[0]?.name || doc.label?.slug || 'sans-label'
    if (!acc[labelName]) acc[labelName] = []
    acc[labelName].push(doc)
    return acc
  }, {} as Record<string, typeof documentaires>)

  console.log('\n📋 DOCUMENTAIRES PAR LABEL:\n')
  Object.entries(byLabel).forEach(([label, docs]) => {
    console.log(`${label}: ${docs.length} documentaires`)
    docs.slice(0, 3).forEach(d => {
      const title = d.translations[0]?.title || d.slug
      const hasCover = d.coverImage ? '✅' : '❌'
      const hasUrl = d.externalUrl ? '🔗' : '❌'
      console.log(`  ${hasCover} ${hasUrl} ${title}`)
    })
    if (docs.length > 3) console.log(`  ... et ${docs.length - 3} autres`)
    console.log()
  })

  console.log('='.repeat(70))
}

checkDocumentaires()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
