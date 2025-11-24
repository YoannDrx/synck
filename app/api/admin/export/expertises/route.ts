import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flattenForExport } from "@/lib/export";
import { withAuth } from "@/lib/api/with-auth";
import { createAuditLog } from "@/lib/audit-log";
import { recordSuccessfulExport } from "@/lib/export-history";

export const GET = withAuth(async (req, _context, user) => {
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

    // Enregistrer l'export dans l'historique
    let exportFormat: "JSON" | "CSV" | "TXT" | "XLS" = "JSON";
    const formatLower = format.toLowerCase();
    if (formatLower === "csv") exportFormat = "CSV";
    else if (formatLower === "txt") exportFormat = "TXT";
    else if (formatLower === "xls" || formatLower === "xlsx")
      exportFormat = "XLS";

    await recordSuccessfulExport({
      userId: user.id,
      type: "EXPERTISES",
      format: exportFormat,
      entityCount: finalData.length,
      data: finalData,
    });

    await createAuditLog({
      userId: user.id,
      action: "EXPORT",
      entityType: "Expertise",
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
      entityType: "Expertise",
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
