import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";
import { ApiError } from "@/lib/api/error-handler";
import { createAuditLog } from "@/lib/audit-log";

export const DELETE = withAuth(async (req, context, user) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }

  const { id } = await context.params;

  const asset = await prisma.asset.findUnique({
    where: { id },
  });

  if (!asset) {
    throw new ApiError(404, "Asset non trouvé", "NOT_FOUND");
  }

  // Delete asset (cascade will handle relations)
  await prisma.asset.delete({
    where: { id },
  });

  // Audit log
  await createAuditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "Asset",
    entityId: id,
    metadata: {
      path: asset.path,
      width: asset.width,
      height: asset.height,
    },
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ success: true });
});
