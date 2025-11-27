import { NextResponse } from 'next/server'

import { withAuth } from '@/lib/api/with-auth'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

type Severity = 'error' | 'warning' | 'info'

type DuplicateAsset = {
  path: string
  count: number
  severity: Severity
  reason: string
  assets: {
    id: string
    path: string
    alt: string | null
    width: number | null
    height: number | null
    createdAt: Date
    usageCount: number
  }[]
}

type DuplicateWork = {
  identifier: string
  type: 'slug' | 'title'
  count: number
  severity: Severity
  reason: string
  works: {
    id: string
    slug: string
    translations: {
      locale: string
      title: string
    }[]
    category: {
      id: string
      slug: string
      translations: {
        locale: string
        name: string
      }[]
    }
    year: number | null
    createdAt: Date
  }[]
}

type DuplicateArtist = {
  identifier: string
  type: 'slug' | 'name' | 'similar'
  count: number
  severity: Severity
  reason: string
  artists: {
    id: string
    slug: string
    translations: {
      locale: string
      name: string
    }[]
    createdAt: Date
  }[]
}

type ArtistIntegrityIssue = {
  id: string
  slug: string
  name: string
  issue: 'no_bio_fr' | 'no_bio_en' | 'no_bio_both' | 'no_photo' | 'no_links'
  severity: Severity
  reason: string
  createdAt: Date
}

type DuplicateCategory = {
  slug: string
  count: number
  severity: Severity
  reason: string
  categories: {
    id: string
    slug: string
    translations: {
      locale: string
      name: string
    }[]
    createdAt: Date
  }[]
}

type DuplicateLabel = {
  slug: string
  count: number
  severity: Severity
  reason: string
  labels: {
    id: string
    slug: string
    translations: {
      locale: string
      name: string
    }[]
    createdAt: Date
  }[]
}

type UnusedAsset = {
  id: string
  path: string
  alt: string | null
  width: number | null
  height: number | null
  createdAt: Date
}

