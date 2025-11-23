import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flattenForExport } from "@/lib/export";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";

  try {
    const labels = await prisma.label.findMany({
      include: {
        translations: true,
        image: true,
        _count: {
          select: {
            works: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const exportData = labels.map((label) => {
      const frTrans = label.translations.find((t) => t.locale === "fr");
      const enTrans = label.translations.find((t) => t.locale === "en");

      return {
        id: label.id,
        slug: label.slug,
        nameFr: frTrans?.name ?? "",
        nameEn: enTrans?.name ?? "",
        descriptionFr: frTrans?.description ?? "",
        descriptionEn: enTrans?.description ?? "",
        imagePath: label.image?.path ?? "",
        website: label.website ?? "",
        worksCount: label._count.works,
        order: label.order,
        isActive: label.isActive,
        createdAt: label.createdAt.toISOString(),
        updatedAt: label.updatedAt.toISOString(),
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
