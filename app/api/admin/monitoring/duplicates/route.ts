import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import { prisma } from "@/lib/prisma";

type Severity = "error" | "warning" | "info";

type DuplicateAsset = {
  path: string;
  count: number;
  severity: Severity;
  reason: string;
  assets: {
    id: string;
    path: string;
    alt: string | null;
    width: number | null;
    height: number | null;
    createdAt: Date;
    usageCount: number;
  }[];
};

type DuplicateWork = {
  identifier: string;
  type: "slug" | "title";
  count: number;
  severity: Severity;
  reason: string;
  works: {
    id: string;
    slug: string;
    translations: {
      locale: string;
      title: string;
    }[];
    category: {
      id: string;
      slug: string;
      translations: {
        locale: string;
        name: string;
      }[];
    };
    year: number | null;
    createdAt: Date;
  }[];
};

type DuplicateComposer = {
  identifier: string;
  type: "slug" | "name";
  count: number;
  severity: Severity;
  reason: string;
  composers: {
    id: string;
    slug: string;
    translations: {
      locale: string;
      name: string;
    }[];
    createdAt: Date;
  }[];
};

type DuplicateCategory = {
  slug: string;
  count: number;
  severity: Severity;
  reason: string;
  categories: {
    id: string;
    slug: string;
    translations: {
      locale: string;
      name: string;
    }[];
    createdAt: Date;
  }[];
};

type DuplicateLabel = {
  slug: string;
  count: number;
  severity: Severity;
  reason: string;
  labels: {
    id: string;
    slug: string;
    translations: {
      locale: string;
      name: string;
    }[];
    createdAt: Date;
  }[];
};

type UnusedAsset = {
  id: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
};

type DuplicatesResponse = {
  assets: {
    duplicatesByPath: DuplicateAsset[];
    unusedAssets: UnusedAsset[];
    totalDuplicates: number;
    totalUnused: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
  };
  works: {
    duplicatesBySlug: DuplicateWork[];
    duplicatesByTitle: DuplicateWork[];
    totalDuplicates: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
  };
  composers: {
    duplicatesBySlug: DuplicateComposer[];
    duplicatesByName: DuplicateComposer[];
    totalDuplicates: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
  };
  categories: {
    duplicatesBySlug: DuplicateCategory[];
    totalDuplicates: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
  };
  labels: {
    duplicatesBySlug: DuplicateLabel[];
    totalDuplicates: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
  };
};

