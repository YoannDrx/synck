import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit-log";

const importProjectSchema = z.object({
  slug: z.string().min(1),
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  categorySlug: z.string().optional(),
  labelSlug: z.string().optional(),
  year: z.number().optional(),
  genre: z.string().optional(),
});

export const POST = withAuth(async (req, _context, user) => {
  let updateExisting = false;

  try {
    const body = (await req.json()) as {
      data: unknown[];
      updateExisting?: boolean;
    };
    const { data } = body;
    updateExisting = body.updateExisting ?? false;

    const results = {
      created: 0,
      updated: 0,
      errors: [] as { row: number; error: string }[],
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = importProjectSchema.parse(data[i]);

        // Check if exists
        const existing = await prisma.work.findUnique({
          where: { slug: item.slug },
        });

        if (existing && !updateExisting) {
          results.errors.push({
            row: i + 1,
            error: `Le slug "${item.slug}" existe déjà`,
          });
          continue;
        }

        // Find category and label
        const category = item.categorySlug
          ? await prisma.category.findUnique({
              where: { slug: item.categorySlug },
            })
          : null;

        const label = item.labelSlug
          ? await prisma.label.findUnique({ where: { slug: item.labelSlug } })
          : null;

        if (item.categorySlug && !category) {
          results.errors.push({
            row: i + 1,
            error: `Catégorie "${item.categorySlug}" introuvable`,
          });
          continue;
        }

        if (existing) {
          // Update
          await prisma.work.update({
            where: { id: existing.id },
            data: {
              year: item.year,
              genre: item.genre,
              categoryId: category?.id ?? existing.categoryId,
              labelId: label?.id,
              translations: {
                upsert: [
                  {
                    where: {
                      workId_locale: { workId: existing.id, locale: "fr" },
                    },
                    create: { locale: "fr", title: item.titleFr },
                    update: { title: item.titleFr },
                  },
                  {
                    where: {
                      workId_locale: { workId: existing.id, locale: "en" },
                    },
                    create: { locale: "en", title: item.titleEn },
                    update: { title: item.titleEn },
                  },
                ],
              },
            },
          });
          results.updated++;
        } else {
          // Create
          if (!category) {
            results.errors.push({
              row: i + 1,
              error: "Catégorie requise pour création",
            });
            continue;
          }

          await prisma.work.create({
            data: {
              slug: item.slug,
              categoryId: category.id,
              labelId: label?.id,
              year: item.year,
              genre: item.genre,
              translations: {
                create: [
                  { locale: "fr", title: item.titleFr },
                  { locale: "en", title: item.titleEn },
                ],
              },
            },
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        });
      }
    }

    await createAuditLog({
      userId: user.id,
      action: "IMPORT",
      entityType: "Work",
      metadata: {
        created: results.created,
        updated: results.updated,
        errors: results.errors.length,
        updateExisting,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(results);
  } catch (error) {
    await createAuditLog({
      userId: user.id,
      action: "IMPORT",
      entityType: "Work",
      metadata: {
        status: "failed",
        updateExisting,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(
      { error: "Erreur lors de l'import" },
      { status: 500 },
    );
  }
});
