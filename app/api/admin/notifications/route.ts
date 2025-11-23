import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/with-auth";

export const GET = withAuth(async (_req, _context, user) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req, _context, user) => {
  try {
    const { ids } = (await req.json()) as { ids: string[] };

    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
});
