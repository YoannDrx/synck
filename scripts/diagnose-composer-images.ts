import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function diagnoseComposerImages() {
  console.log('🔍 DIAGNOSTIC DES IMAGES COMPOSITEURS\n')
  console.log('=' .repeat(70))

  const publicDir = path.join(process.cwd(), 'public')

  // Récupérer tous les compositeurs actifs avec leur image
  const composers = await prisma.composer.findMany({
    where: {
      isActive: true
    },
    include: {
      image: true,
      translations: {
        where: { locale: 'fr' }
      }
    }
  })

  console.log(`\n👥 Total compositeurs actifs: ${composers.length}\n`)

  const withImage = composers.filter(c => c.imageId !== null)
  const withoutImage = composers.filter(c => c.imageId === null)

  console.log(`✅ Avec imageId: ${withImage.length}`)
  console.log(`❌ Sans imageId: ${withoutImage.length}\n`)

  // Vérifier si les fichiers existent réellement
  const withValidFile: typeof composers = []
  const withMissingFile: typeof composers = []

  for (const composer of withImage) {
    if (!composer.image) {
      withMissingFile.push(composer)
      continue
    }

    const fullPath = path.join(publicDir, composer.image.path)

    if (fs.existsSync(fullPath)) {
      withValidFile.push(composer)
    } else {
      withMissingFile.push(composer)
    }
  }

  console.log('📁 VÉRIFICATION DES FICHIERS:\n')
  console.log(`✅ Fichiers existants: ${withValidFile.length}`)
  console.log(`❌ Fichiers manquants: ${withMissingFile.length}`)

  if (withMissingFile.length > 0) {
    console.log('\n❌ COMPOSITEURS AVEC FICHIERS MANQUANTS:\n')
    withMissingFile.forEach(c => {
      console.log(`  - ${c.translations[0]?.name || c.slug}`)
      console.log(`    Path DB: ${c.image?.path || 'N/A'}`)
      console.log(`    imageId: ${c.imageId}`)
      console.log('')
    })
  }

  if (withoutImage.length > 0) {
    console.log('\n⚠️  COMPOSITEURS SANS IMAGE LIÉE:\n')
    withoutImage.forEach(c => {
      console.log(`  - ${c.translations[0]?.name || c.slug}`)
    })
  }

  console.log('\n' + '='.repeat(70))
}

diagnoseComposerImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
