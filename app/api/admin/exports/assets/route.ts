import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { prisma } from "@/lib/prisma";
import {
  recordSuccessfulExport,
  recordFailedExport,
} from "@/lib/export-history";

// GET /api/admin/exports/assets - Export assets
export const GET = withAuth(async (request) => {
  const userId = request.headers.get("x-user-id") ?? "system";

  try {
    const assets = await prisma.asset.findMany({
      include: {
        workImages: { select: { id: true, slug: true } },
        workCover: { select: { id: true, slug: true } },
        categoryImages: { select: { id: true, slug: true } },
        labelImages: { select: { id: true, slug: true } },
        composerImages: { select: { id: true, slug: true } },
        expertiseImages: { select: { id: true, slug: true } },
        expertiseCover: { select: { id: true, slug: true } },
      },
    });

    const data = {
      assets,
      exportedAt: new Date().toISOString(),
      count: assets.length,
    };

    await recordSuccessfulExport({
      userId,
      type: "ASSETS",
      format: "JSON",
      entityCount: assets.length,
      data,
    });

    return NextResponse.json(data);
  } catch (error) {
    await recordFailedExport({
      userId,
      type: "ASSETS",
      format: "JSON",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    console.error("Error exporting assets:", error);
    return NextResponse.json(
      { error: "Failed to export assets" },
      { status: 500 },
    );
  }
});
