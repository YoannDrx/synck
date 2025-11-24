import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// GET /api/admin/exports/history - Get export history
export const GET = withAuth(async () => {
  try {
    const history = await prisma.exportHistory.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 exports
    });

    return NextResponse.json(history);
  } catch (error) {
    logger.error("Error fetching export history", error);
    return NextResponse.json(
      { error: "Failed to fetch export history" },
      { status: 500 },
    );
  }
});
