import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";
import { createAuditLog } from "@/lib/audit-log";

const assetSchema = z.object({
  path: z.string().min(1),
  alt: z.string().optional().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  aspectRatio: z.number().positive(),
  blurDataUrl: z.string(),
});

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page") ?? "0"), 0);
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isNaN(limitParam)
    ? 20
    : Math.min(Math.max(limitParam, 1), 100);
  const search = searchParams.get("search");
  const orphansOnly = searchParams.get("orphansOnly") === "true";
  const _sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder =
    (searchParams.get("sortOrder") ?? "desc") === "asc" ? ("asc" as const) : ("desc" as const);

  const orphanFilters = {
    workImages: { none: {} },
    workCover: { none: {} },
    categoryImages: { none: {} },
    labelImages: { none: {} },
    composerImages: { none: {} },
    expertiseImages: { none: {} },
    expertiseCover: { none: {} },
  };

  const where = {
    ...(search
      ? {
          path: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(orphansOnly ? orphanFilters : {}),
  };

  // Asset model does not have a 'size' field, fallback to createdAt
  const orderBy = { createdAt: sortOrder };

  const [assets, total, orphanedCount] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        _count: {
          select: {
            workImages: true,
            workCover: true,
            categoryImages: true,
            labelImages: true,
            composerImages: true,
            expertiseImages: true,
            expertiseCover: true,
          },
        },
      },
      orderBy,
      skip: page * limit,
      take: limit,
    }),
    prisma.asset.count({ where }),
    prisma.asset.count({
      where: orphanFilters,
    }),
  ]);

  return NextResponse.json({
    data: assets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      orphans: orphanedCount,
    },
  });
});

export const POST = withAuthAndValidation(
  assetSchema,
  async (req, _context, user, data) => {
    const asset = await prisma.asset.create({
      data: {
        path: data.path,
        alt: data.alt ?? null,
        width: data.width,
        height: data.height,
        aspectRatio: data.aspectRatio,
        blurDataUrl: data.blurDataUrl,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entityType: "Asset",
      entityId: asset.id,
      metadata: {
        path: asset.path,
        width: asset.width,
        height: asset.height,
      },
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(asset, { status: 201 });
  },
);
