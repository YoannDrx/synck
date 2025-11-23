import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, requireAuth } from "@/lib/api/with-auth";
import { ApiError, handleApiError } from "@/lib/api/error-handler";

const profileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  image: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val === null || val === undefined || val === "") return true;
        // Accept absolute URLs or relative paths (/uploads/...)
        return /^https?:\/\//.test(val) || val.startsWith("/");
      },
      { message: "Chemin d'image invalide" },
    ),
});

export const GET = withAuth(async () => {
  const user = await requireAuth();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, name: true, image: true, role: true },
  });

  if (!dbUser) {
    throw new ApiError(404, "Utilisateur non trouvé", "NOT_FOUND");
  }

  return NextResponse.json(dbUser);
});

export const PUT = withAuth(async (req) => {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = profileSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.email && { email: data.email, emailVerified: false }),
        ...(data.name && { name: data.name }),
        ...(data.image !== undefined && { image: data.image || null }),
      },
      select: { email: true, name: true, image: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
});
