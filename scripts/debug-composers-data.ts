import { getComposersFromPrisma } from '@/lib/prismaProjetsUtils'

async function debugComposersData() {
  console.log('🔍 DEBUG : Données compositeurs retournées par getComposersFromPrisma\n')
  console.log('=' .repeat(70))

  const composers = await getComposersFromPrisma('fr')

  console.log(`\n👥 Total compositeurs retournés: ${composers.length}\n`)

  const withImage = composers.filter(c => c.image)
  const withoutImage = composers.filter(c => !c.image)

  console.log(`✅ Avec image: ${withImage.length}`)
  console.log(`❌ Sans image: ${withoutImage.length}\n`)

  console.log('📋 PREMIERS 10 COMPOSITEURS:\n')

  composers.slice(0, 10).forEach((composer, index) => {
    console.log(`${index + 1}. ${composer.name}`)
    console.log(`   slug: ${composer.slug}`)
    console.log(`   image: ${composer.image || 'undefined'}`)
    console.log(`   imageAlt: ${composer.imageAlt}`)
    console.log('')
  })

  if (withoutImage.length > 0) {
    console.log('❌ COMPOSITEURS SANS IMAGE:\n')
    withoutImage.forEach(c => {
      console.log(`  - ${c.name} (${c.slug})`)
    })
  }

  console.log('\n' + '='.repeat(70))
}

debugComposersData()
  .catch(console.error)
