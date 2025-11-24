import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Type definitions for body parsing
type TranslationInput = {
  locale: string;
  title: string;
  subtitle?: string;
  location?: string;
  description?: string;
  role?: string;
};

type ItemInput = {
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  order: number;
  isActive?: boolean;
  translations: TranslationInput[];
};

type SectionInput = {
  type: string;
  order: number;
  isActive?: boolean;
  translations: TranslationInput[];
  items?: ItemInput[];
};

type CVBody = {
  sections?: SectionInput[];
};

export async function GET(_req: NextRequest) {
  try {
    const cv = await prisma.cV.findFirst({
      include: {
        photoAsset: true,
        sections: {
          orderBy: { order: "asc" },
          include: {
            translations: true,
            items: {
              orderBy: { order: "asc" },
              include: {
                translations: true,
              },
            },
          },
        },
        skills: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            translations: true,
          },
        },
        socialLinks: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(
      cv ?? { sections: [], skills: [], socialLinks: [] },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching CV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as CVBody;
    const { sections } = body;

    let cv = await prisma.cV.findFirst();
    cv ??= await prisma.cV.create({ data: {} });

    // Transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      if (cv) {
        // Delete all existing sections (cascading delete)
        await tx.cVSection.deleteMany({
          where: { cvId: cv.id },
        });

        // Recreate structure
        if (sections && Array.isArray(sections)) {
          for (const section of sections) {
            await tx.cVSection.create({
              data: {
                cvId: cv.id,
                type: section.type,
                order: section.order,
                isActive: section.isActive ?? true,
                translations: {
                  create: section.translations.map((t) => ({
                    locale: t.locale,
                    title: t.title,
                  })),
                },
                items: {
                  create: section.items?.map((item) => ({
                    startDate: item.startDate ? new Date(item.startDate) : null,
                    endDate: item.endDate ? new Date(item.endDate) : null,
                    isCurrent: item.isCurrent ?? false,
                    order: item.order,
                    isActive: item.isActive ?? true,
                    translations: {
                      create: item.translations.map((t) => ({
                        locale: t.locale,
                        title: t.title,
                        subtitle: t.subtitle,
                        location: t.location,
                        description: t.description,
                      })),
                    },
                  })),
                },
              },
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error saving CV:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
