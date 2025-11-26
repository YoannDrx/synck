import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { createAuditLog } from "@/lib/audit-log";

const artistLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.url(),
  label: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
});

const artistSchema = z.object({
  slug: z.string().min(1),
  imageId: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  translations: z.object({
    fr: z.object({
      name: z.string().min(1),
      bio: z.string().optional().nullable(),
    }),
    en: z.object({
      name: z.string().min(1),
      bio: z.string().optional().nullable(),
    }),
  }),
  links: z.array(artistLinkSchema).optional(),
});

// GET all artists
export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  // If search param exists, return simplified results for search
  if (search) {
    const artists = await prisma.artist.findMany({
      where: {
        translations: {
          some: {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        },
      },
      include: {
        translations: {
          select: {
            locale: true,
            name: true,
          },
        },
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
    });

    // Transform to flat structure for search results
    const searchResults = artists.map((artist) => ({
      id: artist.id,
      nameFr: artist.translations.find((t) => t.locale === "fr")?.name ?? "",
      nameEn: artist.translations.find((t) => t.locale === "en")?.name ?? "",
    }));

    return NextResponse.json(searchResults);
  }

  // Default: return full artists data
  const artists = await prisma.artist.findMany({
    include: {
      translations: true,
      image: true,
      links: true,
      _count: {
        select: { contributions: true },
      },
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(artists);
});

// POST create new artist
export const POST = withAuthAndValidation(
  artistSchema,
  async (req, _context, user, data) => {
    const artist = await prisma.artist.create({
      data: {
        slug: data.slug,
        imageId: data.imageId,
        externalUrl: null,
        order: data.order,
        isActive: data.isActive,
        translations: {
          create: [
            {
              locale: "fr",
              name: data.translations.fr.name,
              bio: data.translations.fr.bio ?? null,
            },
            {
              locale: "en",
              name: data.translations.en.name,
              bio: data.translations.en.bio ?? null,
            },
          ],
        },
        ...(data.links &&
          data.links.length > 0 && {
            links: {
              create: data.links.map((link) => ({
                platform: link.platform,
                url: link.url,
                label: link.label ?? null,
                order: link.order ?? 0,
              })),
            },
          }),
      },
      include: {
        translations: true,
        image: true,
        links: true,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entityType: "Artist",
      entityId: artist.id,
      metadata: {
        slug: artist.slug,
        nameFr: data.translations.fr.name,
        nameEn: data.translations.en.name,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(artist, { status: 201 });
  },
);
