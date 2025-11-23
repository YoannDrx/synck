import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flattenForExport } from "@/lib/export";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";

  try {
    const expertises = await prisma.expertise.findMany({
      include: {
        translations: true,
        coverImage: true,
        images: true,
      },
      orderBy: { order: "asc" },
    });

    const exportData = expertises.map((expertise) => {
      const frTrans = expertise.translations.find((t) => t.locale === "fr");
      const enTrans = expertise.translations.find((t) => t.locale === "en");

      return {
        id: expertise.id,
        slug: expertise.slug,
        titleFr: frTrans?.title ?? "",
        titleEn: enTrans?.title ?? "",
        subtitleFr: frTrans?.subtitle ?? "",
        subtitleEn: enTrans?.subtitle ?? "",
        descriptionFr: frTrans?.description ?? "",
        descriptionEn: enTrans?.description ?? "",
        contentFr: frTrans?.content ?? "",
        contentEn: enTrans?.content ?? "",
        coverImagePath: expertise.coverImage?.path ?? "",
        imagesCount: expertise.images.length,
        order: expertise.order,
        isActive: expertise.isActive,
        createdAt: expertise.createdAt.toISOString(),
        updatedAt: expertise.updatedAt.toISOString(),
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
