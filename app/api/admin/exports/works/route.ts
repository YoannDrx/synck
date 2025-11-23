import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { prisma } from "@/lib/prisma";
import {
  recordSuccessfulExport,
  recordFailedExport,
} from "@/lib/export-history";

// GET /api/admin/exports/works - Export works
export const GET = withAuth(async (request) => {
  const userId = request.headers.get("x-user-id") ?? "system";

  try {
    const works = await prisma.work.findMany({
      include: {
        translations: true,
        category: { include: { translations: true } },
        label: { include: { translations: true } },
        coverImage: true,
        images: true,
        contributions: {
          include: {
            composer: { include: { translations: true } },
          },
        },
      },
    });

    const data = {
      works,
      exportedAt: new Date().toISOString(),
      count: works.length,
    };

    await recordSuccessfulExport({
      userId,
      type: "WORKS",
      format: "JSON",
      entityCount: works.length,
      data,
    });

    return NextResponse.json(data);
  } catch (error) {
    await recordFailedExport({
      userId,
      type: "WORKS",
      format: "JSON",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    console.error("Error exporting works:", error);
    return NextResponse.json(
      { error: "Failed to export works" },
      { status: 500 },
    );
  }
});
