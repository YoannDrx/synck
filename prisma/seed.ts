import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface PortfolioItem {
  id: number
  slug: string
  title: string
  subtitle?: string
  category: string
  externalLink?: string
  linkSpotify?: string
  src: string
  height?: string
  releaseDate?: string
  genre?: string
  compositeurs?: {
    name: string
    compoImg?: string
    links?: string
  }[]
  images?: {
    w320?: number
    w575?: number
    w768?: number
    w991?: number
    w1080?: number
    w1199?: number
    w1380?: number
    w1400?: number
    w1540?: number
  }
}

const descriptionCache = new Map<string, string>()
const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

function getDescriptionFromMarkdown(locale: 'fr' | 'en', slug: string) {
  const cacheKey = `${locale}:${slug}`
  if (descriptionCache.has(cacheKey)) {
    return descriptionCache.get(cacheKey)!
  }

  const descriptionsDir = path.join(process.cwd(), 'content', 'portfolio', locale, 'descriptions')
  if (!fs.existsSync(descriptionsDir)) {
    return null
  }

  const normalizedSlug = normalizeKey(slug)
  const files = fs.readdirSync(descriptionsDir)
  const match = files.find((file) => normalizeKey(path.parse(file).name) === normalizedSlug)

  if (!match) {
    return null
  }

  const content = fs.readFileSync(path.join(descriptionsDir, match), 'utf8').trim()
  descriptionCache.set(cacheKey, content)
  return content
}

// Helper: slugify text
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

// Helper: calculate aspect ratio from image path (simplified)
function calculateAspectRatio(width?: number, height?: number): number | null {
  if (width && height && height > 0) {
    return width / height
  }
  return null
}

async function seedCategories(dataFr: PortfolioItem[], dataEn: PortfolioItem[]) {
  console.log('🏷️  Seeding categories...')

  // Extract unique categories from FR data
  const categoriesMapFr = new Map<string, string>()
  dataFr.forEach((item) => {
    if (item.category && !categoriesMapFr.has(item.category)) {
      categoriesMapFr.set(item.category, slugify(item.category))
    }
  })

  // Map FR category name to EN category name
  const categoryTranslationMap = new Map<string, string>()
  dataFr.forEach((itemFr, index) => {
    const itemEn = dataEn[index]
    if (itemFr.category && itemEn?.category) {
      categoryTranslationMap.set(itemFr.category, itemEn.category)
    }
  })

  // Create categories with translations
  let order = 0
  for (const [nameFr, slug] of categoriesMapFr) {
    const nameEn = categoryTranslationMap.get(nameFr) || nameFr

    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        order: order++,
        isActive: true,
        translations: {
          create: [
            { locale: 'fr', name: nameFr },
            { locale: 'en', name: nameEn },
          ],
        },
      },
    })
  }

  console.log(`✅ Created ${categoriesMapFr.size} categories`)
}

async function seedComposers(dataFr: PortfolioItem[]) {
  console.log('🎵 Seeding composers...')

  // Extract all unique composers (deduplicate by name)
  const composersMap = new Map<
    string,
    { name: string; image?: string; links?: string }
  >()

  dataFr.forEach((item) => {
    if (item.compositeurs && Array.isArray(item.compositeurs)) {
      item.compositeurs.forEach((comp) => {
        if (comp.name && !composersMap.has(comp.name)) {
          composersMap.set(comp.name, {
            name: comp.name,
            image: comp.compoImg,
            links: comp.links,
          })
        }
      })
    }
  })

  console.log(`Found ${composersMap.size} unique composers`)

  // Create composers
  let order = 0
  for (const [name, data] of composersMap) {
    const slug = slugify(name)

    // Create asset for composer image if exists
    let imageId: string | undefined
    if (data.image) {
      const asset = await prisma.asset.upsert({
        where: { path: data.image },
        update: {},
        create: {
          path: data.image,
          alt: `Photo de ${name}`,
        },
      })
      imageId = asset.id
    }

    // Extract external URL (handle both string and object formats)
    let externalUrl: string | null = null
    if (data.links) {
      if (typeof data.links === 'string') {
        externalUrl = data.links
      } else if (typeof data.links === 'object' && data.links !== null) {
        // If it's an object, try to get the first URL value
        const urlValues = Object.values(data.links).filter((v): v is string => typeof v === 'string')
        externalUrl = urlValues.length > 0 ? urlValues[0] : null
      }
    }

    await prisma.composer.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        imageId,
        externalUrl, // Add external URL (YouTube, SoundCloud, etc.)
        order: order++,
        isActive: true,
        translations: {
          create: [
            { locale: 'fr', name },
            { locale: 'en', name }, // Same name for both locales (composers' names don't change)
          ],
        },
      },
    })
  }

  console.log(`✅ Created ${composersMap.size} composers`)
}

