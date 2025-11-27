import { NextResponse } from 'next/server'

import { withAuth } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { recordFailedExport, recordSuccessfulExport } from '@/lib/export-history'
import { prisma } from '@/lib/prisma'

// GET /api/admin/exports/assets - Export assets
export const GET = withAuth(async (request, _context, user) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        workImages: { select: { id: true, slug: true } },
        workCover: { select: { id: true, slug: true } },
        categoryImages: { select: { id: true, slug: true } },
        labelImages: { select: { id: true, slug: true } },
        artistImages: { select: { id: true, slug: true } },
        expertiseImages: { select: { id: true, slug: true } },
        expertiseCover: { select: { id: true, slug: true } },
      },
    })

    const data = {
      assets,
      exportedAt: new Date().toISOString(),
      count: assets.length,
    }

    await recordSuccessfulExport({
      userId: user.id,
      type: 'ASSETS',
      format: 'JSON',
      entityCount: assets.length,
      data,
    })

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'EXPORT',
      entityType: 'Asset',
      metadata: {
        type: 'ASSETS',
        format: 'JSON',
        entityCount: assets.length,
      },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json(data)
  } catch (error) {
    await recordFailedExport({
      userId: user.id,
      type: 'ASSETS',
      format: 'JSON',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json({ error: 'Failed to export assets' }, { status: 500 })
  }
})
