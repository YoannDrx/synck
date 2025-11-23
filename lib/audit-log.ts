import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
  userAgent,
}: {
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ?? null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.error("Failed to create audit log", error);
  }
}
