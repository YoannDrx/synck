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
    const composers = await prisma.composer.findMany({
      include: {
        translations: true,
        image: true,
        links: true,
        contributions: {
          include: {
            work: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const exportData = composers.map((composer) => {
      const frTrans = composer.translations.find((t) => t.locale === "fr");
      const enTrans = composer.translations.find((t) => t.locale === "en");

      return {
        id: composer.id,
        slug: composer.slug,
        nameFr: frTrans?.name ?? "",
        nameEn: enTrans?.name ?? "",
        bioFr: frTrans?.bio ?? "",
        bioEn: enTrans?.bio ?? "",
        imagePath: composer.image?.path ?? "",
        externalUrl: composer.externalUrl ?? "",
        linksCount: composer.links.length,
        links: composer.links
          .map((link) => `${link.platform}: ${link.url}`)
          .join("; "),
        projectsCount: composer.contributions.length,
        projects: composer.contributions
          .map((c) => {
            const workFr = c.work.translations.find((t) => t.locale === "fr");
            const workEn = c.work.translations.find((t) => t.locale === "en");
            return workFr?.title ?? workEn?.title ?? "";
          })
          .filter(Boolean)
          .join(", "),
        order: composer.order,
        isActive: composer.isActive,
        createdAt: composer.createdAt.toISOString(),
        updatedAt: composer.updatedAt.toISOString(),
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
      type: "COMPOSERS",
      format: exportFormat,
      entityCount: finalData.length,
      data: finalData,
    });

    await createAuditLog({
      userId: user.id,
      action: "EXPORT",
      entityType: "Composer",
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
      entityType: "Composer",
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
