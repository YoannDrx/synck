import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClipsYoutube() {
  console.log('🎬 VÉRIFICATION DES CLIPS ET YOUTUBE\n')
  console.log('='.repeat(80))

  const clips = await prisma.work.findMany({
    where: {
      isActive: true,
      category: { slug: 'clips' }
    },
    include: {
      translations: { where: { locale: 'fr' } },
      coverImage: true
    },
    orderBy: { order: 'asc' },
    take: 10 // Prendre les 10 premiers pour voir
  })

  console.log(`\n📊 Total clips actifs: ${clips.length}\n`)

  clips.forEach((clip, index) => {
    console.log(`${index + 1}. "${clip.translations[0]?.title || clip.slug}"`)
    console.log(`   Slug: ${clip.slug}`)
    console.log(`   External URL: ${clip.externalUrl || 'N/A'}`)
    console.log(`   Spotify URL: ${clip.spotifyUrl || 'N/A'}`)
    console.log(`   Cover Image: ${clip.coverImage?.path || 'N/A'}`)
    console.log()
  })

  console.log('='.repeat(80))
}

checkClipsYoutube()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
