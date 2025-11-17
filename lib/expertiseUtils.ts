import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Locale } from './i18n-config'

export interface Label {
  name: string
  src: string
  href: string
}

export interface Documentaire {
  title: string
  subtitle: string
  href: string
  src: string
  srcLg: string
  link: string
  category: string
  height?: string
}

export interface SectionLayout {
  image?: string | null
  position?: 'left' | 'right' | 'auto'
}

export interface ExpertiseFrontmatter {
  id: string
  title: string
  description: string
  slug: string
  imgHome: string
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  img5?: string
  img6?: string
  img2Link?: string
  img3Link?: string
  img4Link?: string
  img5Link?: string
  imgFooter?: string
  labels?: Label[]
  documentaires?: Documentaire[]
  sectionsLayout?: SectionLayout[]
}

export interface Expertise extends ExpertiseFrontmatter {
  content: string
  sections: string[]
}

/**
 * Get all expertise items for a locale (metadata only)
 */
export function getAllExpertises(locale: Locale) {
  const expertiseDirectory = path.join(process.cwd(), 'content', 'expertises', locale)
  const filenames = fs.readdirSync(expertiseDirectory)

  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename, index) => {
      const filePath = path.join(expertiseDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContents)

      return {
        id: data.id || String(index + 1),
        slug: data.slug || path.parse(filename).name,
        href: `/${locale}/expertises/${data.slug || path.parse(filename).name}`,
        title: data.title || 'Titre par défaut',
        subtitle: data.description || 'Sous-titre par défaut',
        imgHome: data.imgHome || data.imgUrl || '/images/service_7.jpeg',
        description: data.description || 'Description par défaut',
      }
    })
}

/**
 * Get a single expertise by slug with full content
 */
export function getExpertise(slug: string, locale: Locale): Expertise | null {
  try {
    const filePath = path.join(process.cwd(), 'content', 'expertises', locale, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const matterResult = matter(fileContents)

    // Split markdown into sections
    const sections = splitMarkdownIntoSections(matterResult.content)

    return {
      ...(matterResult.data as ExpertiseFrontmatter),
      content: matterResult.content,
      sections,
    }
  } catch (error) {
    console.error(`Error loading expertise ${slug}:`, error)
    return null
  }
}

/**
 * Split markdown content into sections
 */
function splitMarkdownIntoSections(markdownContent: string): string[] {
  const sectionDelimiter = '<!-- section:end -->'
  return markdownContent
    .split(sectionDelimiter)
    .map((section) =>
      section
        .replace('<!-- section:start -->', '')
        .replace('<!-- section:end -->', '')
        .trim()
    )
    .filter(section => section.length > 0)
}

/**
 * Get all expertise slugs for static generation
 */
export function getAllExpertiseSlugs(): string[] {
  const expertiseDirectory = path.join(process.cwd(), 'content', 'expertises', 'fr')
  const filenames = fs.readdirSync(expertiseDirectory)

  return filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => path.parse(filename).name)
}

/**
 * Get section layout configuration for a specific section
 * Falls back to imgN if sectionsLayout is not defined
 */
export function getSectionLayout(
  expertise: Expertise,
  sectionIndex: number
): SectionLayout {
  // If sectionsLayout is defined, use it
  if (expertise.sectionsLayout && expertise.sectionsLayout[sectionIndex]) {
    const layout = expertise.sectionsLayout[sectionIndex]

    // Resolve image path: if it's a key (like "img1"), get the actual path
    let resolvedImage: string | null = null

    if (layout.image) {
      // Check if it's a path (starts with /) or a key (like "img1")
      if (layout.image.startsWith('/')) {
        resolvedImage = layout.image
      } else {
        // It's a key, resolve it from the expertise object
        const imageKey = layout.image as keyof ExpertiseFrontmatter
        resolvedImage = (expertise[imageKey] as string) || null
      }
    }

    return {
      image: resolvedImage,
      position: layout.position || 'auto',
    }
  }

  // Fallback: use img1-6 with auto alternation
  const imageKey = `img${sectionIndex + 1}` as keyof ExpertiseFrontmatter
  const image = expertise[imageKey] as string | undefined

  return {
    image: image || null,
    position: 'auto',
  }
}
