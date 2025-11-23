import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";
import { z } from "zod";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["delete", "publish", "archive", "activate", "deactivate"]),
});

export const POST = withAuth(async (req) => {
  try {
    const body = (await req.json()) as unknown;
    const { ids, action } = bulkSchema.parse(body);

    let result;

    switch (action) {
      case "delete":
        result = await prisma.work.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      case "publish":
        result = await prisma.work.updateMany({
          where: { id: { in: ids } },
          data: { status: "PUBLISHED", isActive: true },
        });
        break;

      case "archive":
        result = await prisma.work.updateMany({
          where: { id: { in: ids } },
          data: { status: "ARCHIVED", isActive: false },
        });
        break;

      case "activate":
        result = await prisma.work.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        break;

      case "deactivate":
        result = await prisma.work.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        break;
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      action,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erreur lors de l'opération" },
      { status: 500 },
    );
  }
});
