import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/exports/history/[id] - Get export data by ID
export const GET = withAuth(async (_req, context) => {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Export ID is required" },
        { status: 400 },
      );
    }

    const exportHistory = await prisma.exportHistory.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        format: true,
        status: true,
        data: true,
        createdAt: true,
      },
    });

    if (!exportHistory) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }

    if (exportHistory.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Export is not completed" },
        { status: 400 },
      );
    }

    if (!exportHistory.data) {
      return NextResponse.json(
        { error: "Export data not available" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: exportHistory.id,
      type: exportHistory.type,
      format: exportHistory.format,
      data: exportHistory.data,
      createdAt: exportHistory.createdAt,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching export data:", error);
    return NextResponse.json(
      { error: "Failed to fetch export data" },
      { status: 500 },
    );
  }
});
