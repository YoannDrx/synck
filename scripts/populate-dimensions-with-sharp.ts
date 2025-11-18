import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const prisma = new PrismaClient()

async function populateImageDimensions() {
  console.log('📐 CALCUL ET MISE À JOUR DES DIMENSIONS D\'IMAGES (avec Sharp)\n')
  console.log('=' .repeat(70))

  // Récupérer tous les assets sans dimensions
  const assets = await prisma.asset.findMany({
    where: {
      OR: [
        { width: null },
        { height: null }
      ]
    },
    select: {
      id: true,
      path: true
    }
  })

  console.log(`\n📦 Assets à traiter: ${assets.length}\n`)

  let updated = 0
  let failed = 0
  const errors: Array<{ path: string; error: string }> = []

  for (const asset of assets) {
    try {
      // Construire le chemin absolu
      const fullPath = path.join(process.cwd(), 'public', asset.path)

      if (!fs.existsSync(fullPath)) {
        errors.push({
          path: asset.path,
          error: 'Fichier inexistant'
        })
        failed++
        continue
      }

      // Lire les métadonnées de l'image avec Sharp
      const metadata = await sharp(fullPath).metadata()

      if (!metadata.width || !metadata.height) {
        errors.push({
          path: asset.path,
          error: 'Impossible de lire les dimensions'
        })
        failed++
        continue
      }

      // Calculer l'aspect ratio
      const aspectRatio = metadata.width / metadata.height

      // Mettre à jour dans la DB
      await prisma.asset.update({
        where: { id: asset.id },
        data: {
          width: metadata.width,
          height: metadata.height,
          aspectRatio: aspectRatio
        }
      })

      updated++

      // Afficher la progression tous les 50 assets
      if (updated % 50 === 0) {
        console.log(`  ✓ ${updated}/${assets.length} assets traités...`)
      }

    } catch (error) {
      errors.push({
        path: asset.path,
        error: error instanceof Error ? error.message : String(error)
      })
      failed++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 RÉSUMÉ:\n')
  console.log(`✅ Mis à jour: ${updated}`)
  console.log(`❌ Échecs: ${failed}`)

  if (errors.length > 0) {
    console.log('\n❌ ERREURS:\n')
    errors.slice(0, 10).forEach(err => {
      console.log(`  ${err.path}`)
      console.log(`    → ${err.error}\n`)
    })

    if (errors.length > 10) {
      console.log(`  ... et ${errors.length - 10} autres erreurs`)
    }
  }

  // Vérifier les compositeurs après mise à jour
  console.log('\n' + '='.repeat(70))
  console.log('👥 VÉRIFICATION DES COMPOSITEURS:\n')

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

  const withDimensions = composersWithImages.filter(
    c => c.image?.width && c.image?.height
  )
  const stillMissing = composersWithImages.filter(
    c => !c.image?.width || !c.image?.height
  )

  console.log(`Total compositeurs avec image: ${composersWithImages.length}`)
  console.log(`✅ Avec dimensions: ${withDimensions.length}`)
  console.log(`❌ Sans dimensions: ${stillMissing.length}`)

  if (withDimensions.length > 0) {
    console.log('\n✅ Exemples de compositeurs avec dimensions:')
    withDimensions.slice(0, 5).forEach(c => {
      console.log(`  - ${c.translations[0]?.name || c.slug}: ${c.image?.width}x${c.image?.height}`)
    })
  }

  if (stillMissing.length > 0) {
    console.log('\n❌ Compositeurs encore sans dimensions:')
    stillMissing.slice(0, 5).forEach(c => {
      console.log(`  - ${c.translations[0]?.name || c.slug}: ${c.image?.path}`)
    })
  }

  console.log('\n' + '='.repeat(70))
}

populateImageDimensions()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
