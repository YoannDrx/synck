import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { ApiError } from "@/lib/api/error-handler";

const labelSchema = z.object({
  website: z
    .string()
    .refine(
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
    )
    .optional()
    .nullable(),
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

  const label = await prisma.label.findUnique({
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

  if (!label) {
    throw new ApiError(404, "Label non trouvé", "NOT_FOUND");
  }

  return NextResponse.json(label);
});

export const PUT = withAuthAndValidation(
  labelSchema,
  async (_req, context, _user, data) => {
    if (!context.params) {
      throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
    }

    const { id } = await context.params;

    const existing = await prisma.label.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!existing) {
      throw new ApiError(404, "Label non trouvé", "NOT_FOUND");
    }

    await prisma.label.update({
      where: { id },
      data: {
        website: data.website ?? null,
        order: data.order,
        isActive: data.isActive,
      },
    });

    await Promise.all([
      prisma.labelTranslation.upsert({
        where: {
          labelId_locale: {
            labelId: id,
            locale: "fr",
          },
        },
        create: {
          labelId: id,
          locale: "fr",
          name: data.translations.fr.name,
        },
        update: {
          name: data.translations.fr.name,
        },
      }),
      prisma.labelTranslation.upsert({
        where: {
          labelId_locale: {
            labelId: id,
            locale: "en",
          },
        },
        create: {
          labelId: id,
          locale: "en",
          name: data.translations.en.name,
        },
        update: {
          name: data.translations.en.name,
        },
      }),
    ]);

    const updatedLabel = await prisma.label.findUnique({
      where: { id },
      include: { translations: true },
    });

    return NextResponse.json(updatedLabel);
  },
);

export const DELETE = withAuth(async (_req, context) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }

  const { id } = await context.params;

  const label = await prisma.label.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          works: true,
        },
      },
    },
  });

  if (!label) {
    throw new ApiError(404, "Label non trouvé", "NOT_FOUND");
  }

  if (label._count.works > 0) {
    throw new ApiError(
      400,
      `Impossible de supprimer ce label car il est utilisé par ${String(label._count.works)} projet(s)`,
      "LABEL_IN_USE",
    );
  }

  await prisma.label.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
});
