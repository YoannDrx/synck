import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMissingImageDimensions() {
  console.log('🔍 VÉRIFICATION DES DIMENSIONS D\'IMAGES MANQUANTES\n')
  console.log('=' .repeat(70))

  // Récupérer tous les assets sans dimensions
  const assetsWithoutDimensions = await prisma.asset.findMany({
    where: {
      OR: [
        { width: null },
        { height: null }
      ]
    },
    select: {
      id: true,
      path: true,
      alt: true,
      width: true,
      height: true,
      aspectRatio: true
    }
  })

  console.log(`\n📦 Total assets: ${await prisma.asset.count()}`)
  console.log(`❌ Assets sans dimensions: ${assetsWithoutDimensions.length}\n`)

  if (assetsWithoutDimensions.length > 0) {
    // Grouper par dossier
    const byFolder: Record<string, typeof assetsWithoutDimensions> = {}

    assetsWithoutDimensions.forEach(asset => {
      const folder = asset.path.split('/').slice(0, -1).join('/')
      if (!byFolder[folder]) byFolder[folder] = []
      byFolder[folder].push(asset)
    })

    console.log('📂 PAR DOSSIER:\n')
    Object.entries(byFolder).forEach(([folder, assets]) => {
      console.log(`${folder}: ${assets.length} assets`)
    })

    console.log('\n' + '='.repeat(70))
    console.log('📋 DÉTAILS DES PREMIERS ASSETS SANS DIMENSIONS:\n')

    assetsWithoutDimensions.slice(0, 10).forEach(asset => {
      console.log(`Path: ${asset.path}`)
      console.log(`  Width: ${asset.width || '❌ NULL'}`)
      console.log(`  Height: ${asset.height || '❌ NULL'}`)
      console.log(`  Aspect Ratio: ${asset.aspectRatio || '❌ NULL'}`)
      console.log(`  Alt: ${asset.alt || 'N/A'}`)
      console.log('')
    })
  } else {
    console.log('✅ Tous les assets ont des dimensions')
  }

  // Vérifier spécifiquement les images de compositeurs
  console.log('\n' + '='.repeat(70))
  console.log('👥 VÉRIFICATION DES IMAGES DE COMPOSITEURS:\n')

  const composersWithImages = await prisma.composer.findMany({
    where: {
      isActive: true,
      imageId: { not: null }
    },
    include: {
      image: true,
      translations: {
        where: { locale: 'fr' }
      }
    }
  })

  const composersWithoutDimensions = composersWithImages.filter(
    c => !c.image?.width || !c.image?.height
  )

  console.log(`Total compositeurs actifs avec image: ${composersWithImages.length}`)
  console.log(`❌ Compositeurs avec images sans dimensions: ${composersWithoutDimensions.length}\n`)

  if (composersWithoutDimensions.length > 0) {
    console.log('LISTE:')
    composersWithoutDimensions.forEach(composer => {
      console.log(`  - ${composer.translations[0]?.name || composer.slug}`)
      console.log(`    Path: ${composer.image?.path}`)
      console.log(`    Dimensions: ${composer.image?.width || 'NULL'} x ${composer.image?.height || 'NULL'}`)
      console.log('')
    })
  }

  console.log('\n' + '='.repeat(70))
}

checkMissingImageDimensions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
