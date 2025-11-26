import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { createAuditLog } from "@/lib/audit-log";

// Schema validation for creating/updating works
const workSchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string(),
  labelId: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  spotifyUrl: z.string().optional().nullable().or(z.literal("")),
  releaseDate: z.string().optional().nullable(),
  genre: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  translations: z.object({
    fr: z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      role: z.string().optional().nullable(),
    }),
    en: z.object({
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      role: z.string().optional().nullable(),
    }),
  }),
  artists: z
    .array(
      z.object({
        artistId: z.string(),
        role: z.string().optional().nullable(),
        order: z.number().int().default(0),
      }),
    )
    .optional(),
  imageIds: z.array(z.string()).optional(),
});

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const full = searchParams.get("full") === "true";

  // Quick search mode (used by global search)
  if (search && !full) {
    const works = await prisma.work.findMany({
      where: {
        translations: {
          some: {
            title: {
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
            title: true,
          },
        },
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
    });

    // Transform to flat structure for search results
    const searchResults = works.map((work) => ({
      id: work.id,
      titleFr: work.translations.find((t) => t.locale === "fr")?.title ?? "",
      titleEn: work.translations.find((t) => t.locale === "en")?.title ?? "",
    }));

    return NextResponse.json(searchResults);
  }

  const page = Math.max(Number(searchParams.get("page") ?? "0"), 0);
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isNaN(limitParam)
    ? 20
    : Math.min(Math.max(limitParam, 1), 100);
  const categoryId = searchParams.get("categoryId");
  const labelId = searchParams.get("labelId");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder =
    (searchParams.get("sortOrder") ?? "desc") === "asc" ? ("asc" as const) : ("desc" as const);

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(labelId ? { labelId } : {}),
    ...(status ? { status: status.toUpperCase() } : {}),
    ...(search
      ? {
          translations: {
            some: {
              title: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        }
      : {}),
  };

  const orderBy = [];

  if (sortBy === "status") {
    orderBy.push({ status: sortOrder });
  } else if (sortBy === "order") {
    orderBy.push({ order: sortOrder });
  } else {
    orderBy.push({ createdAt: sortOrder });
  }

  // Always add a stable secondary sort
  orderBy.push({ createdAt: "desc" as const });

  const [works, total] = await Promise.all([
    prisma.work.findMany({
      where,
      include: {
        category: {
          include: {
            translations: true,
          },
        },
        label: {
          include: {
            translations: true,
          },
        },
        coverImage: true,
        translations: true,
        contributions: {
          include: {
            artist: {
              include: {
                translations: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        images: true,
      },
      orderBy,
      skip: page * limit,
      take: limit,
    }),
    prisma.work.count({ where }),
  ]);

  return NextResponse.json({
    data: works,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

export const POST = withAuthAndValidation(
  workSchema,
  async (req, _context, user, data) => {
    // Create work with translations and contributions
    const work = await prisma.work.create({
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        labelId: data.labelId,
        coverImageId: data.coverImageId,
        year: data.year ?? null,
        status: data.status,
        spotifyUrl: data.spotifyUrl ?? null,
        releaseDate: data.releaseDate,
        genre: data.genre,
        order: data.order,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        translations: {
          create: [
            {
              locale: "fr",
              title: data.translations.fr.title,
              description: data.translations.fr.description,
              role: data.translations.fr.role,
            },
            {
              locale: "en",
              title: data.translations.en.title,
              description: data.translations.en.description,
              role: data.translations.en.role,
            },
          ],
        },
        ...(data.artists &&
          data.artists.length > 0 && {
            contributions: {
              create: data.artists.map((artist) => ({
                artistId: artist.artistId,
                role: artist.role,
                order: artist.order,
              })),
            },
          }),
      },
      include: {
        translations: true,
        contributions: {
          include: {
            artist: {
              include: {
                translations: true,
              },
            },
          },
        },
        images: true,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entityType: "Work",
      entityId: work.id,
      metadata: {
        slug: work.slug,
        titleFr: data.translations.fr.title,
        titleEn: data.translations.en.title,
        status: work.status,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(work, { status: 201 });
  },
);
