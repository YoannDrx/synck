/**
 * Script de migration des Expertises depuis Markdown vers Prisma
 *
 * Ce script:
 * - Lit tous les fichiers MD d'expertises (FR + EN)
 * - Crée les entrées Expertise dans la DB
 * - Migre les images depuis /images/gestion-admin/ vers /images/projets/expertises/
 * - Crée les traductions FR et EN
 * - Préserve l'ordre et la structure des sections
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync, readdirSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { join, basename, extname } from 'path'
import matter from 'gray-matter'

const prisma = new PrismaClient()

interface ExpertiseFrontmatter {
  id: string
  title: string
  description: string
  slug: string
  imgHome?: string
  img1?: string
  img2?: string
  img2Link?: string
  img3?: string
  img3Link?: string
  img4?: string
  img4Link?: string
  img5?: string
  img5Link?: string
  imgFooter?: string
  documentaires?: any[]
}

interface ExpertiseData {
  slug: string
  order: number
  fr?: {
    title: string
    description: string
    content: string
    images: string[]
  }
  en?: {
    title: string
    description: string
    content: string
    images: string[]
  }
  coverImage?: string
  allImages: string[]
}

// Map des slugs vers l'ordre d'affichage
const EXPERTISE_ORDER: Record<string, number> = {
  'gestion-administrative-et-editoriale': 1,
  'droits-auteur': 2,
  'droits-voisins': 3,
  'sous-edition': 4,
  'gestion-distribution': 5,
  'mise-en-page': 6,
  'dossier-subvention': 7,
}

/**
 * Migre une image depuis /images/gestion-admin/ vers /images/projets/expertises/
 * et retourne le nouveau chemin
 */
function migrateImage(oldPath: string, expertiseSlug: string): string {
  if (!oldPath || oldPath === '') return ''

  // Si l'image est déjà dans /images/projets/, la retourner telle quelle
  if (oldPath.startsWith('/images/projets/')) {
    return oldPath
  }

  const publicDir = join(process.cwd(), 'public')
  const oldFullPath = join(publicDir, oldPath)

  if (!existsSync(oldFullPath)) {
    console.warn(`⚠️  Image not found: ${oldPath}`)
    return ''
  }

  // Nouveau chemin
  const filename = basename(oldPath)
  const newPath = `/images/projets/expertises/${expertiseSlug}/${filename}`
  const newFullPath = join(publicDir, newPath)

  // Créer le dossier de destination si nécessaire
  const newDir = join(publicDir, 'images', 'projets', 'expertises', expertiseSlug)
  if (!existsSync(newDir)) {
    mkdirSync(newDir, { recursive: true })
  }

  // Copier l'image
  try {
    copyFileSync(oldFullPath, newFullPath)
    console.log(`  ✓ Migrated: ${oldPath} → ${newPath}`)
    return newPath
  } catch (error) {
    console.error(`  ✗ Failed to copy: ${oldPath}`, error)
    return oldPath // Retourner l'ancien chemin en cas d'erreur
  }
}

/**
 * Lit tous les fichiers MD et les groupe par slug
 */
function readAllExpertises(): Map<string, ExpertiseData> {
  const contentDir = join(process.cwd(), 'content', 'expertises')
  const expertisesMap = new Map<string, ExpertiseData>()

  // Lire FR
  const frDir = join(contentDir, 'fr')
  const frFiles = readdirSync(frDir).filter(f => f.endsWith('.md'))

  for (const file of frFiles) {
    const filePath = join(frDir, file)
    const fileContent = readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const frontmatter = data as ExpertiseFrontmatter

    const slug = frontmatter.slug
    const order = EXPERTISE_ORDER[slug] || 999

    // Collecter toutes les images
    const images: string[] = []
    if (frontmatter.img1) images.push(frontmatter.img1)
    if (frontmatter.img2) images.push(frontmatter.img2)
    if (frontmatter.img3) images.push(frontmatter.img3)
    if (frontmatter.img4) images.push(frontmatter.img4)
    if (frontmatter.img5) images.push(frontmatter.img5)
    if (frontmatter.imgFooter) images.push(frontmatter.imgFooter)

    const allImages = [frontmatter.imgHome, ...images].filter(Boolean) as string[]

    expertisesMap.set(slug, {
      slug,
      order,
      fr: {
        title: frontmatter.title,
        description: frontmatter.description || '',
        content,
        images,
      },
      coverImage: frontmatter.imgHome,
      allImages,
    })
  }

  // Lire EN
  const enDir = join(contentDir, 'en')
  const enFiles = readdirSync(enDir).filter(f => f.endsWith('.md'))

  for (const file of enFiles) {
    const filePath = join(enDir, file)
    const fileContent = readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const frontmatter = data as ExpertiseFrontmatter

    const slug = frontmatter.slug

    const existing = expertisesMap.get(slug)
    if (existing) {
      // Collecter les images EN
      const images: string[] = []
      if (frontmatter.img1) images.push(frontmatter.img1)
      if (frontmatter.img2) images.push(frontmatter.img2)
      if (frontmatter.img3) images.push(frontmatter.img3)
      if (frontmatter.img4) images.push(frontmatter.img4)
      if (frontmatter.img5) images.push(frontmatter.img5)
      if (frontmatter.imgFooter) images.push(frontmatter.imgFooter)

      // Fusionner les images (en évitant les doublons)
      const allImages = Array.from(
        new Set([
          ...existing.allImages,
          frontmatter.imgHome,
          ...images,
        ].filter(Boolean))
      ) as string[]

      existing.en = {
        title: frontmatter.title,
        description: frontmatter.description || '',
        content,
        images,
      }
      existing.allImages = allImages

      // Mettre à jour la coverImage si EN a une différente
      if (frontmatter.imgHome && frontmatter.imgHome !== existing.coverImage) {
        existing.coverImage = frontmatter.imgHome
      }
    } else {
      console.warn(`⚠️  No FR version found for slug: ${slug}`)
    }
  }

  return expertisesMap
}