type DuplicatesResponse = {
  assets: {
    duplicatesByPath: DuplicateAsset[]
    unusedAssets: UnusedAsset[]
    totalDuplicates: number
    totalUnused: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  works: {
    duplicatesBySlug: DuplicateWork[]
    duplicatesByTitle: DuplicateWork[]
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  artists: {
    duplicatesBySlug: DuplicateArtist[]
    duplicatesByName: DuplicateArtist[]
    duplicatesBySimilarName: DuplicateArtist[]
    integrityIssues: ArtistIntegrityIssue[]
    totalDuplicates: number
    totalIntegrityIssues: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  categories: {
    duplicatesBySlug: DuplicateCategory[]
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  labels: {
    duplicatesBySlug: DuplicateLabel[]
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
}

// GET /api/admin/monitoring/duplicates - Detect duplicates across entities
export const GET = withAuth(async () => {
  try {
    // 1. Detect duplicate assets by path
    const allAssets = await prisma.asset.findMany({
      select: {
        id: true,
        path: true,
        alt: true,
        width: true,
        height: true,
        createdAt: true,
        workImages: { select: { id: true } },
        workCover: { select: { id: true } },
        categoryImages: { select: { id: true } },
        labelImages: { select: { id: true } },
        artistImages: { select: { id: true } },
        expertiseImages: { select: { id: true } },
        expertiseCover: { select: { id: true } },
      },
    })

    // Group by path
    const assetsByPath = new Map<string, ((typeof allAssets)[0] & { usageCount: number })[]>()
    const unusedAssets: UnusedAsset[] = []

    for (const asset of allAssets) {
      const usageCount =
        asset.workImages.length +
        asset.workCover.length +
        asset.categoryImages.length +
        asset.labelImages.length +
        asset.artistImages.length +
        asset.expertiseImages.length +
        asset.expertiseCover.length

      if (usageCount === 0) {
        unusedAssets.push({
          id: asset.id,
          path: asset.path,
          alt: asset.alt,
          width: asset.width,
          height: asset.height,
          createdAt: asset.createdAt,
        })
      }

      const existing = assetsByPath.get(asset.path) ?? []
      assetsByPath.set(asset.path, [
        ...existing,
        {
          ...asset,
          usageCount,
        },
      ])
    }

    const duplicateAssetsByPath: DuplicateAsset[] = Array.from(assetsByPath.entries())
      .filter(([, assets]) => assets.length > 1)
      .map(([path, assets]) => ({
        path,
        count: assets.length,
        severity: 'error' as const,
        reason: "Même chemin d'accès - doublons à supprimer",
        assets: assets.map((a) => ({
          id: a.id,
          path: a.path,
          alt: a.alt,
          width: a.width,
          height: a.height,
          createdAt: a.createdAt,
          usageCount: a.usageCount,
        })),
      }))

    // 2. Detect duplicate works by slug
    const allWorks = await prisma.work.findMany({
      select: {
        id: true,
        slug: true,
        year: true,
        createdAt: true,
        translations: {
          select: {
            locale: true,
            title: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            translations: {
              select: {
                locale: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Group by slug
    const worksBySlug = new Map<string, typeof allWorks>()
    for (const work of allWorks) {
      const existing = worksBySlug.get(work.slug) ?? []
      worksBySlug.set(work.slug, [...existing, work])
    }

    const duplicateWorksBySlug: DuplicateWork[] = Array.from(worksBySlug.entries())
      .filter(([, works]) => works.length > 1)
      .map(([slug, works]) => {
        // Check if all works are in the same category
        const categories = new Set(works.map((w) => w.category.id))
        const isSameCategory = categories.size === 1

        return {
          identifier: slug,
          type: 'slug' as const,
          count: works.length,
          severity: isSameCategory ? ('error' as const) : ('warning' as const),
          reason: isSameCategory
            ? 'Même slug dans la même catégorie - doublon critique'
            : 'Même slug dans différentes catégories - à vérifier',
          works,
        }
      })

    // Group by title (French)
    const worksByTitle = new Map<string, typeof allWorks>()
    for (const work of allWorks) {
      const frTitle = work.translations.find((t) => t.locale === 'fr')?.title
      if (frTitle) {
        const normalized = frTitle.toLowerCase().trim()
        const existing = worksByTitle.get(normalized) ?? []
        worksByTitle.set(normalized, [...existing, work])
      }
    }

    const duplicateWorksByTitle: DuplicateWork[] = Array.from(worksByTitle.entries())
      .filter(([, works]) => works.length > 1)
      .map(([title, works]) => {
        // Check if all works are in the same category
        const categories = new Set(works.map((w) => w.category.id))
        const isSameCategory = categories.size === 1

        return {
          identifier: title,
          type: 'title' as const,
          count: works.length,
          severity: isSameCategory ? ('warning' as const) : ('info' as const),
          reason: isSameCategory
            ? 'Même titre dans la même catégorie - potentiel doublon'
            : 'Même titre dans différentes catégories - normal, à surveiller',
          works,
        }
      })

    // 3. Detect duplicate artists by slug and integrity issues
    const allArtistsWithDetails = await prisma.artist.findMany({
      select: {
        id: true,
        slug: true,
        createdAt: true,
        imageId: true,
        translations: {
          select: {
            locale: true,
            name: true,
            bio: true,
          },
        },
        links: {
          select: {
            id: true,
          },
        },
      },
    })

    // Helper function to normalize names for comparison (remove accents, special chars)
    const normalizeForComparison = (str: string): string => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
    }

    // Map artists for duplicate detection (without bio for the response)
    const allArtists = allArtistsWithDetails.map((c) => ({
      id: c.id,
      slug: c.slug,
      createdAt: c.createdAt,
      translations: c.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
      })),
    }))

    // Group by slug
    const artistsBySlug = new Map<string, typeof allArtists>()
    for (const artist of allArtists) {
      const existing = artistsBySlug.get(artist.slug) ?? []
      artistsBySlug.set(artist.slug, [...existing, artist])
    }

    const duplicateArtistsBySlug: DuplicateArtist[] = Array.from(artistsBySlug.entries())
      .filter(([, artists]) => artists.length > 1)
      .map(([slug, artists]) => ({
        identifier: slug,
        type: 'slug' as const,
        count: artists.length,
        severity: 'error' as const,
        reason: 'Même slug - doublon critique à corriger',
        artists,
      }))

    // Group by exact name (French)
    const artistsByName = new Map<string, typeof allArtists>()
    for (const artist of allArtists) {
      const frName = artist.translations.find((t) => t.locale === 'fr')?.name
      if (frName) {
        const normalized = frName.toLowerCase().trim()
        const existing = artistsByName.get(normalized) ?? []
        artistsByName.set(normalized, [...existing, artist])
      }
    }

    const duplicateArtistsByName: DuplicateArtist[] = Array.from(artistsByName.entries())
      .filter(([, artists]) => artists.length > 1)
      .map(([name, artists]) => ({
        identifier: name,
        type: 'name' as const,
        count: artists.length,
        severity: 'warning' as const,
        reason: 'Même nom avec slug différent - potentiel doublon',
        artists,
      }))

    // Group by similar name (normalized - ignoring accents, special chars)
    const artistsBySimilarName = new Map<string, typeof allArtists>()
    for (const artist of allArtists) {
      const frName = artist.translations.find((t) => t.locale === 'fr')?.name
      if (frName) {
        const normalized = normalizeForComparison(frName)
        const existing = artistsBySimilarName.get(normalized) ?? []
        artistsBySimilarName.set(normalized, [...existing, artist])
      }
    }

    // Filter out groups that are already detected as exact name duplicates
    const exactNameKeys = new Set(
      Array.from(artistsByName.entries())
        .filter(([, artists]) => artists.length > 1)
        .map(([name]) => normalizeForComparison(name))
    )

    const duplicateArtistsBySimilarName: DuplicateArtist[] = Array.from(
      artistsBySimilarName.entries()
    )
      .filter(
        ([normalizedName, artists]) => artists.length > 1 && !exactNameKeys.has(normalizedName)
      )
      .map(([normalizedName, artists]) => ({
        identifier: normalizedName,
        type: 'similar' as const,
        count: artists.length,
        severity: 'info' as const,
        reason: 'Noms similaires (accents/caractères différents) - à vérifier manuellement',
        artists,
      }))

    // Detect integrity issues for artists
    const artistIntegrityIssues: ArtistIntegrityIssue[] = []

    for (const artist of allArtistsWithDetails) {
      const frTranslation = artist.translations.find((t) => t.locale === 'fr')
      const enTranslation = artist.translations.find((t) => t.locale === 'en')
      const name = frTranslation?.name ?? enTranslation?.name ?? artist.slug
      const hasBioFr = frTranslation?.bio && frTranslation.bio.trim().length > 0
      const hasBioEn = enTranslation?.bio && enTranslation.bio.trim().length > 0
      const hasPhoto = artist.imageId !== null
      const hasLinks = artist.links.length > 0

      // Check for missing bio
      if (!hasBioFr && !hasBioEn) {
        artistIntegrityIssues.push({
          id: artist.id,
          slug: artist.slug,
          name,
          issue: 'no_bio_both',
          severity: 'error',
          reason: 'Aucune biographie (ni FR, ni EN)',
          createdAt: artist.createdAt,
        })
      } else if (!hasBioFr) {
        artistIntegrityIssues.push({
          id: artist.id,
          slug: artist.slug,
          name,
          issue: 'no_bio_fr',
          severity: 'warning',
          reason: 'Biographie française manquante',
          createdAt: artist.createdAt,
        })
      } else if (!hasBioEn) {
        artistIntegrityIssues.push({
          id: artist.id,
          slug: artist.slug,
          name,
          issue: 'no_bio_en',
          severity: 'info',
          reason: 'Biographie anglaise manquante',
          createdAt: artist.createdAt,
        })
      }

      // Check for missing photo
      if (!hasPhoto) {
        artistIntegrityIssues.push({
          id: artist.id,
          slug: artist.slug,
          name,
          issue: 'no_photo',
          severity: 'warning',
          reason: 'Photo de profil manquante',
          createdAt: artist.createdAt,
        })
      }

      // Check for missing links
      if (!hasLinks) {
        artistIntegrityIssues.push({
          id: artist.id,
          slug: artist.slug,
          name,
          issue: 'no_links',
          severity: 'info',
          reason: 'Aucun lien externe (réseaux sociaux, site web)',
          createdAt: artist.createdAt,
        })
      }
    }

    // 4. Detect duplicate categories by slug
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        createdAt: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    })

    const categoriesBySlug = new Map<string, typeof allCategories>()
    for (const category of allCategories) {
      const existing = categoriesBySlug.get(category.slug) ?? []
      categoriesBySlug.set(category.slug, [...existing, category])
    }

    const duplicateCategoriesBySlug: DuplicateCategory[] = Array.from(categoriesBySlug.entries())
      .filter(([, categories]) => categories.length > 1)
      .map(([slug, categories]) => ({
        slug,
        count: categories.length,
        severity: 'error' as const,
        reason: 'Même slug - doublon critique à corriger',
        categories,
      }))

    // 5. Detect duplicate labels by slug
    const allLabels = await prisma.label.findMany({
      select: {
        id: true,
        slug: true,
        createdAt: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    })

    const labelsBySlug = new Map<string, typeof allLabels>()
    for (const label of allLabels) {
      const existing = labelsBySlug.get(label.slug) ?? []
      labelsBySlug.set(label.slug, [...existing, label])
    }

    const duplicateLabelsBySlug: DuplicateLabel[] = Array.from(labelsBySlug.entries())
      .filter(([, labels]) => labels.length > 1)
      .map(([slug, labels]) => ({
        slug,
        count: labels.length,
        severity: 'error' as const,
        reason: 'Même slug - doublon critique à corriger',
        labels,
      }))

    const response: DuplicatesResponse = {
      assets: {
        duplicatesByPath: duplicateAssetsByPath,
        unusedAssets,
        totalDuplicates: duplicateAssetsByPath.reduce((sum, d) => sum + d.count, 0),
        totalUnused: unusedAssets.length,
        totalErrors: duplicateAssetsByPath.filter((d) => d.severity === 'error').length,
        totalWarnings: 0,
        totalInfo: 0,
      },
      works: {
        duplicatesBySlug: duplicateWorksBySlug,
        duplicatesByTitle: duplicateWorksByTitle,
        totalDuplicates:
          duplicateWorksBySlug.reduce((sum, d) => sum + d.count, 0) +
          duplicateWorksByTitle.reduce((sum, d) => sum + d.count, 0),
        totalErrors:
          duplicateWorksBySlug.filter((d) => d.severity === 'error').length +
          duplicateWorksByTitle.filter((d) => d.severity === 'error').length,
        totalWarnings:
          duplicateWorksBySlug.filter((d) => d.severity === 'warning').length +
          duplicateWorksByTitle.filter((d) => d.severity === 'warning').length,
        totalInfo:
          duplicateWorksBySlug.filter((d) => d.severity === 'info').length +
          duplicateWorksByTitle.filter((d) => d.severity === 'info').length,
      },
      artists: {
        duplicatesBySlug: duplicateArtistsBySlug,
        duplicatesByName: duplicateArtistsByName,
        duplicatesBySimilarName: duplicateArtistsBySimilarName,
        integrityIssues: artistIntegrityIssues,
        totalDuplicates:
          duplicateArtistsBySlug.reduce((sum, d) => sum + d.count, 0) +
          duplicateArtistsByName.reduce((sum, d) => sum + d.count, 0) +
          duplicateArtistsBySimilarName.reduce((sum, d) => sum + d.count, 0),
        totalIntegrityIssues: artistIntegrityIssues.length,
        totalErrors:
          duplicateArtistsBySlug.filter((d) => d.severity === 'error').length +
          duplicateArtistsByName.filter((d) => d.severity === 'error').length +
          duplicateArtistsBySimilarName.filter((d) => d.severity === 'error').length +
          artistIntegrityIssues.filter((i) => i.severity === 'error').length,
        totalWarnings:
          duplicateArtistsBySlug.filter((d) => d.severity === 'warning').length +
          duplicateArtistsByName.filter((d) => d.severity === 'warning').length +
          duplicateArtistsBySimilarName.filter((d) => d.severity === 'warning').length +
          artistIntegrityIssues.filter((i) => i.severity === 'warning').length,
        totalInfo:
          duplicateArtistsBySlug.filter((d) => d.severity === 'info').length +
          duplicateArtistsByName.filter((d) => d.severity === 'info').length +
          duplicateArtistsBySimilarName.filter((d) => d.severity === 'info').length +
          artistIntegrityIssues.filter((i) => i.severity === 'info').length,
      },
      categories: {
        duplicatesBySlug: duplicateCategoriesBySlug,
        totalDuplicates: duplicateCategoriesBySlug.reduce((sum, d) => sum + d.count, 0),
        totalErrors: duplicateCategoriesBySlug.filter((d) => d.severity === 'error').length,
        totalWarnings: duplicateCategoriesBySlug.filter((d) => d.severity === 'warning').length,
        totalInfo: duplicateCategoriesBySlug.filter((d) => d.severity === 'info').length,
      },
      labels: {
        duplicatesBySlug: duplicateLabelsBySlug,
        totalDuplicates: duplicateLabelsBySlug.reduce((sum, d) => sum + d.count, 0),
        totalErrors: duplicateLabelsBySlug.filter((d) => d.severity === 'error').length,
        totalWarnings: duplicateLabelsBySlug.filter((d) => d.severity === 'warning').length,
        totalInfo: duplicateLabelsBySlug.filter((d) => d.severity === 'info').length,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error detecting duplicates', error)
    return NextResponse.json({ error: 'Failed to detect duplicates' }, { status: 500 })
  }
})
