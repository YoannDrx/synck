import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

// Mappings des slugs du Markdown vers les slugs de la DB (seed-data/labels.json)
const LABEL_MAPPING: Record<string, string> = {
  'little-big-story': 'little-big-story',
  '13-prods': '13prods',
  'pop-films': 'pop-films',
  'via-decouvertes-films': 'via-decouvertes-films',
}

const SOURCE_FILE = path.join(
  process.cwd(),
  'content/expertises/fr/gestion-administrative-et-editoriale.md'
)
const DEST_WORKS_FILE = path.join(process.cwd(), 'seed-data/works.json')
const DESCRIPTIONS_DIR = path.join(process.cwd(), 'seed-data/descriptions')

// Simple slugify function
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

async function migrate() {
  console.log('🚀 Starting migration...')

  // 1. Read Source Content
  const fileContent = fs.readFileSync(SOURCE_FILE, 'utf-8')
  const { data } = matter(fileContent)

  if (!data.documentaires || !Array.isArray(data.documentaires)) {
    console.error('❌ No documentaires found in source file.')
    return
  }

  console.log(`Found ${data.documentaires.length} documentaires to migrate.`)

  // 2. Read Existing Works
  const worksJson = fs.readFileSync(DEST_WORKS_FILE, 'utf-8')
  const works = JSON.parse(worksJson)
  const existingSlugs = new Set(works.map((w: any) => w.slug))

  let addedCount = 0

  // 3. Transform and Add
  // Start ordering after the last existing work
  let currentOrder = works.length > 0 ? Math.max(...works.map((w: any) => w.order || 0)) + 1 : 100

  for (const doc of data.documentaires) {
    const slug = slugify(doc.title)

    if (existingSlugs.has(slug)) {
      console.warn(`⚠️  Skipping duplicate slug: ${slug}`)
      continue
    }

    // Map label slug
    const rawCategory = doc.category || ''
    const productionCompanySlug = LABEL_MAPPING[rawCategory] || rawCategory

    // Normalize image path (remove leading slash, add public if missing)
    let coverImage = doc.src || ''
    if (coverImage.startsWith('/')) coverImage = coverImage.substring(1)
    if (!coverImage.startsWith('public/')) coverImage = `public/${coverImage}`

    const newWork = {
      slug,
      titleFr: doc.title,
      titleEn: doc.title, // Default to FR title
      subtitleFr: doc.subtitle || productionCompanySlug,
      subtitleEn: doc.subtitle || productionCompanySlug,
      descriptionFr: '', // Content will be in md files
      descriptionEn: '',
      category: 'documentaire', // This is the main Category model
      productionCompanySlug: productionCompanySlug, // This links to Label model
      coverImage: coverImage,
      releaseDate: null, // No date in frontmatter
      genre: 'Documentaire',
      externalUrl: doc.link || null,
      spotifyUrl: null,
      artists: [],
      isActive: true,
      order: currentOrder++,
    }

    works.push(newWork)

    // Create description files
    const descFrDir = path.join(DESCRIPTIONS_DIR, 'fr')
    const descEnDir = path.join(DESCRIPTIONS_DIR, 'en')

    if (!fs.existsSync(descFrDir)) fs.mkdirSync(descFrDir, { recursive: true })
    if (!fs.existsSync(descEnDir)) fs.mkdirSync(descEnDir, { recursive: true })

    // Write simple markdown files to satisfy seed requirement
    fs.writeFileSync(
      path.join(descFrDir, `${slug}.md`),
      `---
title: "${doc.title}"
---

${doc.title}
`
    )
    fs.writeFileSync(
      path.join(descEnDir, `${slug}.md`),
      `---
title: "${doc.title}"
---

${doc.title}
`
    )

    addedCount++
  }

  // 4. Save Works JSON
  fs.writeFileSync(DEST_WORKS_FILE, JSON.stringify(works, null, 2))
  console.log(`✅ Successfully added ${addedCount} new works to works.json`)

  // 5. Update Source Markdown (Remove documentaires list)
  delete data.documentaires
  const updatedContent = matter.stringify(matter(fileContent).content, data)

  // matter.stringify tends to quote all keys, which is valid but different style.
  // Let's keep it simple.
  fs.writeFileSync(SOURCE_FILE, updatedContent)
  console.log('✅ Removed documentaires list from source markdown file.')
}

migrate().catch(console.error)
