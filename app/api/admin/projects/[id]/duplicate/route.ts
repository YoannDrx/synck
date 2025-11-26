import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

export const POST = withAuth(async (_req, context) => {
  try {
    if (!context.params) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }
    const { id } = await context.params;

    const original = await prisma.work.findUnique({
      where: { id },
      include: {
        translations: true,
        contributions: true,
        images: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const duplicate = await prisma.work.create({
      data: {
        slug: `${original.slug}-copie-${String(Date.now())}`,
        categoryId: original.categoryId,
        labelId: original.labelId,
        year: original.year,
        genre: original.genre,
        releaseDate: original.releaseDate,
        spotifyUrl: original.spotifyUrl,
        youtubeUrl: original.youtubeUrl,
        externalUrl: original.externalUrl,
        status: "DRAFT",
        isActive: false,
        order: original.order,
        translations: {
          create: original.translations.map((t) => ({
            locale: t.locale,
            title: `${t.title} (Copie)`,
            subtitle: t.subtitle,
            description: t.description,
            role: t.role,
          })),
        },
        contributions: {
          create: original.contributions.map((c) => ({
            artistId: c.artistId,
            role: c.role,
            order: c.order,
          })),
        },
      },
    });

    return NextResponse.json({ id: duplicate.id });
  } catch {
    return NextResponse.json({ error: "Duplication failed" }, { status: 500 });
  }
});
