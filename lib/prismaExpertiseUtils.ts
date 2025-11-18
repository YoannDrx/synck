import { prisma } from './prisma'
import { cache } from 'react'
import type { Prisma } from '@prisma/client'
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

export interface ExpertiseListItem {
  id: string
  slug: string
  href: string
  title: string
  subtitle: string
  imgHome: string
  description: string
}

export interface Expertise {
  id: string
  slug: string
  title: string
  description: string
  content: string
  sections: string[]
  imgHome: string
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  img5?: string
  imgFooter?: string
  img2Link?: string
  img3Link?: string
  img4Link?: string
  img5Link?: string
  labels?: Label[]
  documentaires?: Documentaire[]
  sectionsLayout?: SectionLayout[]
}

export type ExpertiseWithDetails = Prisma.ExpertiseGetPayload<{
  include: {
    translations: {
      where: {
        locale: Locale
      }
    }
    coverImage: true
    images: true
  }
}>

/**
 * Get all expertise items for a locale (metadata only)
 */
export const getAllExpertises = cache(async (locale: Locale): Promise<ExpertiseListItem[]> => {
  try {
    const expertises = await prisma.expertise.findMany({
      where: {
        isActive: true,
      },
      include: {
        translations: {
          where: {
            locale,
          },
        },
        coverImage: true,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return expertises.map((expertise) => {
      const translation = expertise.translations[0]

      return {
        id: expertise.id,
        slug: expertise.slug,
        href: `/${locale}/expertises/${expertise.slug}`,
        title: translation?.title || expertise.slug,
        subtitle: translation?.description || '',
        imgHome: expertise.coverImage?.path || '/images/placeholder.jpg',
        description: translation?.description || '',
      }
    })
  } catch (error) {
    console.error('Error fetching expertises from Prisma:', error)
    return []
  }
})

/**
 * Get a single expertise by slug with full content
 */
export const getExpertise = cache(async (slug: string, locale: Locale): Promise<Expertise | null> => {
  try {
    const expertise = await prisma.expertise.findUnique({
      where: { slug },
      include: {
        translations: {
          where: {
            locale,
          },
        },
        coverImage: true,
        images: {
          orderBy: {
            path: 'asc', // Les images sont triées par nom de fichier
          },
        },
      },
    })

    if (!expertise) {
      return null
    }

    const translation = expertise.translations[0]
    if (!translation) {
      return null
    }

    // Split markdown content into sections
    const sections = splitMarkdownIntoSections(translation.content)

    // Build image mapping from the images array
    // Les images sont stockées dans l'ordre: img1, img2, img3, img4, img5, imgFooter
    const allImages = expertise.images.map(img => img.path)
    const imgHome = expertise.coverImage?.path || '/images/placeholder.jpg'

    return {
      id: expertise.id,
      slug: expertise.slug,
      title: translation.title,
      description: translation.description || '',
      content: translation.content,
      sections,
      imgHome,
      img1: allImages[0],
      img2: allImages[1],
      img3: allImages[2],
      img4: allImages[3],
      img5: allImages[4],
      imgFooter: allImages[allImages.length - 1], // La dernière image est imgFooter
      // Note: Les liens img2Link, img3Link, etc. ne sont pas stockés dans Prisma
      // pour l'instant. On pourrait les ajouter plus tard si nécessaire.
      labels: undefined,
      documentaires: undefined,
      sectionsLayout: undefined,
    }
  } catch (error) {
    console.error(`Error fetching expertise ${slug} from Prisma:`, error)
    return null
  }
})

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
export async function getAllExpertiseSlugs(): Promise<string[]> {
  try {
    const expertises = await prisma.expertise.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
      },
    })

    return expertises.map((expertise) => expertise.slug)
  } catch (error) {
    console.error('Error fetching expertise slugs:', error)
    return []
  }
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
        const imageKey = layout.image as keyof Expertise
        resolvedImage = (expertise[imageKey] as string) || null
      }
    }

    return {
      image: resolvedImage,
      position: layout.position || 'auto',
    }
  }

  // Fallback: use img1-5 with auto alternation
  const imageKey = `img${sectionIndex + 1}` as keyof Expertise
  const image = expertise[imageKey] as string | undefined

  return {
    image: image || null,
    position: 'auto',
  }
}