async function seedWorks(dataFr: PortfolioItem[], dataEn: PortfolioItem[]) {
  console.log('🎨 Seeding works...')

  for (let i = 0; i < dataFr.length; i++) {
    const itemFr = dataFr[i]
    const itemEn = dataEn[i]

    if (!itemFr || !itemEn) continue

    // Find category
    const categorySlug = slugify(itemFr.category || 'other')
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    })

    if (!category) {
      console.warn(`⚠️  Category not found for slug: ${categorySlug}`)
      continue
    }

    // Create cover image asset
    let coverImageId: string | undefined
    if (itemFr.src) {
      const asset = await prisma.asset.upsert({
        where: { path: itemFr.src },
        update: {},
        create: {
          path: itemFr.src,
          alt: itemFr.title,
          // Use first available width/height from images object
          width: itemFr.images?.w1080 || itemFr.images?.w768 || undefined,
          height: itemFr.height ? parseInt(itemFr.height) : undefined,
          aspectRatio:
            calculateAspectRatio(
              itemFr.images?.w1080 || itemFr.images?.w768,
              itemFr.height ? parseInt(itemFr.height) : undefined
            ) || undefined,
        },
      })
      coverImageId = asset.id
    }

    // Parse year from releaseDate (format: DD/MM/YYYY)
    let year: number | undefined
    if (itemFr.releaseDate) {
      const parts = itemFr.releaseDate.split('/')
      if (parts.length === 3) {
        year = parseInt(parts[2])
      }
    }

    const descriptionFr = getDescriptionFromMarkdown('fr', itemFr.slug) || itemFr.subtitle || undefined
    const descriptionEn = getDescriptionFromMarkdown('en', itemEn.slug) || itemEn.subtitle || undefined

    // Create work
    const work = await prisma.work.upsert({
      where: { slug: itemFr.slug },
      update: {},
      create: {
        slug: itemFr.slug,
        categoryId: category.id,
        coverImageId,
        year,
        spotifyUrl: itemFr.linkSpotify || null, // Add Spotify URL
        releaseDate: itemFr.releaseDate || null, // Add release date
        genre: itemFr.genre || null, // Add genre
        order: itemFr.id,
        isActive: true,
        isFeatured: false,
        translations: {
          create: [
            {
              locale: 'fr',
              title: itemFr.title,
              description: descriptionFr,
            },
            {
              locale: 'en',
              title: itemEn.title,
              description: descriptionEn,
            },
          ],
        },
      },
    })

    // Create contributions (Work ↔ Composers)
    if (itemFr.compositeurs && Array.isArray(itemFr.compositeurs)) {
      for (let j = 0; j < itemFr.compositeurs.length; j++) {
        const comp = itemFr.compositeurs[j]
        const composerSlug = slugify(comp.name)
        const composer = await prisma.composer.findUnique({
          where: { slug: composerSlug },
        })

        if (composer) {
          await prisma.contribution.upsert({
            where: {
              workId_composerId: {
                workId: work.id,
                composerId: composer.id,
              },
            },
            update: {},
            create: {
              workId: work.id,
              composerId: composer.id,
              role: 'composer',
              order: j,
            },
          })
        }
      }
    }

    console.log(`✅ Created work: ${itemFr.title}`)
  }

  console.log(`✅ Created ${dataFr.length} works`)
}

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Load JSON data
  const dataFrPath = path.join(
    process.cwd(),
    'content/portfolio/fr/metadata.json'
  )
  const dataEnPath = path.join(
    process.cwd(),
    'content/portfolio/en/metadata.json'
  )

  const dataFr: PortfolioItem[] = JSON.parse(fs.readFileSync(dataFrPath, 'utf-8'))
  const dataEn: PortfolioItem[] = JSON.parse(fs.readFileSync(dataEnPath, 'utf-8'))

  console.log(`📦 Loaded ${dataFr.length} portfolio items (FR)`)
  console.log(`📦 Loaded ${dataEn.length} portfolio items (EN)\n`)

  // Seed in order
  await seedCategories(dataFr, dataEn)
  await seedComposers(dataFr)
  await seedWorks(dataFr, dataEn)

  // Seed admin user
  await seedAdminUser()

  console.log('\n🎉 Database seeding completed!')
}

async function seedAdminUser() {
  console.log('\n👤 Seeding admin user...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@synck.fr'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`)
    return
  }

  // Hash password using bcrypt (Better Auth uses bcrypt with 10 rounds)
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Caroline Senyk',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  })

  // Create Account entry with password
  await prisma.account.create({
    data: {
      userId: admin.id,
      accountId: admin.id,
      providerId: 'credential',
      password: passwordHash,
    },
  })

  console.log(`✅ Admin user created: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   ⚠️  IMPORTANT: Change this password after first login!`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
