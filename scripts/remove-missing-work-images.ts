import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function removeMissingWorkImages() {
  console.log('🧹 SUPPRESSION DES IMAGES MANQUANTES DES PROJETS\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')

  // Récupérer tous les works avec leurs images
  const works = await prisma.work.findMany({
    include: {
      images: true,
      coverImage: true,
      translations: {
        where: { locale: 'fr' }
      }
    }
  })

  console.log(`\n📦 Total projets à vérifier: ${works.length}\n`)

  const worksWithMissingImages: Array<{
    workId: string
    workSlug: string
    workTitle: string
    missingImageIds: string[]
    missingImagePaths: string[]
  }> = []

  let totalMissingImages = 0

  for (const work of works) {
    const missingImageIds: string[] = []
    const missingImagePaths: string[] = []

    // Vérifier les images de galerie
    for (const image of work.images) {
      const fullPath = path.join(publicDir, image.path)
      if (!fs.existsSync(fullPath)) {
        missingImageIds.push(image.id)
        missingImagePaths.push(image.path)
        totalMissingImages++
      }
    }

    if (missingImageIds.length > 0) {
      worksWithMissingImages.push({
        workId: work.id,
        workSlug: work.slug,
        workTitle: work.translations[0]?.title || work.slug,
        missingImageIds,
        missingImagePaths
      })
    }
  }

  console.log('📊 RÉSULTATS:\n')
  console.log(`Projets avec images manquantes: ${worksWithMissingImages.length}`)
  console.log(`Total images manquantes: ${totalMissingImages}`)

  if (worksWithMissingImages.length > 0) {
    console.log('\n📋 DÉTAILS PAR PROJET:\n')

    worksWithMissingImages.slice(0, 10).forEach(work => {
      console.log(`  ${work.workTitle} (${work.workSlug})`)
      console.log(`    Images manquantes: ${work.missingImageIds.length}`)
      work.missingImagePaths.slice(0, 3).forEach(p => {
        console.log(`      - ${path.basename(p)}`)
      })
      if (work.missingImagePaths.length > 3) {
        console.log(`      ... et ${work.missingImagePaths.length - 3} autres`)
      }
      console.log('')
    })

    if (worksWithMissingImages.length > 10) {
      console.log(`  ... et ${worksWithMissingImages.length - 10} autres projets\n`)
    }

    console.log('=' .repeat(70))
    console.log('\n❓ Actions possibles:\n')
    console.log('  1. Supprimer UNIQUEMENT les relations (garder les assets pour référence)')
    console.log('     → npx tsx scripts/remove-missing-work-images.ts --remove-relations')
    console.log('')
    console.log('  2. Supprimer les relations ET les assets orphelins')
    console.log('     → npx tsx scripts/remove-missing-work-images.ts --full-cleanup')
    console.log('')
  }

  // Traitement selon les arguments
  const args = process.argv.slice(2)

  if (args.includes('--remove-relations') || args.includes('--full-cleanup')) {
    console.log('\n🔧 SUPPRESSION DES RELATIONS...\n')

    let relationsRemoved = 0

    for (const work of worksWithMissingImages) {
      try {
        // Récupérer les IDs actuels des images du work
        const currentWork = await prisma.work.findUnique({
          where: { id: work.workId },
          select: {
            images: { select: { id: true } }
          }
        })

        if (!currentWork) continue

        // Filtrer pour garder seulement les images qui existent
        const validImageIds = currentWork.images
          .map(img => img.id)
          .filter(id => !work.missingImageIds.includes(id))

        // Mettre à jour la relation
        await prisma.work.update({
          where: { id: work.workId },
          data: {
            images: {
              set: validImageIds.map(id => ({ id }))
            }
          }
        })

        relationsRemoved += work.missingImageIds.length

        if (relationsRemoved % 20 === 0) {
          console.log(`  ✓ ${relationsRemoved} relations supprimées...`)
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${work.workSlug}:`, error)
      }
    }

    console.log(`\n✅ ${relationsRemoved} relations d'images supprimées`)

    if (args.includes('--full-cleanup')) {
      console.log('\n🗑️  SUPPRESSION DES ASSETS ORPHELINS...\n')

      let assetsDeleted = 0

      // Collecter tous les IDs d'images manquantes
      const allMissingImageIds = worksWithMissingImages.flatMap(w => w.missingImageIds)

      for (const imageId of allMissingImageIds) {
        try {
          await prisma.asset.delete({
            where: { id: imageId }
          })
          assetsDeleted++

          if (assetsDeleted % 50 === 0) {
            console.log(`  ✓ ${assetsDeleted}/${allMissingImageIds.length} assets supprimés...`)
          }
        } catch (error) {
          // L'asset pourrait être référencé ailleurs, on ignore
        }
      }

      console.log(`\n✅ ${assetsDeleted} assets orphelins supprimés`)
    }
  }

  console.log('\n' + '='.repeat(70))
}

removeMissingWorkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
