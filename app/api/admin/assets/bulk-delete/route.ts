import { NextResponse } from 'next/server'

import { del } from '@vercel/blob'
import { z } from 'zod'

import { withAuthAndValidation } from '@/lib/api/with-auth'
import { createAuditLog } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

export const POST = withAuthAndValidation(bulkDeleteSchema, async (req, _context, user, data) => {
  try {
    // Fetch assets to get their paths for Vercel Blob deletion
    const assets = await prisma.asset.findMany({
      where: {
        id: { in: data.ids },
      },
      select: {
        id: true,
        path: true,
      },
    })

    // Delete from Vercel Blob
    await Promise.all(
      assets.map(async (asset) => {
        try {
          await del(asset.path)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to delete blob ${asset.path}:`, error)
          // Continue even if blob deletion fails
        }
      })
    )

    // Delete from database
    await prisma.asset.deleteMany({
      where: {
        id: { in: data.ids },
      },
    })

    // Audit log - log bulk delete action
    await createAuditLog({
      userId: user.id,
      action: 'BULK_DELETE',
      entityType: 'Asset',
      entityId: 'bulk',
      metadata: {
        deletedCount: assets.length,
        deletedIds: assets.map((a) => a.id),
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    })

    return NextResponse.json({
      success: true,
      deleted: assets.length,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Bulk delete error:', error)
    return NextResponse.json({ error: 'Failed to delete assets' }, { status: 500 })
  }
})
