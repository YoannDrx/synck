import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";

const expertiseUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  coverImageId: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .object({
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
    })
    .optional(),
  imageIds: z.array(z.string()).optional(),
});

export const GET = withAuth(async (_req, context) => {
  const params = await context.params;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  const expertise = await prisma.expertise.findUnique({
    where: { id },
    include: {
      coverImage: true,
      translations: true,
      images: true,
    },
  });

  if (!expertise) {
    return NextResponse.json(
      { error: "Expertise non trouvée" },
      { status: 404 },
    );
  }

  return NextResponse.json(expertise);
});

export const PATCH = withAuthAndValidation(
  expertiseUpdateSchema,
  async (_req, context, _user, data) => {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Check if expertise exists
    const existing = await prisma.expertise.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Expertise non trouvée" },
        { status: 404 },
      );
    }

    // Update expertise
    const expertise = await prisma.expertise.update({
      where: { id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.coverImageId !== undefined && {
          coverImageId: data.coverImageId,
        }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.translations && {
          translations: {
            upsert: [
              {
                where: {
                  expertiseId_locale: {
                    expertiseId: id,
                    locale: "fr",
                  },
                },
                update: {
                  title: data.translations.fr.title,
                  subtitle: data.translations.fr.subtitle ?? null,
                  description: data.translations.fr.description ?? null,
                  content: data.translations.fr.content,
                },
                create: {
                  locale: "fr",
                  title: data.translations.fr.title,
                  subtitle: data.translations.fr.subtitle ?? null,
                  description: data.translations.fr.description ?? null,
                  content: data.translations.fr.content,
                },
              },
              {
                where: {
                  expertiseId_locale: {
                    expertiseId: id,
                    locale: "en",
                  },
                },
                update: {
                  title: data.translations.en.title,
                  subtitle: data.translations.en.subtitle ?? null,
                  description: data.translations.en.description ?? null,
                  content: data.translations.en.content,
                },
                create: {
                  locale: "en",
                  title: data.translations.en.title,
                  subtitle: data.translations.en.subtitle ?? null,
                  description: data.translations.en.description ?? null,
                  content: data.translations.en.content,
                },
              },
            ],
          },
        }),
        ...(data.imageIds !== undefined && {
          images: {
            set: [],
            connect: data.imageIds.map((imageId) => ({ id: imageId })),
          },
        }),
      },
      include: {
        translations: true,
        coverImage: true,
        images: true,
      },
    });

    return NextResponse.json(expertise);
  },
);

export const DELETE = withAuth(async (_req, context) => {
  const params = await context.params;
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  // Check if expertise exists
  const expertise = await prisma.expertise.findUnique({
    where: { id },
  });

  if (!expertise) {
    return NextResponse.json(
      { error: "Expertise non trouvée" },
      { status: 404 },
    );
  }

  // Delete expertise (cascade will delete translations)
  await prisma.expertise.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
