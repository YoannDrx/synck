import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { ApiError } from "@/lib/api/error-handler";
import { createAuditLog } from "@/lib/audit-log";

const composerLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.url(),
  label: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
});

const composerUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  imageId: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .object({
      fr: z.object({
        name: z.string().min(1),
        bio: z.string().optional().nullable(),
      }),
      en: z.object({
        name: z.string().min(1),
        bio: z.string().optional().nullable(),
      }),
    })
    .optional(),
  links: z.array(composerLinkSchema).optional(),
});

// GET single composer
export const GET = withAuth(async (_req, context) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }
  const { id } = await context.params;

  const composer = await prisma.composer.findUnique({
    where: { id },
    include: {
      translations: true,
      image: true,
      links: true,
      contributions: {
        include: {
          work: {
            include: {
              translations: true,
              category: {
                include: { translations: true },
              },
            },
          },
        },
      },
    },
  });

  if (!composer) {
    throw new ApiError(404, "Compositeur non trouvé", "NOT_FOUND");
  }

  return NextResponse.json(composer);
});

// PUT update composer
export const PUT = withAuthAndValidation(
  composerUpdateSchema,
  async (req, context, user, data) => {
    if (!context.params) {
      throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
    }
    const { id } = await context.params;

    // Check if composer exists and get old values for audit log
    const existing = await prisma.composer.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!existing) {
      throw new ApiError(404, "Compositeur non trouvé", "NOT_FOUND");
    }

    // Update composer + translations + links in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      await tx.composer.update({
        where: { id },
        data: {
          slug: data.slug,
          imageId: data.imageId,
          externalUrl: null,
          order: data.order,
          isActive: data.isActive,
        },
      });

      if (data.translations) {
        await Promise.all([
          tx.composerTranslation.upsert({
            where: {
              composerId_locale: {
                composerId: id,
                locale: "fr",
              },
            },
            create: {
              composerId: id,
              locale: "fr",
              name: data.translations.fr.name,
              bio: data.translations.fr.bio ?? null,
            },
            update: {
              name: data.translations.fr.name,
              bio: data.translations.fr.bio ?? null,
            },
          }),
          tx.composerTranslation.upsert({
            where: {
              composerId_locale: {
                composerId: id,
                locale: "en",
              },
            },
            create: {
              composerId: id,
              locale: "en",
              name: data.translations.en.name,
              bio: data.translations.en.bio ?? null,
            },
            update: {
              name: data.translations.en.name,
              bio: data.translations.en.bio ?? null,
            },
          }),
        ]);
      }

      if (data.links) {
        // Replace links to match payload
        await tx.composerLink.deleteMany({ where: { composerId: id } });
        if (data.links.length > 0) {
          await tx.composerLink.createMany({
            data: data.links.map((link) => ({
              composerId: id,
              platform: link.platform,
              url: link.url,
              label: link.label ?? null,
              order: link.order ?? 0,
            })),
          });
        }
      }

      return tx.composer.findUnique({
        where: { id },
        include: {
          translations: true,
          image: true,
          links: true,
        },
      });
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entityType: "Composer",
      entityId: id,
      metadata: {
        slug: data.slug ?? existing.slug,
        before: {
          nameFr: existing.translations.find((t) => t.locale === "fr")?.name,
          nameEn: existing.translations.find((t) => t.locale === "en")?.name,
        },
        after: {
          nameFr: data.translations?.fr.name,
          nameEn: data.translations?.en.name,
        },
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(updated);
  },
);

// DELETE composer
export const DELETE = withAuth(async (req, context, user) => {
  if (!context.params) {
    throw new ApiError(400, "Paramètres manquants", "BAD_REQUEST");
  }
  const { id } = await context.params;

  // Check if composer exists and get metadata for audit log
  const existing = await prisma.composer.findUnique({
    where: { id },
    include: {
      translations: true,
      _count: {
        select: { contributions: true },
      },
    },
  });

  if (!existing) {
    throw new ApiError(404, "Compositeur non trouvé", "NOT_FOUND");
  }

  // Check if composer has contributions
  if (existing._count.contributions > 0) {
    throw new ApiError(
      400,
      `Ce compositeur est lié à ${String(existing._count.contributions)} œuvre(s). Supprimez d'abord les contributions.`,
      "HAS_DEPENDENCIES",
    );
  }

  // Delete composer (translations will be cascade deleted)
  await prisma.composer.delete({
    where: { id },
  });

  // Audit log
  await createAuditLog({
    userId: user.id,
    action: "DELETE",
    entityType: "Composer",
    entityId: id,
    metadata: {
      slug: existing.slug,
      nameFr: existing.translations.find((t) => t.locale === "fr")?.name,
      nameEn: existing.translations.find((t) => t.locale === "en")?.name,
    },
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ success: true });
});
