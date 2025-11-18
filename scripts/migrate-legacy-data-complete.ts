/**
 * Script de migration complète des données legacy vers Prisma
 *
 * Ce script migre :
 * - externalLink → Work.externalUrl
 * - Descriptions Markdown → WorkTranslation.description
 * - Liens sociaux compositeurs → ComposerLink table
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface LegacyProjetMetadata {
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
    links?: string | { [key: string]: string }
  }[]
}

// Cache pour descriptions Markdown
const descriptionCache = new Map<string, string>()

// Normalisation de clé (comme dans seed.ts)
const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

// Slugify (comme dans seed.ts)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

// Récupérer description depuis Markdown
function getDescriptionFromMarkdown(locale: 'fr' | 'en', slug: string): string | null {
  const cacheKey = `${locale}:${slug}`
  if (descriptionCache.has(cacheKey)) {
    return descriptionCache.get(cacheKey)!
  }

  const descriptionsDir = path.join(process.cwd(), 'content', 'projets', locale, 'descriptions')
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

// Parser les liens sociaux (gère string ou object)
function parseSocialLinks(
  links?: string | { [key: string]: string }
): Array<{ platform: string; url: string; label?: string }> {
  if (!links) return []

  const parsed: Array<{ platform: string; url: string; label?: string }> = []

  if (typeof links === 'string') {
    // C'est une URL unique
    const platform = detectPlatform(links)
    parsed.push({ platform, url: links })
  } else if (typeof links === 'object') {
    // C'est un objet {platform: url} ou {label: url}
    for (const [key, url] of Object.entries(links)) {
      if (typeof url === 'string' && url.startsWith('http')) {
        const platform = detectPlatform(url)
        parsed.push({ platform, url, label: key })
      }
    }
  }

  return parsed
}

// Détecter la plateforme depuis l'URL
function detectPlatform(url: string): string {
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube'
  if (lowerUrl.includes('soundcloud.com')) return 'soundcloud'
  if (lowerUrl.includes('spotify.com')) return 'spotify'
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return 'facebook'
  if (lowerUrl.includes('instagram.com')) return 'instagram'
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter'
  if (lowerUrl.includes('linkedin.com')) return 'linkedin'
  if (lowerUrl.includes('tiktok.com')) return 'tiktok'
  return 'website'
}

async function migrateWorkExternalLinks() {
  console.log('\n📎 Migrating Work external links...')

  const dataFrPath = path.join(process.cwd(), 'content/projets/fr/metadata.json')
  const dataFr: LegacyProjetMetadata[] = JSON.parse(fs.readFileSync(dataFrPath, 'utf-8'))

  let updated = 0
  for (const item of dataFr) {
    if (item.externalLink && item.externalLink.trim() !== '') {
      const work = await prisma.work.findUnique({
        where: { slug: item.slug },
      })

      if (work) {
        await prisma.work.update({
          where: { slug: item.slug },
          data: { externalUrl: item.externalLink },
        })
        console.log(`  ✅ Updated externalUrl for: ${item.title}`)
        updated++
      }
    }
  }

  console.log(`✅ Updated ${updated} work external links`)
}

async function migrateWorkDescriptions() {
  console.log('\n📝 Migrating Work descriptions from Markdown...')

  const allWorks = await prisma.work.findMany({
    include: {
      translations: true,
    },
  })

  let updated = 0
  for (const work of allWorks) {
    for (const locale of ['fr', 'en'] as const) {
      const description = getDescriptionFromMarkdown(locale, work.slug)
      if (description) {
        const translation = work.translations.find((t) => t.locale === locale)
        if (translation && (!translation.description || translation.description.length < description.length)) {
          await prisma.workTranslation.update({
            where: { id: translation.id },
            data: { description },
          })
          console.log(`  ✅ Updated ${locale} description for: ${work.slug}`)
          updated++
        }
      }
    }
  }

  console.log(`✅ Updated ${updated} work descriptions`)
}

async function migrateComposerSocialLinks() {
  console.log('\n🔗 Migrating Composer social links...')

  const dataFrPath = path.join(process.cwd(), 'content/projets/fr/metadata.json')
  const dataFr: LegacyProjetMetadata[] = JSON.parse(fs.readFileSync(dataFrPath, 'utf-8'))

  // Regrouper tous les compositeurs avec leurs liens
  const composersMap = new Map<
    string,
    Array<{ platform: string; url: string; label?: string }>
  >()

  for (const item of dataFr) {
    if (item.compositeurs && Array.isArray(item.compositeurs)) {
      for (const comp of item.compositeurs) {
        if (comp.name && comp.links) {
          const slug = slugify(comp.name)
          const existingLinks = composersMap.get(slug) || []
          const newLinks = parseSocialLinks(comp.links)

          // Fusionner et dédupliquer par URL
          const allLinks = [...existingLinks, ...newLinks]
          const uniqueLinks = Array.from(
            new Map(allLinks.map((link) => [link.url, link])).values()
          )

          composersMap.set(slug, uniqueLinks)
        }
      }
    }
  }

  console.log(`Found ${composersMap.size} composers with social links`)

  let created = 0
  for (const [slug, links] of composersMap) {
    const composer = await prisma.composer.findUnique({
      where: { slug },
    })

    if (composer) {
      for (const [index, link] of links.entries()) {
        try {
          await prisma.composerLink.create({
            data: {
              composerId: composer.id,
              platform: link.platform,
              url: link.url,
              label: link.label,
              order: index,
            },
          })
          created++
        } catch (error) {
          // Ignorer les doublons (contrainte unique)
          console.log(`  ⚠️  Skipping duplicate link for ${slug}: ${link.url}`)
        }
      }
      console.log(`  ✅ Created ${links.length} links for: ${slug}`)
    }
  }

  console.log(`✅ Created ${created} composer social links`)
}

async function main() {
  console.log('🚀 Starting complete legacy data migration...\n')

  try {
    await migrateWorkExternalLinks()
    await migrateWorkDescriptions()
    await migrateComposerSocialLinks()

    console.log('\n🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
