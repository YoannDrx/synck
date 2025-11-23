import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flattenForExport } from "@/lib/export";
import { withAuth } from "@/lib/api/with-auth";
import { createAuditLog } from "@/lib/audit-log";

export const GET = withAuth(async (req, _context, user) => {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";

  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: true,
        coverImage: true,
        _count: {
          select: {
            works: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const exportData = categories.map((category) => {
      const frTrans = category.translations.find((t) => t.locale === "fr");
      const enTrans = category.translations.find((t) => t.locale === "en");

      return {
        id: category.id,
        slug: category.slug,
        nameFr: frTrans?.name ?? "",
        nameEn: enTrans?.name ?? "",
        descriptionFr: frTrans?.description ?? "",
        descriptionEn: enTrans?.description ?? "",
        color: category.color ?? "",
        icon: category.icon ?? "",
        coverImagePath: category.coverImage?.path ?? "",
        worksCount: category._count.works,
        order: category.order,
        isActive: category.isActive,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      };
    });

    const finalData =
      format === "csv" || format === "xlsx"
        ? flattenForExport(exportData)
        : exportData;

    await createAuditLog({
      userId: user.id,
      action: "EXPORT",
      entityType: "Category",
      metadata: {
        format,
        count: finalData.length,
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
      entityType: "Category",
      metadata: {
        format,
        status: "failed",
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
