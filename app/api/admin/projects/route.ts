/* eslint-disable no-console */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

export async function GET() {
  try {
    const works = await prisma.work.findMany({
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
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(works);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const data = workSchema.parse(body);

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

    return NextResponse.json(work, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 },
    );
  }
}
