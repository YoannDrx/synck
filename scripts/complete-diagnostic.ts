import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function completeDiagnostic() {
  console.log('🔍 DIAGNOSTIC COMPLET - ENVIRONNEMENT LOCAL\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')
  const composerImagesDir = path.join(publicDir, 'images/projets/photosCompo')

  // 1. Vérifier les fichiers locaux
  console.log('\n📁 ÉTAPE 1 : FICHIERS LOCAUX\n')

  if (fs.existsSync(composerImagesDir)) {
    const files = fs.readdirSync(composerImagesDir)
    console.log(`✅ Dossier existe: ${composerImagesDir}`)
    console.log(`✅ Nombre de fichiers: ${files.length}`)
    console.log(`\nPremiers fichiers:`)
    files.slice(0, 10).forEach(f => console.log(`  - ${f}`))
  } else {
    console.log(`❌ Dossier introuvable: ${composerImagesDir}`)
    return
  }

  // 2. Vérifier la base de données
  console.log('\n\n📊 ÉTAPE 2 : BASE DE DONNÉES\n')

  const composers = await prisma.composer.findMany({
    where: { isActive: true },
    include: {
      image: true,
      translations: {
        where: { locale: 'fr' }
      }
    },
    take: 10
  })

  console.log(`Total compositeurs actifs dans la DB: ${composers.length}`)

  const withImageId = composers.filter(c => c.imageId !== null)
  const withoutImageId = composers.filter(c => c.imageId === null)

  console.log(`\n✅ Avec imageId: ${withImageId.length}`)
  console.log(`❌ Sans imageId: ${withoutImageId.length}`)

  if (withImageId.length > 0) {
    console.log('\n📋 COMPOSITEURS AVEC IMAGE (premiers 5):')
    withImageId.slice(0, 5).forEach(c => {
      console.log(`\n  ${c.translations[0]?.name || c.slug}`)
      console.log(`    imageId: ${c.imageId}`)
      console.log(`    image.path: ${c.image?.path || 'NULL'}`)

      if (c.image?.path) {
        const fullPath = path.join(publicDir, c.image.path)
        const exists = fs.existsSync(fullPath)
        console.log(`    Fichier existe: ${exists ? '✅' : '❌'}`)
        if (!exists) {
          console.log(`    Chemin complet: ${fullPath}`)
        }
      }
    })
  }

  if (withoutImageId.length > 0) {
    console.log(`\n❌ COMPOSITEURS SANS IMAGE (${withoutImageId.length}):`)
    withoutImageId.forEach(c => {
      console.log(`  - ${c.translations[0]?.name || c.slug} (slug: ${c.slug})`)
    })
  }

  // 3. Vérifier ce que retourne getComposersFromPrisma
  console.log('\n\n🔍 ÉTAPE 3 : DONNÉES RETOURNÉES PAR getComposersFromPrisma\n')

  const { getComposersFromPrisma } = await import('@/lib/prismaProjetsUtils')
  const composersData = await getComposersFromPrisma('fr')

  console.log(`Total retourné: ${composersData.length}`)

  const withImage = composersData.filter(c => c.image)
  const withoutImage = composersData.filter(c => !c.image)

  console.log(`\n✅ Avec image: ${withImage.length}`)
  console.log(`❌ Sans image: ${withoutImage.length}`)

  if (withImage.length > 0) {
    console.log('\nPremiers compositeurs avec image:')
    withImage.slice(0, 5).forEach(c => {
      console.log(`  - ${c.name}: ${c.image}`)
    })
  }

  if (withoutImage.length > 0) {
    console.log(`\n❌ Compositeurs retournés SANS image (${withoutImage.length}):`)
    withoutImage.forEach(c => {
      console.log(`  - ${c.name} (slug: ${c.slug})`)
    })
  }

  // 4. Vérifier les Assets dans la DB
  console.log('\n\n💾 ÉTAPE 4 : ASSETS DANS LA BASE DE DONNÉES\n')

  const assetsCount = await prisma.asset.count({
    where: {
      path: {
        contains: '/images/projets/photosCompo/'
      }
    }
  })

  console.log(`Assets photosCompo dans la DB: ${assetsCount}`)

  if (assetsCount > 0) {
    const sampleAssets = await prisma.asset.findMany({
      where: {
        path: {
          contains: '/images/projets/photosCompo/'
        }
      },
      take: 5
    })

    console.log('\nExemples d\'Assets:')
    sampleAssets.forEach(a => {
      console.log(`  - ${a.path} (${a.width}x${a.height})`)
    })
  }

  console.log('\n' + '='.repeat(70))
  console.log('\n✅ DIAGNOSTIC TERMINÉ')
}

completeDiagnostic()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
