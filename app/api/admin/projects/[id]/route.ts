import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { ApiError } from "@/lib/api/error-handler";

const workSchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string(),
  labelId: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  spotifyUrl: z
    .union([
      z.string().refine(
        (val) => {
          if (!val) return true;
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "URL invalide" },
      ),
      z.literal(""),
      z.null(),
    ])
    .optional(),
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
  composers: z
    .array(
      z.object({
        composerId: z.string(),
        role: z.string().optional().nullable(),
        order: z.number().int().default(0),
      }),
    )
    .optional(),
  imageIds: z.array(z.string()).optional(),
});

export const GET = withAuth(async (_req, context) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }
  const { id } = await context.params;

  const work = await prisma.work.findUnique({
    where: { id },
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
          composer: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
      images: true,
    },
  });

  if (!work) {
    throw new ApiError(404, "Projet non trouvé", "NOT_FOUND");
  }

  return NextResponse.json(work);
});

export const PUT = withAuthAndValidation(
  workSchema,
  async (_req, context, _user, data) => {
    if (!context.params) {
      throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
    }
    const { id } = await context.params;

    // Delete existing contributions, then recreate
    await prisma.contribution.deleteMany({
      where: { workId: id },
    });

    // Update work with new data
    const work = await prisma.work.update({
      where: { id },
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
          deleteMany: {},
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
        ...(data.composers &&
          data.composers.length > 0 && {
            contributions: {
              create: data.composers.map((composer) => ({
                composerId: composer.composerId,
                role: composer.role,
                order: composer.order,
              })),
            },
          }),
      },
      include: {
        translations: true,
        contributions: {
          include: {
            composer: {
              include: {
                translations: true,
              },
            },
          },
        },
        images: true,
      },
    });

    return NextResponse.json(work);
  },
);

export const DELETE = withAuth(async (_req, context) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }
  const { id } = await context.params;

  // Check if work exists
  const existing = await prisma.work.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Projet non trouvé", "NOT_FOUND");
  }

  // Delete work (cascades will handle related data)
  await prisma.work.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
