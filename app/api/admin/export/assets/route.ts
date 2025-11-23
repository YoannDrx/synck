import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flattenForExport } from "@/lib/export";
import { withAuth } from "@/lib/api/with-auth";
import { createAuditLog } from "@/lib/audit-log";

export const GET = withAuth(async (req, _context, user) => {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";
  const orphansOnly = searchParams.get("orphansOnly") === "true";

  try {
    const assets = await prisma.asset.findMany({
      include: {
        _count: {
          select: {
            workImages: true,
            workCover: true,
            categoryImages: true,
            labelImages: true,
            composerImages: true,
            expertiseImages: true,
            expertiseCover: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filteredAssets = assets;

    if (orphansOnly) {
      filteredAssets = assets.filter(
        (asset) =>
          asset._count.workImages === 0 &&
          asset._count.workCover === 0 &&
          asset._count.categoryImages === 0 &&
          asset._count.labelImages === 0 &&
          asset._count.composerImages === 0 &&
          asset._count.expertiseImages === 0 &&
          asset._count.expertiseCover === 0,
      );
    }

    const exportData = filteredAssets.map((asset) => {
      const totalUsage =
        asset._count.workImages +
        asset._count.workCover +
        asset._count.categoryImages +
        asset._count.labelImages +
        asset._count.composerImages +
        asset._count.expertiseImages +
        asset._count.expertiseCover;

      return {
        id: asset.id,
        path: asset.path,
        alt: asset.alt ?? "",
        width: asset.width ?? "",
        height: asset.height ?? "",
        aspectRatio: asset.aspectRatio ?? "",
        hasBlurDataUrl: !!asset.blurDataUrl,
        totalUsage,
        workImagesCount: asset._count.workImages,
        workCoverCount: asset._count.workCover,
        categoryImagesCount: asset._count.categoryImages,
        labelImagesCount: asset._count.labelImages,
        composerImagesCount: asset._count.composerImages,
        expertiseImagesCount: asset._count.expertiseImages,
        expertiseCoverCount: asset._count.expertiseCover,
        isOrphan: totalUsage === 0,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
      };
    });

    const finalData =
      format === "csv" || format === "xlsx"
        ? flattenForExport(exportData)
        : exportData;

    await createAuditLog({
      userId: user.id,
      action: "EXPORT",
      entityType: "Asset",
      metadata: {
        format,
        count: finalData.length,
        orphansOnly,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({
      data: finalData,
      count: finalData.length,
      format,
    });
  } catch (error) {
    await createAuditLog({
      userId: user.id,
      action: "EXPORT",
      entityType: "Asset",
      metadata: {
        format,
        status: "failed",
        orphansOnly,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 },
    );
  }
});
