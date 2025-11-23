import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";
import { logger } from "@/lib/logger";

// GET /api/admin/projects/[id]/versions - Get version history for a project
export const GET = withAuth(async (request, context) => {
  const params = await context.params;
  if (!params?.id) {
    return NextResponse.json({ error: "Invalid work ID" }, { status: 400 });
  }
  const id = params.id;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "20");

  try {
    // Check if work exists
    const work = await prisma.work.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!work) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    // Get versions
    const versions = await prisma.workVersion.findMany({
      where: { workId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ versions });
  } catch (error) {
    logger.error("Error fetching work versions", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 },
    );
  }
});

// POST /api/admin/projects/[id]/versions/restore - Restore a specific version
export const POST = withAuth(async (request, context) => {
  const params = await context.params;
  if (!params?.id) {
    return NextResponse.json({ error: "Invalid work ID" }, { status: 400 });
  }
  const id = params.id;
  const body = (await request.json()) as { versionId: string };
  const { versionId } = body;

  try {
    // Get the version
    const version = await prisma.workVersion.findUnique({
      where: { id: versionId },
      include: {
        work: true,
      },
    });

    if (!version || version.workId !== id) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Restore the work from snapshot
    const snapshot = version.snapshot as {
      slug?: string;
      categoryId?: string | null;
      labelId?: string | null;
      year?: number | null;
      status?: string;
      // ... other fields
    };

    await prisma.work.update({
      where: { id },
      data: {
        ...(snapshot.slug && { slug: snapshot.slug }),
        categoryId: snapshot.categoryId ?? undefined,
        labelId: snapshot.labelId ?? undefined,
        year: snapshot.year ?? undefined,
        status: snapshot.status as
          | "DRAFT"
          | "PUBLISHED"
          | "ARCHIVED"
          | undefined,
        // Add other fields as needed
      },
    });

    return NextResponse.json({
      success: true,
      message: "Version restored successfully",
    });
  } catch (error) {
    logger.error("Error restoring work version", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 },
    );
  }
});
