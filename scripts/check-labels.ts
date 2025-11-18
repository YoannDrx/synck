import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLabels() {
  console.log('🏷️  LABELS DANS LA DB\n')
  console.log('='.repeat(70))

  const labels = await prisma.label.findMany({
    include: {
      translations: true
    },
    orderBy: { slug: 'asc' }
  })

  console.log(`\n📊 Total labels: ${labels.length}\n`)

  labels.forEach(label => {
    const names = label.translations.map(t => `${t.locale}: ${t.name}`).join(', ')
    console.log(`${label.slug} (${names})`)
  })

  console.log('\n' + '='.repeat(70))
}

checkLabels()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
