import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";
import { ApiError } from "@/lib/api/error-handler";

export const DELETE = withAuth(async (_req, context) => {
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

  return NextResponse.json({ success: true });
});
