import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Type definitions for body parsing
type TranslationInput = {
  locale: string;
  title?: string;
  subtitle?: string;
  location?: string;
  description?: string;
  name?: string;
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
  placement?: string;
  layoutType?: string;
  color?: string;
  icon?: string;
  order: number;
  isActive?: boolean;
  translations: TranslationInput[];
  items?: ItemInput[];
};

type SkillInput = {
  category: string;
  level: number;
  showAsBar: boolean;
  order: number;
  isActive: boolean;
  translations: TranslationInput[];
};

type SocialLinkInput = {
  platform: string;
  url: string;
  label?: string;
  order: number;
};

type CVTheme = {
  primary: string;
  secondary: string;
  header: string;
  sidebar: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  badge: string;
};

type CVBody = {
  phone?: string;
  email?: string;
  website?: string;
  location?: string;
  linkedInUrl?: string;
  headlineFr?: string;
  headlineEn?: string;
  bioFr?: string;
  bioEn?: string;
  layout?: string;
  accentColor?: string;
  showPhoto?: boolean;
  theme?: CVTheme;
  sections?: SectionInput[];
  skills?: SkillInput[];
  socialLinks?: SocialLinkInput[];
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
    const { sections, skills, socialLinks, ...cvData } = body;

    let cv = await prisma.cV.findFirst();

    // Update or Create CV
    if (cv) {
      await prisma.cV.update({
        where: { id: cv.id },
        data: {
          phone: cvData.phone,
          email: cvData.email,
          website: cvData.website,
          location: cvData.location,
          linkedInUrl: cvData.linkedInUrl,
          headlineFr: cvData.headlineFr,
          headlineEn: cvData.headlineEn,
          bioFr: cvData.bioFr,
          bioEn: cvData.bioEn,
          layout: cvData.layout,
          accentColor: cvData.accentColor ?? cvData.theme?.primary,
          showPhoto: cvData.showPhoto,
          theme: cvData.theme,
        },
      });
    } else {
      cv = await prisma.cV.create({
        data: {
          phone: cvData.phone,
          email: cvData.email,
          website: cvData.website,
          location: cvData.location,
          linkedInUrl: cvData.linkedInUrl,
          headlineFr: cvData.headlineFr,
          headlineEn: cvData.headlineEn,
          bioFr: cvData.bioFr,
          bioEn: cvData.bioEn,
          layout: cvData.layout ?? "creative",
          accentColor: cvData.accentColor ?? cvData.theme?.primary ?? "#D5FF0A",
          showPhoto: cvData.showPhoto ?? true,
          theme: cvData.theme,
        },
      });
    }

    // Transaction to ensure atomicity for related data
    await prisma.$transaction(async (tx) => {
      if (cv) {
        // Check again for TS, though guaranteed

        // 1. Sections
        if (sections) {
          await tx.cVSection.deleteMany({ where: { cvId: cv.id } });
          for (const section of sections) {
            await tx.cVSection.create({
              data: {
                cvId: cv.id,
                type: section.type,
                placement: section.placement ?? "main",
                layoutType: section.layoutType ?? "list",
                color: section.color,
                icon: section.icon,
                order: section.order,
                isActive: section.isActive ?? true,
                translations: {
                  create: section.translations.map((t) => ({
                    locale: t.locale,
                    title: t.title ?? "",
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
                        title: t.title ?? "",
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

        // 2. Skills
        if (skills) {
          await tx.cVSkill.deleteMany({ where: { cvId: cv.id } });
          for (const skill of skills) {
            await tx.cVSkill.create({
              data: {
                cvId: cv.id,
                category: skill.category,
                level: skill.level,
                showAsBar: skill.showAsBar,
                order: skill.order,
                isActive: skill.isActive ?? true,
                translations: {
                  create: skill.translations.map((t) => ({
                    locale: t.locale,
                    name: t.name ?? "",
                  })),
                },
              },
            });
          }
        }

        // 3. Social Links
        if (socialLinks) {
          await tx.cVSocialLink.deleteMany({ where: { cvId: cv.id } });
          for (const link of socialLinks) {
            await tx.cVSocialLink.create({
              data: {
                cvId: cv.id,
                platform: link.platform,
                url: link.url,
                label: link.label,
                order: link.order,
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
