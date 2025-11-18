import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnoseImagePaths() {
  console.log('🔍 DIAGNOSTIC DES CHEMINS D\'IMAGES\n')
  console.log('=' .repeat(60))

  // 1. Compter tous les assets
  const totalAssets = await prisma.asset.count()
  console.log(`\n📦 Total Assets: ${totalAssets}`)

  // 2. Compter les assets avec /images/portfolio/
  const portfolioAssets = await prisma.asset.findMany({
    where: {
      path: {
        contains: '/images/portfolio/'
      }
    },
    select: {
      id: true,
      path: true,
      alt: true
    }
  })
  console.log(`\n❌ Assets avec "/images/portfolio/": ${portfolioAssets.length}`)
  if (portfolioAssets.length > 0) {
    console.log('\nExemples:')
    portfolioAssets.slice(0, 5).forEach(asset => {
      console.log(`  - ${asset.path}`)
    })
  }

  // 3. Compter les assets avec /images/projets/
  const projetsAssets = await prisma.asset.findMany({
    where: {
      path: {
        contains: '/images/projets/'
      }
    },
    select: {
      id: true,
      path: true,
      alt: true
    }
  })
  console.log(`\n✅ Assets avec "/images/projets/": ${projetsAssets.length}`)
  if (projetsAssets.length > 0) {
    console.log('\nExemples:')
    projetsAssets.slice(0, 5).forEach(asset => {
      console.log(`  - ${asset.path}`)
    })
  }

  // 4. Vérifier spécifiquement Laurent Dury
  console.log('\n' + '='.repeat(60))
  console.log('🎯 LAURENT DURY - Diagnostic détaillé\n')

  const laurentDury = await prisma.composer.findUnique({
    where: { slug: 'laurent-dury' },
    include: {
      image: true,
      links: true,
      translations: true
    }
  })

  if (laurentDury) {
    console.log(`✓ Compositeur trouvé: ${laurentDury.translations[0]?.name || 'Laurent Dury'}`)
    console.log(`  ID: ${laurentDury.id}`)
    console.log(`  imageId: ${laurentDury.imageId || 'NULL'}`)

    if (laurentDury.image) {
      console.log(`\n📸 Image actuelle:`)
      console.log(`  Path: ${laurentDury.image.path}`)
      console.log(`  Alt: ${laurentDury.image.alt || 'N/A'}`)
      console.log(`  Width: ${laurentDury.image.width || 'N/A'}`)
      console.log(`  Height: ${laurentDury.image.height || 'N/A'}`)
    } else {
      console.log(`\n❌ Aucune image liée au compositeur`)
    }

    console.log(`\n🔗 Liens sociaux: ${laurentDury.links?.length || 0}`)
    if (laurentDury.links && laurentDury.links.length > 0) {
      laurentDury.links.forEach(link => {
        console.log(`  - ${link.platform}: ${link.url}`)
      })
    }
  } else {
    console.log('❌ Laurent Dury introuvable')
  }

  // 5. Compter les compositeurs avec/sans image
  console.log('\n' + '='.repeat(60))
  console.log('👥 STATISTIQUES COMPOSITEURS\n')

  const totalComposers = await prisma.composer.count({ where: { isActive: true } })
  const composersWithImage = await prisma.composer.count({
    where: {
      isActive: true,
      imageId: { not: null }
    }
  })
  const composersWithLinks = await prisma.composer.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { links: true }
      }
    }
  })

  const totalLinks = composersWithLinks.reduce((sum, c) => sum + c._count.links, 0)

  console.log(`Total compositeurs actifs: ${totalComposers}`)
  console.log(`Avec image: ${composersWithImage} (${Math.round(composersWithImage/totalComposers*100)}%)`)
  console.log(`Sans image: ${totalComposers - composersWithImage}`)
  console.log(`Total liens sociaux: ${totalLinks}`)

  // 6. Lister tous les compositeurs sans image
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

  if (composersWithoutImage.length > 0) {
    console.log(`\n❌ Compositeurs sans image (${composersWithoutImage.length}):`)
    composersWithoutImage.forEach(c => {
      console.log(`  - ${c.slug} (${c.translations[0]?.name || 'sans nom'})`)
    })
  }

  // 7. Vérifier les fichiers physiques
  console.log('\n' + '='.repeat(60))
  console.log('📁 VÉRIFICATION FICHIERS PHYSIQUES\n')

  const fs = await import('fs')
  const path = await import('path')

  const photosCompoPath = path.join(process.cwd(), 'public/images/projets/photosCompo')

  if (fs.existsSync(photosCompoPath)) {
    const files = fs.readdirSync(photosCompoPath)
    console.log(`✓ Dossier existe: ${photosCompoPath}`)
    console.log(`✓ Nombre de fichiers: ${files.length}`)
    console.log('\nExemples de fichiers:')
    files.slice(0, 10).forEach(file => {
      console.log(`  - ${file}`)
    })

    // Vérifier si laurentdury.jpg existe
    const laurentDuryFile = files.find(f => f.toLowerCase().includes('laurentdury') || f.toLowerCase().includes('laurent-dury'))
    if (laurentDuryFile) {
      console.log(`\n✓ Photo Laurent Dury trouvée: ${laurentDuryFile}`)
    } else {
      console.log(`\n❌ Photo Laurent Dury introuvable dans les fichiers`)
    }
  } else {
    console.log(`❌ Dossier inexistant: ${photosCompoPath}`)
  }

  console.log('\n' + '='.repeat(60))
}

diagnoseImagePaths()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
