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
    const labels = await prisma.label.findMany({
      include: {
        translations: true,
        image: true,
        _count: {
          select: {
            works: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    const exportData = labels.map((label) => {
      const frTrans = label.translations.find((t) => t.locale === 'fr')
      const enTrans = label.translations.find((t) => t.locale === 'en')

      return {
        id: label.id,
        slug: label.slug,
        nameFr: frTrans?.name ?? '',
        nameEn: enTrans?.name ?? '',
        descriptionFr: frTrans?.description ?? '',
        descriptionEn: enTrans?.description ?? '',
        imagePath: label.image?.path ?? '',
        website: label.website ?? '',
        worksCount: label._count.works,
        order: label.order,
        isActive: label.isActive,
        createdAt: label.createdAt.toISOString(),
        updatedAt: label.updatedAt.toISOString(),
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
      type: 'LABELS',
      format: exportFormat,
      entityCount: finalData.length,
      data: finalData,
    })

    await createAuditLog({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'Label',
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
      entityType: 'Label',
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