/**
 * Crée ou trouve un Asset pour une image
 */
async function createOrFindAsset(imagePath: string): Promise<string | null> {
  if (!imagePath || imagePath === '') return null

  try {
    // Chercher si l'asset existe déjà
    let asset = await prisma.asset.findUnique({
      where: { path: imagePath },
    })

    if (!asset) {
      // Créer l'asset
      asset = await prisma.asset.create({
        data: { path: imagePath },
      })
      console.log(`    ✓ Created asset: ${imagePath}`)
    }

    return asset.id
  } catch (error) {
    console.error(`    ✗ Failed to create asset: ${imagePath}`, error)
    return null
  }
}

/**
 * Migre une expertise vers Prisma
 */
async function migrateExpertise(data: ExpertiseData): Promise<void> {
  console.log(`\n📄 Migrating: ${data.slug}`)

  // 1. Migrer toutes les images
  console.log('  Migrating images...')
  const migratedImages = data.allImages.map(img => migrateImage(img, data.slug))
  const coverImagePath = data.coverImage ? migrateImage(data.coverImage, data.slug) : ''

  // 2. Créer les assets
  console.log('  Creating assets...')
  const coverImageId = coverImagePath ? await createOrFindAsset(coverImagePath) : null
  const imageIds: string[] = []

  for (const imgPath of migratedImages) {
    if (imgPath && imgPath !== coverImagePath) {
      const assetId = await createOrFindAsset(imgPath)
      if (assetId) imageIds.push(assetId)
    }
  }

  // 3. Créer ou mettre à jour l'expertise
  console.log('  Creating expertise...')

  // Vérifier si l'expertise existe déjà
  const existingExpertise = await prisma.expertise.findUnique({
    where: { slug: data.slug },
    include: { translations: true, images: true },
  })

  let expertise

  if (existingExpertise) {
    console.log(`  ℹ️  Expertise already exists, updating...`)

    // Mettre à jour
    expertise = await prisma.expertise.update({
      where: { slug: data.slug },
      data: {
        order: data.order,
        isActive: true,
        ...(coverImageId && { coverImageId }),
        images: {
          set: imageIds.map(id => ({ id })),
        },
      },
      include: { translations: true },
    })
  } else {
    // Créer
    expertise = await prisma.expertise.create({
      data: {
        slug: data.slug,
        order: data.order,
        isActive: true,
        ...(coverImageId && { coverImageId }),
        images: {
          connect: imageIds.map(id => ({ id })),
        },
      },
      include: { translations: true },
    })
  }

  // 4. Créer ou mettre à jour les traductions
  console.log('  Creating translations...')

  if (data.fr) {
    const existingFr = expertise.translations.find(t => t.locale === 'fr')

    if (existingFr) {
      await prisma.expertiseTranslation.update({
        where: { id: existingFr.id },
        data: {
          title: data.fr.title,
          description: data.fr.description,
          content: data.fr.content,
        },
      })
    } else {
      await prisma.expertiseTranslation.create({
        data: {
          expertiseId: expertise.id,
          locale: 'fr',
          title: data.fr.title,
          description: data.fr.description,
          content: data.fr.content,
        },
      })
    }
    console.log('    ✓ FR translation')
  }

  if (data.en) {
    const existingEn = expertise.translations.find(t => t.locale === 'en')

    if (existingEn) {
      await prisma.expertiseTranslation.update({
        where: { id: existingEn.id },
        data: {
          title: data.en.title,
          description: data.en.description,
          content: data.en.content,
        },
      })
    } else {
      await prisma.expertiseTranslation.create({
        data: {
          expertiseId: expertise.id,
          locale: 'en',
          title: data.en.title,
          description: data.en.description,
          content: data.en.content,
        },
      })
    }
    console.log('    ✓ EN translation')
  }

  console.log(`✅ Successfully migrated: ${data.slug}`)
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Starting Expertises migration to Prisma...\n')

  try {
    // Lire toutes les expertises
    console.log('📖 Reading all expertise files...')
    const expertises = readAllExpertises()
    console.log(`Found ${expertises.size} expertises\n`)

    // Migrer chaque expertise
    for (const [slug, data] of expertises.entries()) {
      await migrateExpertise(data)
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('  1. Create lib/prismaExpertiseUtils.ts')
    console.log('  2. Update pages to use Prisma')
    console.log('  3. Test the site')
    console.log('  4. Delete legacy files (lib/expertiseUtils.ts, content/expertises/)')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
