import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { prisma } from "@/lib/prisma";
import {
  recordSuccessfulExport,
  recordFailedExport,
} from "@/lib/export-history";
import { createAuditLog } from "@/lib/audit-log";

// GET /api/admin/exports/works - Export works
export const GET = withAuth(async (request, _context, user) => {
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
      userId: user.id,
      type: "WORKS",
      format: "JSON",
      entityCount: works.length,
      data,
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: "EXPORT",
      entityType: "Work",
      metadata: {
        type: "WORKS",
        format: "JSON",
        entityCount: works.length,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    await recordFailedExport({
      userId: user.id,
      type: "WORKS",
      format: "JSON",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Failed to export works" },
      { status: 500 },
    );
  }
});