// GET /api/admin/monitoring/duplicates - Detect duplicates across entities
export const GET = withAuth(async () => {
  try {
    // 1. Detect duplicate assets by path
    const allAssets = await prisma.asset.findMany({
      select: {
        id: true,
        path: true,
        alt: true,
        width: true,
        height: true,
        createdAt: true,
        workImages: { select: { id: true } },
        workCover: { select: { id: true } },
        categoryImages: { select: { id: true } },
        labelImages: { select: { id: true } },
        composerImages: { select: { id: true } },
        expertiseImages: { select: { id: true } },
        expertiseCover: { select: { id: true } },
      },
    });

    // Group by path
    const assetsByPath = new Map<
      string,
      ((typeof allAssets)[0] & { usageCount: number })[]
    >();
    const unusedAssets: UnusedAsset[] = [];

    for (const asset of allAssets) {
      const usageCount =
        asset.workImages.length +
        asset.workCover.length +
        asset.categoryImages.length +
        asset.labelImages.length +
        asset.composerImages.length +
        asset.expertiseImages.length +
        asset.expertiseCover.length;

      if (usageCount === 0) {
        unusedAssets.push({
          id: asset.id,
          path: asset.path,
          alt: asset.alt,
          width: asset.width,
          height: asset.height,
          createdAt: asset.createdAt,
        });
      }

      const existing = assetsByPath.get(asset.path) ?? [];
      assetsByPath.set(asset.path, [
        ...existing,
        {
          ...asset,
          usageCount,
        },
      ]);
    }

    const duplicateAssetsByPath: DuplicateAsset[] = Array.from(
      assetsByPath.entries(),
    )
      .filter(([, assets]) => assets.length > 1)
      .map(([path, assets]) => ({
        path,
        count: assets.length,
        severity: "error" as const,
        reason: "Même chemin d'accès - doublons à supprimer",
        assets: assets.map((a) => ({
          id: a.id,
          path: a.path,
          alt: a.alt,
          width: a.width,
          height: a.height,
          createdAt: a.createdAt,
          usageCount: a.usageCount,
        })),
      }));

    // 2. Detect duplicate works by slug
    const allWorks = await prisma.work.findMany({
      select: {
        id: true,
        slug: true,
        year: true,
        createdAt: true,
        translations: {
          select: {
            locale: true,
            title: true,
          },
        },
        category: {
          select: {
            id: true,
            slug: true,
            translations: {
              select: {
                locale: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by slug
    const worksBySlug = new Map<string, typeof allWorks>();
    for (const work of allWorks) {
      const existing = worksBySlug.get(work.slug) ?? [];
      worksBySlug.set(work.slug, [...existing, work]);
    }

    const duplicateWorksBySlug: DuplicateWork[] = Array.from(
      worksBySlug.entries(),
    )
      .filter(([, works]) => works.length > 1)
      .map(([slug, works]) => {
        // Check if all works are in the same category
        const categories = new Set(works.map((w) => w.category.id));
        const isSameCategory = categories.size === 1;

        return {
          identifier: slug,
          type: "slug" as const,
          count: works.length,
          severity: isSameCategory ? ("error" as const) : ("warning" as const),
          reason: isSameCategory
            ? "Même slug dans la même catégorie - doublon critique"
            : "Même slug dans différentes catégories - à vérifier",
          works,
        };
      });

    // Group by title (French)
    const worksByTitle = new Map<string, typeof allWorks>();
    for (const work of allWorks) {
      const frTitle = work.translations.find((t) => t.locale === "fr")?.title;
      if (frTitle) {
        const normalized = frTitle.toLowerCase().trim();
        const existing = worksByTitle.get(normalized) ?? [];
        worksByTitle.set(normalized, [...existing, work]);
      }
    }

    const duplicateWorksByTitle: DuplicateWork[] = Array.from(
      worksByTitle.entries(),
    )
      .filter(([, works]) => works.length > 1)
      .map(([title, works]) => {
        // Check if all works are in the same category
        const categories = new Set(works.map((w) => w.category.id));
        const isSameCategory = categories.size === 1;

        return {
          identifier: title,
          type: "title" as const,
          count: works.length,
          severity: isSameCategory ? ("warning" as const) : ("info" as const),
          reason: isSameCategory
            ? "Même titre dans la même catégorie - potentiel doublon"
            : "Même titre dans différentes catégories - normal, à surveiller",
          works,
        };
      });

    // 3. Detect duplicate composers by slug
    const allComposers = await prisma.composer.findMany({
      select: {
        id: true,
        slug: true,
        createdAt: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    });

    // Group by slug
    const composersBySlug = new Map<string, typeof allComposers>();
    for (const composer of allComposers) {
      const existing = composersBySlug.get(composer.slug) ?? [];
      composersBySlug.set(composer.slug, [...existing, composer]);
    }

    const duplicateComposersBySlug: DuplicateComposer[] = Array.from(
      composersBySlug.entries(),
    )
      .filter(([, composers]) => composers.length > 1)
      .map(([slug, composers]) => ({
        identifier: slug,
        type: "slug" as const,
        count: composers.length,
        severity: "error" as const,
        reason: "Même slug - doublon critique à corriger",
        composers,
      }));

    // Group by name (French)
    const composersByName = new Map<string, typeof allComposers>();
    for (const composer of allComposers) {
      const frName = composer.translations.find((t) => t.locale === "fr")?.name;
      if (frName) {
        const normalized = frName.toLowerCase().trim();
        const existing = composersByName.get(normalized) ?? [];
        composersByName.set(normalized, [...existing, composer]);
      }
    }

    const duplicateComposersByName: DuplicateComposer[] = Array.from(
      composersByName.entries(),
    )
      .filter(([, composers]) => composers.length > 1)
      .map(([name, composers]) => ({
        identifier: name,
        type: "name" as const,
        count: composers.length,
        severity: "warning" as const,
        reason: "Même nom avec slug différent - potentiel doublon",
        composers,
      }));

    // 4. Detect duplicate categories by slug
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        createdAt: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    });

    const categoriesBySlug = new Map<string, typeof allCategories>();
    for (const category of allCategories) {
      const existing = categoriesBySlug.get(category.slug) ?? [];
      categoriesBySlug.set(category.slug, [...existing, category]);
    }

    const duplicateCategoriesBySlug: DuplicateCategory[] = Array.from(
      categoriesBySlug.entries(),
    )
      .filter(([, categories]) => categories.length > 1)
      .map(([slug, categories]) => ({
        slug,
        count: categories.length,
        severity: "error" as const,
        reason: "Même slug - doublon critique à corriger",
        categories,
      }));

    // 5. Detect duplicate labels by slug
    const allLabels = await prisma.label.findMany({
      select: {
        id: true,
        slug: true,
        createdAt: true,
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
    });

    const labelsBySlug = new Map<string, typeof allLabels>();
    for (const label of allLabels) {
      const existing = labelsBySlug.get(label.slug) ?? [];
      labelsBySlug.set(label.slug, [...existing, label]);
    }

    const duplicateLabelsBySlug: DuplicateLabel[] = Array.from(
      labelsBySlug.entries(),
    )
      .filter(([, labels]) => labels.length > 1)
      .map(([slug, labels]) => ({
        slug,
        count: labels.length,
        severity: "error" as const,
        reason: "Même slug - doublon critique à corriger",
        labels,
      }));

    const response: DuplicatesResponse = {
      assets: {
        duplicatesByPath: duplicateAssetsByPath,
        unusedAssets,
        totalDuplicates: duplicateAssetsByPath.reduce(
          (sum, d) => sum + d.count,
          0,
        ),
        totalUnused: unusedAssets.length,
        totalErrors: duplicateAssetsByPath.filter((d) => d.severity === "error")
          .length,
        totalWarnings: 0,
        totalInfo: 0,
      },
      works: {
        duplicatesBySlug: duplicateWorksBySlug,
        duplicatesByTitle: duplicateWorksByTitle,
        totalDuplicates:
          duplicateWorksBySlug.reduce((sum, d) => sum + d.count, 0) +
          duplicateWorksByTitle.reduce((sum, d) => sum + d.count, 0),
        totalErrors:
          duplicateWorksBySlug.filter((d) => d.severity === "error").length +
          duplicateWorksByTitle.filter((d) => d.severity === "error").length,
        totalWarnings:
          duplicateWorksBySlug.filter((d) => d.severity === "warning").length +
          duplicateWorksByTitle.filter((d) => d.severity === "warning").length,
        totalInfo:
          duplicateWorksBySlug.filter((d) => d.severity === "info").length +
          duplicateWorksByTitle.filter((d) => d.severity === "info").length,
      },
      composers: {
        duplicatesBySlug: duplicateComposersBySlug,
        duplicatesByName: duplicateComposersByName,
        totalDuplicates:
          duplicateComposersBySlug.reduce((sum, d) => sum + d.count, 0) +
          duplicateComposersByName.reduce((sum, d) => sum + d.count, 0),
        totalErrors:
          duplicateComposersBySlug.filter((d) => d.severity === "error")
            .length +
          duplicateComposersByName.filter((d) => d.severity === "error").length,
        totalWarnings:
          duplicateComposersBySlug.filter((d) => d.severity === "warning")
            .length +
          duplicateComposersByName.filter((d) => d.severity === "warning")
            .length,
        totalInfo:
          duplicateComposersBySlug.filter((d) => d.severity === "info").length +
          duplicateComposersByName.filter((d) => d.severity === "info").length,
      },
      categories: {
        duplicatesBySlug: duplicateCategoriesBySlug,
        totalDuplicates: duplicateCategoriesBySlug.reduce(
          (sum, d) => sum + d.count,
          0,
        ),
        totalErrors: duplicateCategoriesBySlug.filter(
          (d) => d.severity === "error",
        ).length,
        totalWarnings: duplicateCategoriesBySlug.filter(
          (d) => d.severity === "warning",
        ).length,
        totalInfo: duplicateCategoriesBySlug.filter(
          (d) => d.severity === "info",
        ).length,
      },
      labels: {
        duplicatesBySlug: duplicateLabelsBySlug,
        totalDuplicates: duplicateLabelsBySlug.reduce(
          (sum, d) => sum + d.count,
          0,
        ),
        totalErrors: duplicateLabelsBySlug.filter((d) => d.severity === "error")
          .length,
        totalWarnings: duplicateLabelsBySlug.filter(
          (d) => d.severity === "warning",
        ).length,
        totalInfo: duplicateLabelsBySlug.filter((d) => d.severity === "info")
          .length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error detecting duplicates:", error);
    return NextResponse.json(
      { error: "Failed to detect duplicates" },
      { status: 500 },
    );
  }
});
