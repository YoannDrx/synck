import type { Metadata } from 'next'

const siteName = 'Caroline Senyk - Copyright Manager'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://carolinesenyk.fr'

interface GenerateMetadataParams {
  title?: string
  description: string
  image?: string
  locale?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

/**
 * Helper to generate consistent metadata across pages
 */
export function generatePageMetadata({
  title,
  description,
  image = '/images/home/IMG_5273.JPG',
  locale = 'fr',
  type = 'website',
  noIndex = false,
}: GenerateMetadataParams): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const ogImage = image.startsWith('http') ? image : `${siteUrl}${image}`
  const localeCode = locale === 'fr' ? 'fr_FR' : 'en_US'

  return {
    title: fullTitle,
    description,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      title: fullTitle,
      description,
      url: siteUrl,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || siteName,
        },
      ],
      locale: localeCode,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  }
}
