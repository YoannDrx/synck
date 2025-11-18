/**
 * Script de validation de la migration des données legacy
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Validation de la migration des données...\n')

  // Works
  const totalWorks = await prisma.work.count()
  const worksWithExternalUrl = await prisma.work.count({
    where: { externalUrl: { not: null } },
  })
  const worksWithSpotifyUrl = await prisma.work.count({
    where: { spotifyUrl: { not: null } },
  })

  console.log('📦 WORKS:')
  console.log(`  Total: ${totalWorks}`)
  console.log(`  Avec externalUrl: ${worksWithExternalUrl} (${Math.round((worksWithExternalUrl / totalWorks) * 100)}%)`)
  console.log(`  Avec spotifyUrl: ${worksWithSpotifyUrl} (${Math.round((worksWithSpotifyUrl / totalWorks) * 100)}%)`)

  // Work Translations (Descriptions)
  const totalTranslations = await prisma.workTranslation.count()
  const translationsWithDescription = await prisma.workTranslation.count({
    where: {
      AND: [
        { description: { not: null } },
        { description: { not: '' } },
      ],
    },
  })

  console.log('\n📝 WORK TRANSLATIONS:')
  console.log(`  Total: ${totalTranslations}`)
  console.log(`  Avec description: ${translationsWithDescription} (${Math.round((translationsWithDescription / totalTranslations) * 100)}%)`)

  // Composers
  const totalComposers = await prisma.composer.count()
  const composersWithLinks = await prisma.composer.count({
    where: {
      links: {
        some: {},
      },
    },
  })

  console.log('\n🎵 COMPOSERS:')
  console.log(`  Total: ${totalComposers}`)
  console.log(`  Avec liens sociaux: ${composersWithLinks} (${Math.round((composersWithLinks / totalComposers) * 100)}%)`)

  // Composer Links
  const totalLinks = await prisma.composerLink.count()
  const linksByPlatform = await prisma.composerLink.groupBy({
    by: ['platform'],
    _count: true,
  })

  console.log('\n🔗 COMPOSER LINKS:')
  console.log(`  Total: ${totalLinks}`)
  console.log('  Par plateforme:')
  linksByPlatform
    .sort((a, b) => b._count - a._count)
    .forEach((item) => {
      console.log(`    ${item.platform}: ${item._count}`)
    })

  // Categories
  const totalCategories = await prisma.category.count()
  console.log(`\n🏷️  CATEGORIES: ${totalCategories}`)

  // Example work with all data
  const exampleWork = await prisma.work.findFirst({
    where: {
      externalUrl: { not: null },
    },
    include: {
      translations: true,
      contributions: {
        include: {
          composer: {
            include: {
              links: true,
              translations: true,
            },
          },
        },
      },
    },
  })

  if (exampleWork) {
    console.log('\n✨ EXEMPLE DE WORK COMPLET:')
    console.log(`  Slug: ${exampleWork.slug}`)
    console.log(`  Titre (FR): ${exampleWork.translations.find(t => t.locale === 'fr')?.title}`)
    console.log(`  External URL: ${exampleWork.externalUrl}`)
    console.log(`  Spotify URL: ${exampleWork.spotifyUrl || 'N/A'}`)
    console.log(`  Description (FR): ${exampleWork.translations.find(t => t.locale === 'fr')?.description?.substring(0, 100)}...`)
    console.log(`  Compositeurs (${exampleWork.contributions.length}):`)
    exampleWork.contributions.forEach((contrib) => {
      const name = contrib.composer.translations.find(t => t.locale === 'fr')?.name
      const linksCount = contrib.composer.links.length
      console.log(`    - ${name} (${linksCount} liens sociaux)`)
      contrib.composer.links.forEach((link) => {
        console.log(`      → ${link.platform}: ${link.url}`)
      })
    })
  }

  console.log('\n✅ Validation terminée!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
