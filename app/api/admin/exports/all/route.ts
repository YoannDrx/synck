import { NextResponse } from 'next/server'

import { withAuth } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { recordFailedExport, recordSuccessfulExport } from '@/lib/export-history'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exports/all - Export all data
export const GET = withAuth(async (request, _context, user) => {
  try {
    // Fetch all data
    const [assets, works, artists, categories, labels, expertises] = await Promise.all([
      prisma.asset.findMany({
        include: {
          workImages: { select: { id: true, slug: true } },
          workCover: { select: { id: true, slug: true } },
          categoryImages: { select: { id: true, slug: true } },
          labelImages: { select: { id: true, slug: true } },
          artistImages: { select: { id: true, slug: true } },
          expertiseImages: { select: { id: true, slug: true } },
          expertiseCover: { select: { id: true, slug: true } },
        },
      }),
      prisma.work.findMany({
        include: {
          translations: true,
          category: { include: { translations: true } },
          label: { include: { translations: true } },
          coverImage: true,
          images: true,
          contributions: {
            include: {
              artist: { include: { translations: true } },
            },
          },
        },
      }),
      prisma.artist.findMany({
        include: {
          translations: true,
          image: true,
          links: true,
          contributions: {
            include: {
              work: {
                select: { id: true, slug: true, translations: true },
              },
            },
          },
        },
      }),
      prisma.category.findMany({
        include: {
          translations: true,
          coverImage: true,
        },
      }),
      prisma.label.findMany({
        include: {
          translations: true,
          image: true,
        },
      }),
      prisma.expertise.findMany({
        include: {
          translations: true,
          coverImage: true,
          images: true,
        },
      }),
    ])

    const data = {
      assets,
      works,
      artists,
      categories,
      labels,
      expertises,
      exportedAt: new Date().toISOString(),
      totalEntities: {
        assets: assets.length,
        works: works.length,
        artists: artists.length,
        categories: categories.length,
        labels: labels.length,
        expertises: expertises.length,
      },
    }

    const totalCount =
      assets.length +
      works.length +
      artists.length +
      categories.length +
      labels.length +
      expertises.length

    // Record export in history
    await recordSuccessfulExport({
      userId: user.id,
      type: 'ALL',
      format: 'JSON',
      entityCount: totalCount,
      data,
    })

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'All',
      metadata: {
        type: 'ALL',
        format: 'JSON',
        entityCount: totalCount,
        breakdown: {
          assets: assets.length,
          works: works.length,
          artists: artists.length,
          categories: categories.length,
          labels: labels.length,
          expertises: expertises.length,
        },
      },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json(data)
  } catch (error) {
    // Record failed export
    await recordFailedExport({
      userId: user.id,
      type: 'ALL',
      format: 'JSON',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
})
