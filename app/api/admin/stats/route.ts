import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async () => {
  // Fetch all stats in parallel
  const [
    totalWorks,
    activeWorks,
    inactiveWorks,
    totalArtists,
    activeArtists,
    totalCategories,
    activeCategories,
    totalLabels,
    activeLabels,
    totalAssets,
    orphanedAssets,
    lastWork,
    lastArtist,
  ] = await Promise.all([
    // Works stats
    prisma.work.count(),
    prisma.work.count({ where: { isActive: true } }),
    prisma.work.count({ where: { isActive: false } }),

    // Artists stats
    prisma.artist.count(),
    prisma.artist.count({ where: { isActive: true } }),

    // Categories stats
    prisma.category.count(),
    prisma.category.count({ where: { isActive: true } }),

    // Labels stats
    prisma.label.count(),
    prisma.label.count({ where: { isActive: true } }),

    // Assets stats
    prisma.asset.count(),
    prisma.asset.count({
      where: {
        AND: [
          { workCover: { none: {} } },
          { workImages: { none: {} } },
          { artistImages: { none: {} } },
          { categoryImages: { none: {} } },
          { labelImages: { none: {} } },
          { expertiseCover: { none: {} } },
          { expertiseImages: { none: {} } },
        ],
      },
    }),

    // Last activity - most recent work
    prisma.work.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        translations: {
          where: { locale: "fr" },
          select: { title: true },
        },
      },
    }),

    // Last activity - most recent artist
    prisma.artist.findFirst({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        translations: {
          where: { locale: "fr" },
          select: { name: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    works: {
      total: totalWorks,
      active: activeWorks,
      inactive: inactiveWorks,
    },
    artists: {
      total: totalArtists,
      active: activeArtists,
      inactive: totalArtists - activeArtists,
    },
    categories: {
      total: totalCategories,
      active: activeCategories,
    },
    labels: {
      total: totalLabels,
      active: activeLabels,
    },
    assets: {
      total: totalAssets,
      orphaned: orphanedAssets,
    },
    lastActivity: {
      work: lastWork
        ? {
            id: lastWork.id,
            title: lastWork.translations[0]?.title ?? "Sans titre",
            createdAt: lastWork.createdAt.toISOString(),
          }
        : null,
      artist: lastArtist
        ? {
            id: lastArtist.id,
            name: lastArtist.translations[0]?.name ?? "Sans nom",
            createdAt: lastArtist.createdAt.toISOString(),
          }
        : null,
    },
  });
});
