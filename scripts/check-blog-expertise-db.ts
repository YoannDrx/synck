import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBlogAndExpertise() {
  console.log('🔍 VÉRIFICATION DES DONNÉES BLOG & EXPERTISES\n')
  console.log('='.repeat(70))

  // Blog
  const blogCount = await prisma.blogPost.count()
  const expertiseCount = await prisma.expertise.count()

  console.log(`\n📝 Blog Posts dans la DB: ${blogCount}`)
  console.log(`📚 Expertises dans la DB: ${expertiseCount}`)

  if (blogCount > 0) {
    console.log('\n📋 Premiers 3 BlogPosts:')
    const posts = await prisma.blogPost.findMany({
      take: 3,
      include: {
        translations: true
      }
    })
    posts.forEach(p => {
      console.log(`  - ${p.slug} (${p.translations.map(t => t.locale).join(', ')})`)
    })
  }

  if (expertiseCount > 0) {
    console.log('\n📋 Expertises:')
    const expertises = await prisma.expertise.findMany({
      include: {
        translations: true
      }
    })
    expertises.forEach(e => {
      console.log(`  - ${e.slug} (${e.translations.map(t => t.locale).join(', ')})`)
    })
  }

  console.log('\n' + '='.repeat(70))
}

checkBlogAndExpertise()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
