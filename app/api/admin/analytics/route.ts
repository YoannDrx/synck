import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async () => {
  // Get last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // Fetch works and artists created in last 6 months
  const [works, artists] = await Promise.all([
    prisma.work.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.artist.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Group by month
  const monthNames = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];

  const months: {
    month: string;
    works: number;
    published: number;
    draft: number;
    artists: number;
  }[] = [];

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    const monthLabel = `${monthNames[date.getMonth()]} ${String(date.getFullYear())}`;

    const monthWorks = works.filter((w) => {
      const wDate = new Date(w.createdAt);
      return (
        wDate.getFullYear() === date.getFullYear() &&
        wDate.getMonth() === date.getMonth()
      );
    });

    const monthArtists = artists.filter((c) => {
      const cDate = new Date(c.createdAt);
      return (
        cDate.getFullYear() === date.getFullYear() &&
        cDate.getMonth() === date.getMonth()
      );
    });

    months.push({
      month: monthLabel,
      works: monthWorks.length,
      published: monthWorks.filter((w) => w.isActive).length,
      draft: monthWorks.filter((w) => !w.isActive).length,
      artists: monthArtists.length,
    });
  }

  // Get status distribution
  const [totalWorks, publishedWorks, totalCategories, totalLabels] =
    await Promise.all([
      prisma.work.count(),
      prisma.work.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.label.count({ where: { isActive: true } }),
    ]);

  const statusDistribution = [
    { name: "Publiés", value: publishedWorks, color: "#d5ff0a" },
    { name: "Inactifs", value: totalWorks - publishedWorks, color: "#666" },
  ];

  // Get category distribution (top 5)
  const categoryStats = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { works: true },
      },
      translations: {
        where: { locale: "fr" },
        select: { name: true },
      },
    },
    orderBy: {
      works: {
        _count: "desc",
      },
    },
    take: 5,
  });

  const categoryDistribution = categoryStats.map((cat) => ({
    name: cat.translations[0]?.name ?? "Sans nom",
    value: cat._count.works,
    color: cat.color ?? "#d5ff0a",
  }));

  return NextResponse.json({
    timeline: months,
    statusDistribution,
    categoryDistribution,
    summary: {
      totalWorks,
      publishedWorks,
      totalCategories,
      totalLabels,
    },
  });
});
