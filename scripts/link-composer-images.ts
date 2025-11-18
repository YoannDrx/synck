import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const prisma = new PrismaClient()

async function linkComposerImages() {
  console.log('🔗 LIAISON DES IMAGES COMPOSITEURS\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')
  const composerImagesDir = path.join(publicDir, 'images/projets/photosCompo')

  // Vérifier que le dossier existe
  if (!fs.existsSync(composerImagesDir)) {
    console.error(`❌ Dossier introuvable: ${composerImagesDir}`)
    return
  }

  // Lister toutes les images disponibles
  const availableImages = fs.readdirSync(composerImagesDir)
  console.log(`\n📁 Images disponibles dans photosCompo: ${availableImages.length}\n`)

  // Récupérer tous les compositeurs sans image
  const composersWithoutImage = await prisma.composer.findMany({
    where: {
      isActive: true,
      imageId: null
    },
    include: {
      translations: {
        where: { locale: 'fr' }
      }
    }
  })

  console.log(`👥 Compositeurs sans image: ${composersWithoutImage.length}\n`)

  let linked = 0
  let notFound = 0
  const matches: Array<{ composer: string; image: string }> = []
  const misses: string[] = []

  for (const composer of composersWithoutImage) {
    // Essayer de trouver une image correspondante
    // Stratégies de matching :
    // 1. Exact match avec le slug
    // 2. Match case-insensitive
    // 3. Match partiel (slug contenu dans filename ou vice-versa)

    const slug = composer.slug.toLowerCase()
    const slugNormalized = slug.replace(/[-_]/g, '')

    let matchingImage = availableImages.find(img => {
      const imgName = path.basename(img, path.extname(img)).toLowerCase()
      const imgNormalized = imgName.replace(/[-_]/g, '')

      // Exact match
      if (imgName === slug) return true

      // Normalized match (sans tirets/underscores)
      if (imgNormalized === slugNormalized) return true

      // Slug contenu dans le nom de l'image
      if (imgName.includes(slug) || slug.includes(imgName)) return true

      // Normalized contains
      if (imgNormalized.includes(slugNormalized) || slugNormalized.includes(imgNormalized)) {
        return true
      }

      return false
    })

    if (!matchingImage) {
      // Essayer avec le nom du compositeur
      const composerName = composer.translations[0]?.name
      if (composerName) {
        const nameNormalized = composerName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')

        matchingImage = availableImages.find(img => {
          const imgName = path.basename(img, path.extname(img)).toLowerCase()
          const imgNormalized = imgName.replace(/[^a-z0-9]/g, '')

          return imgNormalized === nameNormalized ||
                 imgNormalized.includes(nameNormalized) ||
                 nameNormalized.includes(imgNormalized)
        })
      }
    }

    if (matchingImage) {
      try {
        const imagePath = path.join(composerImagesDir, matchingImage)
        const relativeImagePath = `/images/projets/photosCompo/${matchingImage}`

        // Vérifier si l'Asset existe déjà
        let asset = await prisma.asset.findUnique({
          where: { path: relativeImagePath }
        })

        if (!asset) {
          // Lire les dimensions avec Sharp
          const metadata = await sharp(imagePath).metadata()

          if (!metadata.width || !metadata.height) {
            console.log(`  ⚠️  ${composer.slug}: impossible de lire les dimensions de ${matchingImage}`)
            continue
          }

          // Créer l'Asset
          asset = await prisma.asset.create({
            data: {
              path: relativeImagePath,
              alt: `Photo de ${composer.translations[0]?.name || composer.slug}`,
              width: metadata.width,
              height: metadata.height,
              aspectRatio: metadata.width / metadata.height
            }
          })
        }

        // Lier l'image au compositeur
        await prisma.composer.update({
          where: { id: composer.id },
          data: { imageId: asset.id }
        })

        matches.push({
          composer: composer.translations[0]?.name || composer.slug,
          image: matchingImage
        })

        linked++
        console.log(`  ✓ ${composer.slug} → ${matchingImage}`)

      } catch (error) {
        console.error(`  ❌ ${composer.slug}: erreur`, error)
      }
    } else {
      misses.push(composer.translations[0]?.name || composer.slug)
      notFound++
    }
  }

  console.log('\n' + '='.repeat(70))
  console.log('📊 RÉSUMÉ:\n')
  console.log(`✅ Images liées: ${linked}`)
  console.log(`❌ Images introuvables: ${notFound}`)

  if (misses.length > 0) {
    console.log('\n❌ COMPOSITEURS SANS IMAGE TROUVÉE:\n')
    misses.forEach(name => console.log(`  - ${name}`))
  }

  console.log('\n' + '='.repeat(70))
}

linkComposerImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
