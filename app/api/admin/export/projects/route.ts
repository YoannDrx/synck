import { NextResponse } from 'next/server'

import type { Prisma } from '@prisma/client'

import { withAuth } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { flattenForExport } from '@/lib/export'
import { recordSuccessfulExport } from '@/lib/export-history'
import { prisma } from '@/lib/prisma'

export const GET = withAuth(async (req, _context, user) => {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'json'
  const categoryId = searchParams.get('categoryId')
  const labelId = searchParams.get('labelId')
  const status = searchParams.get('status')

  try {
    // Construire le where dynamiquement
    const where: Prisma.WorkWhereInput = {}

    if (categoryId) where.categoryId = categoryId
    if (labelId) where.labelId = labelId
    if (status) where.status = status

    // Récupérer tous les projets avec relations
    const works = await prisma.work.findMany({
      where,
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
        label: {
          include: {
            translations: true,
          },
        },
        contributions: {
          include: {
            artist: {
              include: {
                translations: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        coverImage: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Transformer les données pour l'export
    const exportData = works.map((work) => {
      const frTrans = work.translations.find((t) => t.locale === 'fr')
      const enTrans = work.translations.find((t) => t.locale === 'en')
      const categoryFr = work.category.translations.find((t) => t.locale === 'fr')
      const categoryEn = work.category.translations.find((t) => t.locale === 'en')
      const labelFr = work.label?.translations.find((t) => t.locale === 'fr')
      const labelEn = work.label?.translations.find((t) => t.locale === 'en')

      return {
        id: work.id,
        slug: work.slug,
        titleFr: frTrans?.title ?? '',
        titleEn: enTrans?.title ?? '',
        subtitleFr: frTrans?.subtitle ?? '',
        subtitleEn: enTrans?.subtitle ?? '',
        descriptionFr: frTrans?.description ?? '',
        descriptionEn: enTrans?.description ?? '',
        roleFr: frTrans?.role ?? '',
        roleEn: enTrans?.role ?? '',
        year: work.year ?? '',
        genre: work.genre ?? '',
        releaseDate: work.releaseDate ?? '',
        spotifyUrl: work.spotifyUrl ?? '',
        youtubeUrl: work.youtubeUrl ?? '',
        externalUrl: work.externalUrl ?? '',
        status: work.status ?? '',
        isActive: work.isActive,
        isFeatured: work.isFeatured,
        order: work.order,
        categoryId: work.category.id,
        categorySlug: work.category.slug,
        categoryFr: categoryFr?.name ?? '',
        categoryEn: categoryEn?.name ?? '',
        labelId: work.label?.id ?? '',
        labelSlug: work.label?.slug ?? '',
        labelFr: labelFr?.name ?? '',
        labelEn: labelEn?.name ?? '',
        artists: work.contributions
          .map((c) => {
            const artistFr = c.artist.translations.find((t) => t.locale === 'fr')
            const artistEn = c.artist.translations.find((t) => t.locale === 'en')
            return artistFr?.name ?? artistEn?.name ?? ''
          })
          .filter(Boolean)
          .join(', '),
        artistRoles: work.contributions
          .map((c) => c.role ?? '')
          .filter(Boolean)
          .join(', '),
        coverImagePath: work.coverImage?.path ?? '',
        imagesCount: work.images.length,
        createdAt: work.createdAt.toISOString(),
        updatedAt: work.updatedAt.toISOString(),
      }
    })

    // Flatten pour CSV/Excel si nécessaire
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
      type: 'WORKS',
      format: exportFormat,
      entityCount: finalData.length,
      data: finalData,
    })

    await createAuditLog({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'Work',
      metadata: {
        format,
        count: finalData.length,
        filters: { categoryId, labelId, status },
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    // Retourner les données brutes (le client gère la génération du fichier)
    return NextResponse.json({
      data: finalData,
      count: finalData.length,
      format,
    })
  } catch (error) {
    await createAuditLog({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'Work',
      metadata: {
        format,
        status: 'failed',
        filters: { categoryId, labelId, status },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 })
  }
})
