import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flattenForExport } from "@/lib/export";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (req) => {
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

    return NextResponse.json({
      data: finalData,
      count: finalData.length,
      format,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 },
    );
  }
});
