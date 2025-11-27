import { NextResponse } from 'next/server'

import { withAuth } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { flattenForExport } from '@/lib/export'
import { recordSuccessfulExport } from '@/lib/export-history'
import { prisma } from '@/lib/prisma'

export const GET = withAuth(async (req, _context, user) => {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'json'

  try {
    const artists = await prisma.artist.findMany({
      include: {
        translations: true,
        image: true,
        links: true,
        contributions: {
          include: {
            work: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const exportData = artists.map((artist) => {
      const frTrans = artist.translations.find((t) => t.locale === 'fr')
      const enTrans = artist.translations.find((t) => t.locale === 'en')

      return {
        id: artist.id,
        slug: artist.slug,
        nameFr: frTrans?.name ?? '',
        nameEn: enTrans?.name ?? '',
        bioFr: frTrans?.bio ?? '',
        bioEn: enTrans?.bio ?? '',
        imagePath: artist.image?.path ?? '',
        linksCount: artist.links.length,
        links: artist.links.map((link) => `${link.platform}: ${link.url}`).join('; '),
        projectsCount: artist.contributions.length,
        projects: artist.contributions
          .map((c) => {
            const workFr = c.work.translations.find((t) => t.locale === 'fr')
            const workEn = c.work.translations.find((t) => t.locale === 'en')
            return workFr?.title ?? workEn?.title ?? ''
          })
          .filter(Boolean)
          .join(', '),
        order: artist.order,
        isActive: artist.isActive,
        createdAt: artist.createdAt.toISOString(),
        updatedAt: artist.updatedAt.toISOString(),
      }
    })

    const finalData =
      format === 'csv' || format === 'xlsx' ? flattenForExport(exportData) : exportData

    // Enregistrer l'export dans l'historique
    let exportFormat: 'JSON' | 'CSV' | 'TXT' | 'XLS' = 'JSON'
    const formatLower = format.toLowerCase()
    if (formatLower === 'csv') exportFormat = 'CSV'
    else if (formatLower === 'txt') exportFormat = 'TXT'
    else if (formatLower === 'xls' || formatLower === 'xlsx') exportFormat = 'XLS'

    await recordSuccessfulExport({
      userId: user.id,
      type: 'ARTISTS',
      format: exportFormat,
      entityCount: finalData.length,
      data: finalData,
    })

    await createAuditLog({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'Artist',
      metadata: {
        format,
        count: finalData.length,
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json({
      data: finalData,
      count: finalData.length,
      format,
    })
  } catch (error) {
    await createAuditLog({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'Artist',
      metadata: {
        format,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
})
