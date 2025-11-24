import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { createAuditLog } from "@/lib/audit-log";

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

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  // If search param exists, return simplified results for search
  if (search) {
    const categories = await prisma.category.findMany({
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
      orderBy: { order: "asc" },
    });

    // Transform to flat structure for search results
    const searchResults = categories.map((category) => ({
      id: category.id,
      nameFr: category.translations.find((t) => t.locale === "fr")?.name ?? "",
      nameEn: category.translations.find((t) => t.locale === "en")?.name ?? "",
    }));

    return NextResponse.json(searchResults);
  }

  // Default: return full categories data
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
      _count: {
        select: {
          works: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(categories);
});

export const POST = withAuthAndValidation(
  categorySchema,
  async (req, _context, user, data) => {
    // Generate slug from French name
    const slug = data.translations.fr.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const category = await prisma.category.create({
      data: {
        slug,
        color: data.color,
        icon: data.icon ?? null,
        order: data.order,
        isActive: data.isActive,
        translations: {
          createMany: {
            data: [
              {
                locale: "fr",
                name: data.translations.fr.name,
              },
              {
                locale: "en",
                name: data.translations.en.name,
              },
            ],
          },
        },
      },
      include: {
        translations: true,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
      metadata: {
        slug: category.slug,
        nameFr: data.translations.fr.name,
        nameEn: data.translations.en.name,
        color: category.color,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(category, { status: 201 });
  },
);
