import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function fixMissingCoverImages() {
  console.log('🔧 CORRECTION DES COVER IMAGES MANQUANTES\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')

  // Récupérer tous les works avec leur cover image
  const works = await prisma.work.findMany({
    where: {
      coverImageId: { not: null }
    },
    include: {
      coverImage: true,
      images: true,
      translations: {
        where: { locale: 'fr' }
      }
    }
  })

  console.log(`\n📦 Total projets avec cover image: ${works.length}\n`)

  const worksWithMissingCover: Array<{
    id: string
    slug: string
    title: string
    missingCoverPath: string
    hasGalleryImages: boolean
    firstGalleryImageId?: string
  }> = []

  for (const work of works) {
    if (!work.coverImage) continue

    const fullPath = path.join(publicDir, work.coverImage.path)

    if (!fs.existsSync(fullPath)) {
      // La cover image n'existe pas
      // Vérifier si le work a des images de galerie qu'on pourrait utiliser
      const hasGalleryImages = work.images.length > 0
      const firstValidGalleryImage = work.images.find(img => {
        const imgPath = path.join(publicDir, img.path)
        return fs.existsSync(imgPath)
      })

      worksWithMissingCover.push({
        id: work.id,
        slug: work.slug,
        title: work.translations[0]?.title || work.slug,
        missingCoverPath: work.coverImage.path,
        hasGalleryImages,
        firstGalleryImageId: firstValidGalleryImage?.id
      })
    }
  }

  console.log('📊 RÉSULTATS:\n')
  console.log(`Projets avec cover manquante: ${worksWithMissingCover.length}`)

  const withGallery = worksWithMissingCover.filter(w => w.hasGalleryImages)
  const withoutGallery = worksWithMissingCover.filter(w => !w.hasGalleryImages)

  console.log(`  - Avec images de galerie (✅ peut utiliser 1ère image): ${withGallery.length}`)
  console.log(`  - Sans images de galerie (⚠️ mettre NULL): ${withoutGallery.length}`)

  if (worksWithMissingCover.length > 0) {
    console.log('\n📋 DÉTAILS:\n')

    worksWithMissingCover.slice(0, 10).forEach(work => {
      console.log(`  ${work.title} (${work.slug})`)
      console.log(`    Cover manquante: ${path.basename(work.missingCoverPath)}`)
      if (work.firstGalleryImageId) {
        console.log(`    → Peut utiliser 1ère image de galerie`)
      } else {
        console.log(`    → Aucune alternative disponible`)
      }
      console.log('')
    })

    if (worksWithMissingCover.length > 10) {
      console.log(`  ... et ${worksWithMissingCover.length - 10} autres projets\n`)
    }

    console.log('=' .repeat(70))
    console.log('\n💡 STRATÉGIES DE CORRECTION:\n')
    console.log('  1. Utiliser la 1ère image de galerie comme cover (si disponible)')
    console.log('     → npx tsx scripts/fix-missing-cover-images.ts --use-gallery')
    console.log('')
    console.log('  2. Mettre coverImageId à NULL pour tous')
    console.log('     → npx tsx scripts/fix-missing-cover-images.ts --set-null')
    console.log('')
    console.log('  3. Supprimer aussi les assets orphelins après correction')
    console.log('     → npx tsx scripts/fix-missing-cover-images.ts --use-gallery --cleanup')
    console.log('')
  }

  // Traitement selon les arguments
  const args = process.argv.slice(2)

  if (args.includes('--use-gallery') || args.includes('--set-null')) {
    console.log('\n🔧 CORRECTION EN COURS...\n')

    let fixed = 0
    let setToNull = 0

    for (const work of worksWithMissingCover) {
      try {
        if (args.includes('--use-gallery') && work.firstGalleryImageId) {
          // Utiliser la première image de galerie
          await prisma.work.update({
            where: { id: work.id },
            data: {
              coverImageId: work.firstGalleryImageId
            }
          })
          fixed++
          console.log(`  ✓ ${work.slug}: cover remplacée par 1ère image de galerie`)
        } else {
          // Mettre à NULL
          await prisma.work.update({
            where: { id: work.id },
            data: {
              coverImageId: null
            }
          })
          setToNull++
          console.log(`  ✓ ${work.slug}: coverImageId mis à NULL`)
        }
      } catch (error) {
        console.error(`  ❌ ${work.slug}: erreur`, error)
      }
    }

    console.log(`\n✅ Correction terminée:`)
    console.log(`  - Covers remplacées: ${fixed}`)
    console.log(`  - Covers mises à NULL: ${setToNull}`)

    if (args.includes('--cleanup')) {
      console.log('\n🗑️  SUPPRESSION DES ASSETS ORPHELINS...\n')

      // Récupérer tous les assets qui ne sont plus référencés
      const orphanAssets = await prisma.asset.findMany({
        where: {
          AND: [
            { workImages: { none: {} } },
            { workCover: { none: {} } },
            { categoryImages: { none: {} } },
            { labelImages: { none: {} } },
            { composerImages: { none: {} } },
            { blogPostImages: { none: {} } },
            { blogPostCover: { none: {} } },
            { expertiseImages: { none: {} } },
            { expertiseCover: { none: {} } }
          ]
        }
      })

      console.log(`Assets orphelins trouvés: ${orphanAssets.length}`)

      let deleted = 0
      for (const asset of orphanAssets) {
        try {
          await prisma.asset.delete({
            where: { id: asset.id }
          })
          deleted++
        } catch (error) {
          console.error(`❌ Erreur suppression ${asset.path}`)
        }
      }

      console.log(`✅ ${deleted} assets orphelins supprimés`)
    }
  }

  console.log('\n' + '='.repeat(70))
}

fixMissingCoverImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
