import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { ApiError } from "@/lib/api/error-handler";

const categorySchema = z.object({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  translations: z.object({
    fr: z.object({
      name: z.string().min(1),
    }),
    en: z.object({
      name: z.string().min(1),
    }),
  }),
});

export const GET = withAuth(async (_req, context) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }

  const { id } = await context.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      translations: true,
      _count: {
        select: {
          works: true,
        },
      },
    },
  });

  if (!category) {
    throw new ApiError(404, "Catégorie non trouvée", "NOT_FOUND");
  }

  return NextResponse.json(category);
});

export const PUT = withAuthAndValidation(
  categorySchema,
  async (_req, context, _user, data) => {
    if (!context.params) {
      throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
    }

    const { id } = await context.params;

    // Vérifier que la catégorie existe
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existing) {
      throw new ApiError(404, "Catégorie non trouvée", "NOT_FOUND");
    }

    // Mettre à jour la catégorie
    await prisma.category.update({
      where: { id },
      data: {
        color: data.color,
        icon: data.icon ?? null,
        order: data.order,
        isActive: data.isActive,
      },
    });

    // Mettre à jour les traductions séparément
    await Promise.all([
      prisma.categoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: id,
            locale: "fr",
          },
        },
        create: {
          categoryId: id,
          locale: "fr",
          name: data.translations.fr.name,
        },
        update: {
          name: data.translations.fr.name,
        },
      }),
      prisma.categoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: id,
            locale: "en",
          },
        },
        create: {
          categoryId: id,
          locale: "en",
          name: data.translations.en.name,
        },
        update: {
          name: data.translations.en.name,
        },
      }),
    ]);

    // Récupérer la catégorie mise à jour avec les traductions
    const updatedCategory = await prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });

    return NextResponse.json(updatedCategory);
  },
);

export const DELETE = withAuth(async (_req, context) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }

  const { id } = await context.params;

  // Vérifier que la catégorie existe
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          works: true,
        },
      },
    },
  });

  if (!category) {
    throw new ApiError(404, "Catégorie non trouvée", "NOT_FOUND");
  }

  // Vérifier qu'aucun projet n'utilise cette catégorie
  if (category._count.works > 0) {
    throw new ApiError(
      400,
      `Impossible de supprimer cette catégorie car elle est utilisée par ${String(category._count.works)} projet(s)`,
      "CATEGORY_IN_USE",
    );
  }

  // Supprimer la catégorie (cascade sur translations)
  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
