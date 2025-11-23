import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flattenForExport } from "@/lib/export";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (req) => {
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
