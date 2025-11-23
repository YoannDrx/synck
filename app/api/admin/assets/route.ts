import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, withAuthAndValidation } from "@/lib/api/with-auth";

const assetSchema = z.object({
  path: z.string().min(1),
  alt: z.string().optional().nullable(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  aspectRatio: z.number().positive(),
  blurDataUrl: z.string(),
});

export const GET = withAuth(async () => {
  const assets = await prisma.asset.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
});

export const POST = withAuthAndValidation(
  assetSchema,
  async (_req, _context, _user, data) => {
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

    return NextResponse.json(asset, { status: 201 });
  },
);
