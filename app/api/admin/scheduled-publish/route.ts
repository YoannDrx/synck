import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel Cron job - runs every hour
export async function GET() {
  try {
    const now = new Date();

    const toPublish = await prisma.work.findMany({
      where: {
        status: "scheduled",
        releaseDate: {
          lte: now.toISOString(),
        },
      },
    });

    const results = await Promise.all(
      toPublish.map((work) =>
        prisma.work.update({
          where: { id: work.id },
          data: { status: "completed", isActive: true },
        }),
      ),
    );

    return NextResponse.json({
      published: results.length,
      ids: results.map((w) => w.id),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
