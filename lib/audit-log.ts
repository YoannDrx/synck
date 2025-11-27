import type { Prisma } from '@prisma/client'

import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}: {
  userId: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Prisma.InputJsonValue
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    logger.error('Failed to create audit log', error)
  }
}
