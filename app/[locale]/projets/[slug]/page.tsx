import { notFound } from 'next/navigation'

import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/i18n-config'
import {
  type WorkContribution,
  type WorkImage,
  getAllWorkSlugs,
  getProjetsFromPrisma,
  getWorkBySlug,
} from '@/lib/prismaProjetsUtils'
import { buildWorkRelations, toSimpleWork } from '@/lib/workRelations'

import { ProjetDetailClient } from '@/components/sections/projet-detail-client'

// Generate static params for all work slugs
export async function generateStaticParams() {
  const slugs = await getAllWorkSlugs()
  const locales: Locale[] = ['fr', 'en']

  const params: { locale: Locale; slug: string }[] = []

  locales.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug })
    })
  })

  return params
}

type WorkDetailPageParams = {
  params: Promise<{
    locale: Locale
    slug: string
  }>
  searchParams?: Promise<{
    category?: string
  }>
}

// Helper function to transform asset path to URL
function assetPathToUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('public/')) {
    return `/${path.substring('public/'.length)}`
  }
  if (path.startsWith('/')) {
    return path
  }
  return `/${path}`
}

// Helper to create Spotify embed URL
function createSpotifyEmbedUrl(rawUrl: string | null): string | undefined {
  if (!rawUrl) return undefined
  try {
    const parsed = new URL(rawUrl)
    const pathParts = parsed.pathname.split('/').filter(Boolean)
    const albumIndex = pathParts.findIndex((part) => part === 'album')
    if (albumIndex !== -1 && albumIndex + 1 < pathParts.length) {
      const albumId = pathParts[albumIndex + 1]
      return `https://open.spotify.com/embed/album/${albumId}`
    }
    return rawUrl.replace('https://open.spotify.com/', 'https://open.spotify.com/embed/')
  } catch {
    return rawUrl.replace('https://open.spotify.com/', 'https://open.spotify.com/embed/')
  }
}

export default async function WorkDetailPage({ params, searchParams }: WorkDetailPageParams) {
  const { locale, slug } = await params
  const safeLocale = locale === 'en' ? 'en' : 'fr'
  const work = await getWorkBySlug(slug, safeLocale)
  const dictionary = await getDictionary(safeLocale)
  const detailCopy = dictionary.projetDetail

  // Get category from search params for breadcrumb
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const categoryParam = resolvedSearchParams.category

  if (!work) {
    notFound()
  }

  // Get all works for prev/next navigation
  const allWorks = await getProjetsFromPrisma(safeLocale)
  const relations = buildWorkRelations(allWorks.map(toSimpleWork))
  const currentIndex = allWorks.findIndex((w) => w.slug === slug)
  const prevWork = currentIndex > 0 ? allWorks[currentIndex - 1] : null
  const nextWork = currentIndex < allWorks.length - 1 ? allWorks[currentIndex + 1] : null

  // Extract data from Prisma work
  const translation = work.translations[0]
  const categoryTranslation = work.category?.translations[0]
  const labelTranslation = work.label?.translations[0]
  const translationDescription = translation?.description?.trim()
  const description =
    translationDescription &&
    translationDescription.length > 10 &&
    translationDescription !== 'See Details'
      ? translationDescription
      : undefined

  // Prepare project data for client component
  const projectData = {
    slug: work.slug,
    title: translation?.title ?? work.slug,
    subtitle: translation?.subtitle ?? undefined,
    description,
    coverImage: assetPathToUrl(work.coverImage?.path),
    coverImageAlt: work.coverImage?.alt ?? translation?.title ?? work.slug,
    category: categoryTranslation?.name,
    categorySlug: work.category?.slug,
    label: labelTranslation?.name,
    genre: work.genre ?? undefined,
    releaseDate: work.releaseDate ?? undefined,
    externalUrl: work.externalUrl?.trim() ?? undefined,
    youtubeUrl: work.youtubeUrl?.trim() ?? undefined,
    spotifyEmbedUrl: createSpotifyEmbedUrl(work.spotifyUrl),
  }
  const relatedClips = relations.projectToClips[slug] ?? []
  const relatedProjects = relations.clipToProjects[slug] ?? []

  const mapContributionToArtist = (contribution: WorkContribution, idPrefix?: string) => {
    const artistTranslation = contribution.artist.translations[0]
    const slug = contribution.artist.slug
    return {
      id: idPrefix ? `${idPrefix}-${slug}` : contribution.id,
      slug,
      name: artistTranslation?.name ?? 'Unknown Artist',
      image: assetPathToUrl(contribution.artist.image?.path),
      imageAlt: contribution.artist.image?.alt ?? artistTranslation?.name ?? 'Artist',
    }
  }

  let relatedProjectArtists: ReturnType<typeof mapContributionToArtist>[] = []
  if (relatedProjects.length > 0) {
    const relatedContributions = await Promise.all(
      relatedProjects.map(async (proj) => {
        const relatedWork = await getWorkBySlug(proj.slug, safeLocale)
        return relatedWork?.contributions ?? []
      })
    )

    const deduped = new Map<string, ReturnType<typeof mapContributionToArtist>>()
    relatedContributions.flat().forEach((contribution) => {
      const artistData = mapContributionToArtist(contribution, 'related')
      if (!deduped.has(artistData.slug)) {
        deduped.set(artistData.slug, artistData)
      }
    })
    relatedProjectArtists = Array.from(deduped.values())
  }

  // Prepare artists data
  const artists = (work.contributions ?? []).map((contribution) =>
    mapContributionToArtist(contribution)
  )

  // Prepare gallery data
  const gallery = (work.images ?? []).map((image: WorkImage) => ({
    id: image.id,
    path: assetPathToUrl(image.path) ?? '/images/placeholder.jpg',
    alt: image.alt ?? undefined,
  }))

  // Prepare navigation works
  const navPrevWork = prevWork ? { slug: prevWork.slug, title: prevWork.title } : null
  const navNextWork = nextWork ? { slug: nextWork.slug, title: nextWork.title } : null

  return (
    <ProjetDetailClient
      locale={safeLocale}
      project={projectData}
      artists={artists}
      gallery={gallery}
      relatedClips={relatedClips}
      relatedProjects={relatedProjects}
      relatedProjectArtists={relatedProjectArtists}
      prevWork={navPrevWork}
      nextWork={navNextWork}
      nav={{
        home: dictionary.nav.home,
        projets: dictionary.nav.projets,
      }}
      copy={detailCopy}
      categoryParam={categoryParam}
    />
  )
}
