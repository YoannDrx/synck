import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const prisma = new PrismaClient()

async function findMatchingImage(workSlug: string, workTitle: string, availableImages: string[]): string | null {
  const slug = workSlug.toLowerCase()
  const slugNormalized = slug.replace(/[-_\s]/g, '')
  const titleNormalized = workTitle.toLowerCase().replace(/[^a-z0-9]/g, '')

  // Stratégies de matching par priorité
  for (const img of availableImages) {
    const imgName = path.basename(img, path.extname(img)).toLowerCase()
    const imgNormalized = imgName.replace(/[-_\s]/g, '')

    // 1. Exact match avec le slug
    if (imgName === slug) return img

    // 2. Normalized match
    if (imgNormalized === slugNormalized) return img

    // 3. Match avec le titre
    if (imgNormalized === titleNormalized) return img

    // 4. Slug contenu dans l'image
    if (imgName.includes(slug)) return img

    // 5. Image contenue dans le slug
    if (slug.includes(imgName) && imgName.length > 5) return img

    // 6. Normalized contains (au moins 80% de match)
    if (imgNormalized.includes(slugNormalized) && slugNormalized.length > 5) return img
    if (slugNormalized.includes(imgNormalized) && imgNormalized.length > 5) return img
  }

  return null
}

async function linkDocumentaryCoverImages() {
  console.log('🔗 LIAISON DES IMAGES DOCUMENTAIRES\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')
  const documentairesDir = path.join(publicDir, 'images/projets/documentaires')

  // Vérifier que le dossier existe
  if (!fs.existsSync(documentairesDir)) {
    console.error(`❌ Dossier introuvable: ${documentairesDir}`)
    return
  }

  // Lister toutes les images disponibles (récursivement)
  const availableImages: string[] = []

  function scanDirectory(dir: string, baseDir: string = dir) {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        scanDirectory(fullPath, baseDir)
      } else if (stat.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(item)) {
        // Conserver le chemin relatif au dossier documentaires
        const relativePath = path.relative(baseDir, fullPath)
        availableImages.push(relativePath)
      }
    }
  }

  scanDirectory(documentairesDir)

  console.log(`\n📁 Images disponibles dans documentaires: ${availableImages.length}\n`)

  // Récupérer tous les projets documentaires sans cover
  const categoryDoc = await prisma.category.findFirst({
    where: {
      slug: 'documentaires'
    }
  })

  if (!categoryDoc) {
    console.error('❌ Catégorie "documentaires" introuvable')
    return
  }

  const worksWithoutCover = await prisma.work.findMany({
    where: {
      categoryId: categoryDoc.id,
      isActive: true,
      coverImageId: null
    },
    include: {
      translations: {
        where: { locale: 'fr' }
      }
    }
  })

  console.log(`🎬 Documentaires sans cover: ${worksWithoutCover.length}\n`)

  let linked = 0
  let notFound = 0
  const matches: Array<{ work: string; image: string }> = []
  const misses: string[] = []

  for (const work of worksWithoutCover) {
    const workTitle = work.translations[0]?.title || work.slug

    const matchingImage = await findMatchingImage(work.slug, workTitle, availableImages)

    if (matchingImage) {
      try {
        const imagePath = path.join(documentairesDir, matchingImage)
        const relativeImagePath = `/images/projets/documentaires/${matchingImage.replace(/\\/g, '/')}`

        // Vérifier si l'Asset existe déjà
        let asset = await prisma.asset.findUnique({
          where: { path: relativeImagePath }
        })

        if (!asset) {
          // Lire les dimensions avec Sharp
          const metadata = await sharp(imagePath).metadata()

          if (!metadata.width || !metadata.height) {
            console.log(`  ⚠️  ${work.slug}: impossible de lire les dimensions de ${matchingImage}`)
            continue
          }

          // Créer l'Asset
          asset = await prisma.asset.create({
            data: {
              path: relativeImagePath,
              alt: workTitle,
              width: metadata.width,
              height: metadata.height,
              aspectRatio: metadata.width / metadata.height
            }
          })
        }

        // Lier l'image au work
        await prisma.work.update({
          where: { id: work.id },
          data: { coverImageId: asset.id }
        })

        matches.push({
          work: workTitle,
          image: matchingImage
        })

        linked++
        console.log(`  ✓ ${work.slug} → ${matchingImage}`)

      } catch (error) {
        console.error(`  ❌ ${work.slug}: erreur`, error)
      }
    } else {
      misses.push(workTitle)
      notFound++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 RÉSUMÉ:\n')
  console.log(`✅ Images liées: ${linked}`)
  console.log(`❌ Images introuvables: ${notFound}`)

  if (misses.length > 0) {
    console.log('\n❌ DOCUMENTAIRES SANS IMAGE TROUVÉE:\n')
    misses.slice(0, 20).forEach(title => console.log(`  - ${title}`))
    if (misses.length > 20) {
      console.log(`  ... et ${misses.length - 20} autres`)
    }
  }

  console.log('\n' + '='.repeat(70))
}

linkDocumentaryCoverImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
