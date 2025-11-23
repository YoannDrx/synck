import { prisma } from "@/lib/prisma";
import type { ExportType, ExportFormat, ExportStatus } from "@prisma/client";

type CreateExportHistoryParams = {
  userId: string;
  type: ExportType;
  format: ExportFormat;
  entityCount?: number;
  fileSize?: number;
};

type UpdateExportHistoryParams = {
  status: ExportStatus;
  entityCount?: number;
  fileSize?: number;
  errorMessage?: string;
  downloadUrl?: string;
};

/**
 * Crée une entrée dans l'historique des exports
 */
export async function createExportHistory(params: CreateExportHistoryParams) {
  return prisma.exportHistory.create({
    data: {
      userId: params.userId,
      type: params.type,
      format: params.format,
      entityCount: params.entityCount,
      fileSize: params.fileSize,
      status: "PENDING",
    },
  });
}

/**
 * Met à jour une entrée dans l'historique des exports
 */
export async function updateExportHistory(
  id: string,
  params: UpdateExportHistoryParams,
) {
  return prisma.exportHistory.update({
    where: { id },
    data: {
      status: params.status,
      entityCount: params.entityCount,
      fileSize: params.fileSize,
      errorMessage: params.errorMessage,
      downloadUrl: params.downloadUrl,
      completedAt: params.status === "COMPLETED" ? new Date() : undefined,
    },
  });
}

/**
 * Enregistre un export réussi directement (pour les exports simples)
 */
export async function recordSuccessfulExport(
  params: CreateExportHistoryParams & { data: unknown },
) {
  const dataStr = JSON.stringify(params.data);
  const fileSize = Buffer.byteLength(dataStr, "utf8");

  return prisma.exportHistory.create({
    data: {
      userId: params.userId,
      type: params.type,
      format: params.format,
      entityCount: params.entityCount,
      fileSize,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}

/**
 * Enregistre un export échoué
 */
export async function recordFailedExport(
  params: CreateExportHistoryParams & { error: string },
) {
  return prisma.exportHistory.create({
    data: {
      userId: params.userId,
      type: params.type,
      format: params.format,
      status: "FAILED",
      errorMessage: params.error,
      completedAt: new Date(),
    },
  });
}
