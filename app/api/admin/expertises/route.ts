import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";

const expertiseSchema = z.object({
  slug: z.string().min(1),
  coverImageId: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  translations: z.object({
    fr: z.object({
      title: z.string().min(1),
      subtitle: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      content: z.string().min(1),
    }),
    en: z.object({
      title: z.string().min(1),
      subtitle: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      content: z.string().min(1),
    }),
  }),
  imageIds: z.array(z.string()).optional(),
});

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  // If search param exists, return simplified results for search
  if (search) {
    const expertises = await prisma.expertise.findMany({
      where: {
        translations: {
          some: {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
      include: {
        translations: {
          select: {
            locale: true,
            title: true,
          },
        },
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
    });

    // Transform to flat structure for search results
    const searchResults = expertises.map((expertise) => ({
      id: expertise.id,
      titleFr:
        expertise.translations.find((t) => t.locale === "fr")?.title ?? "",
      titleEn:
        expertise.translations.find((t) => t.locale === "en")?.title ?? "",
    }));

    return NextResponse.json(searchResults);
  }

  // Default: return full expertises data
  const expertises = await prisma.expertise.findMany({
    include: {
      coverImage: true,
      translations: true,
      images: true,
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(expertises);
});

export const POST = withAuthAndValidation(
  expertiseSchema,
  async (_req, _context, _user, data) => {
    // Create expertise with translations
    const expertise = await prisma.expertise.create({
      data: {
        slug: data.slug,
        coverImageId: data.coverImageId,
        order: data.order,
        isActive: data.isActive,
        translations: {
          create: [
            {
              locale: "fr",
              title: data.translations.fr.title,
              subtitle: data.translations.fr.subtitle ?? null,
              description: data.translations.fr.description ?? null,
              content: data.translations.fr.content,
            },
            {
              locale: "en",
              title: data.translations.en.title,
              subtitle: data.translations.en.subtitle ?? null,
              description: data.translations.en.description ?? null,
              content: data.translations.en.content,
            },
          ],
        },
        ...(data.imageIds &&
          data.imageIds.length > 0 && {
            images: {
              connect: data.imageIds.map((id) => ({ id })),
            },
          }),
      },
      include: {
        translations: true,
        coverImage: true,
        images: true,
      },
    });

    return NextResponse.json(expertise, { status: 201 });
  },
);
