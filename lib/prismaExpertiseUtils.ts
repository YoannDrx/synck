import { prisma } from "./prisma";
import { cache } from "react";
import matter from "gray-matter";
import type { Prisma } from "@prisma/client";
import type { Locale } from "./i18n-config";

export type Label = {
  name: string;
  src: string;
  href: string;
};

export type Documentaire = {
  title: string;
  subtitle: string;
  href: string;
  src: string;
  srcLg: string;
  link: string;
  category: string;
  productionCompanies?: string[]; // Array pour gérer les co-productions
  height?: string;
};

export type SectionLayout = {
  image?: string | null;
  position?: "left" | "right" | "auto";
};

export type SupportLink = {
  title: string;
  url: string;
};

export type Support = {
  name: string;
  logo: string;
  description: string;
  links: SupportLink[];
};

export type ProductionCompany = {
  name: string;
  logo: string;
  description: string;
  website?: string;
};

export type ExpertiseListItem = {
  id: string;
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  imgHome: string;
  description: string;
};

export type Expertise = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  sections: string[];
  imgHome: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  imgFooter?: string;
  img2Link?: string;
  img3Link?: string;
  img4Link?: string;
  img5Link?: string;
  labels?: Label[];
  documentaires?: Documentaire[];
  sectionsLayout?: SectionLayout[];
  supports?: Support[];
  productionCompanies?: ProductionCompany[];
};

export type ExpertiseWithDetails = Prisma.ExpertiseGetPayload<{
  include: {
    translations: {
      where: {
        locale: Locale;
      };
    };
    coverImage: true;
    images: true;
  };
}>;

/**
 * Convert asset path from storage format to Next.js Image src format
 * Example: "public/images/foo.jpg" -> "/images/foo.jpg"
 */
function assetPathToImageSrc(path: string): string {
  return path.replace(/^public/, "");
}

/**
 * Get all expertise items for a locale (metadata only)
 */
export const getAllExpertises = cache(
  async (locale: Locale): Promise<ExpertiseListItem[]> => {
    try {
      const expertises = await prisma.expertise.findMany({
        where: {
          isActive: true,
        },
        include: {
          translations: {
            where: {
              locale,
            },
          },
          coverImage: true,
        },
        orderBy: {
          order: "asc",
        },
      });

      return expertises.map((expertise) => {
        const translation = expertise.translations[0];

        return {
          id: expertise.id,
          slug: expertise.slug,
          href: `/${locale}/expertises/${expertise.slug}`,
          title: translation?.title ?? expertise.slug,
          subtitle: translation?.description ?? "",
          imgHome: expertise.coverImage
            ? assetPathToImageSrc(expertise.coverImage.path)
            : "/images/placeholder.jpg",
          description: translation?.description ?? "",
        };
      });
    } catch {
      return [];
    }
  },
);

/**
 * Parse additional metadata from markdown content (labels, documentaires, image links)
 */
function parseExpertiseMetadataFromContent(content: string): {
  labels?: Label[];
  documentaires?: Documentaire[];
  supports?: Support[];
  productionCompanies?: ProductionCompany[];
  img2Link?: string;
  img3Link?: string;
  img4Link?: string;
  img5Link?: string;
  imgFooter?: string;
} {
  try {
    // Use gray-matter to parse the frontmatter
    const { data } = matter(content);

    // Map data to expected types
    const result: {
      labels?: Label[];
      documentaires?: Documentaire[];
      supports?: Support[];
      productionCompanies?: ProductionCompany[];
      img2Link?: string;
      img3Link?: string;
      img4Link?: string;
      img5Link?: string;
      imgFooter?: string;
    } = {
      img2Link: data.img2Link,
      img3Link: data.img3Link,
      img4Link: data.img4Link,
      img5Link: data.img5Link,
      imgFooter: data.imgFooter,
    };

    if (data.labels && Array.isArray(data.labels)) {
      result.labels = data.labels.map((l: any) => ({
        name: l.name,
        src: l.src,
        href: l.href || "",
      }));
    }

    if (data.documentaires && Array.isArray(data.documentaires)) {
      result.documentaires = data.documentaires.map((d: any) => ({
        title: d.title,
        subtitle: d.subtitle,
        href: d.href,
        src: d.src,
        srcLg: d.srcLg,
        link: d.link,
        category: d.category,
        height: d.height ? String(d.height) : undefined,
      }));
    }

    if (data.supports && Array.isArray(data.supports)) {
      result.supports = data.supports.map((s: any) => ({
        name: s.name,
        logo: s.logo,
        description: s.description,
        links: Array.isArray(s.links) ? s.links : [],
      }));
    }

    if (data.productionCompanies && Array.isArray(data.productionCompanies)) {
      result.productionCompanies = data.productionCompanies.map((c: any) => ({
        name: c.name,
        logo: c.logo,
        description: c.description,
        website: c.website,
      }));
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Get documentaires from Prisma database
 */
async function getDocumentairesFromPrisma(
  locale: Locale,
): Promise<Documentaire[]> {
  try {
    const works = await prisma.work.findMany({
      where: {
        isActive: true,
        category: {
          slug: "documentaire",
        },
      },
      include: {
        coverImage: true,
        category: {
          include: {
            translations: {
              where: { locale },
            },
          },
        },
        label: true,
        translations: {
          where: { locale },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return works.map((work) => {
      const translation = work.translations[0];
      const categoryTranslation = work.category.translations[0];
      const imagePath = work.coverImage
        ? assetPathToImageSrc(work.coverImage.path)
        : "/images/placeholder.jpg";

      // Récupérer les sociétés de production depuis le champ JSON
      const productionCompanies =
        work.productionCompanySlugs &&
        Array.isArray(work.productionCompanySlugs)
          ? (work.productionCompanySlugs as string[])
          : undefined;

      // Map category to the first production company slug if available, to enable filtering in the gallery
      // The gallery component uses 'category' field to create the tabs (e.g. "13-prods", "little-big-story")
      const category =
        productionCompanies && productionCompanies.length > 0
          ? productionCompanies[0]
          : categoryTranslation?.name ?? "Documentaire";

      return {
        title: translation?.title ?? work.slug,
        subtitle: translation?.subtitle ?? "",
        href: `/${locale}/projets/${work.slug}`,
        src: imagePath,
        srcLg: imagePath,
        link: work.youtubeUrl ?? work.externalUrl ?? "",
        category: category,
        productionCompanies,
        year: work.year ?? undefined,
        height: undefined,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Get a single expertise by slug with full content
 */
export const getExpertise = cache(
  async (slug: string, locale: Locale): Promise<Expertise | null> => {
    try {
      const expertise = await prisma.expertise.findUnique({
        where: { slug },
        include: {
          translations: {
            where: {
              locale,
            },
          },
          coverImage: true,
          images: {
            orderBy: {
              path: "asc", // Les images sont triées par nom de fichier
            },
          },
        },
      });

      if (!expertise) {
        return null;
      }

      const translation = expertise.translations[0];
      if (!translation) {
        return null;
      }

      // Strip frontmatter if present (since it's stored in the content)
      const contentWithoutFrontmatter = translation.content.replace(/^---\n[\s\S]*?\n---\n/, "");

      // Split markdown content into sections
      const sections = splitMarkdownIntoSections(contentWithoutFrontmatter);

      // Parse additional metadata from markdown content
      const metadata = parseExpertiseMetadataFromContent(translation.content);

      // Get documentaires from Prisma database
      const documentairesFromPrisma = await getDocumentairesFromPrisma(locale);

      // Build image mapping from the images array
      // Les images sont stockées dans l'ordre: img1, img2, img3, img4, img5, imgFooter
      const allImages = expertise.images.map((img) =>
        assetPathToImageSrc(img.path),
      );
      const imgHome = expertise.coverImage
        ? assetPathToImageSrc(expertise.coverImage.path)
        : "/images/placeholder.jpg";

      return {
        id: expertise.id,
        slug: expertise.slug,
        title: translation.title,
        description: translation.description ?? "",
        content: translation.content,
        sections,
        imgHome,
        img1: allImages[0] ?? undefined,
        img2: allImages[1] ?? undefined,
        img3: allImages[2] ?? undefined,
        img4: allImages[3] ?? undefined,
        img5: allImages[4] ?? undefined,
        imgFooter: metadata.imgFooter ?? undefined,
        img2Link: metadata.img2Link,
        img3Link: metadata.img3Link,
        img4Link: metadata.img4Link,
        img5Link: metadata.img5Link,
        labels: metadata.labels,
        documentaires: documentairesFromPrisma,
        supports: metadata.supports,
        productionCompanies: metadata.productionCompanies,
        sectionsLayout: undefined,
      };
    } catch {
      return null;
    }
  },
);

/**
 * Split markdown content into sections
 */
function splitMarkdownIntoSections(markdownContent: string): string[] {
  const sectionDelimiter = "<!-- section:end -->";
  return markdownContent
    .split(sectionDelimiter)
    .map((section) =>
      section
        .replace("<!-- section:start -->", "")
        .replace("<!-- section:end -->", "")
        .trim(),
    )
    .filter((section) => section.length > 0);
}

/**
 * Get all expertise slugs for static generation
 */
export async function getAllExpertiseSlugs(): Promise<string[]> {
  try {
    const expertises = await prisma.expertise.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
      },
    });

    return expertises.map((expertise) => expertise.slug);
  } catch {
    return [];
  }
}

/**
 * Get section layout configuration for a specific section
 * Falls back to imgN if sectionsLayout is not defined
 */
export function getSectionLayout(
  expertise: Expertise,
  sectionIndex: number,
): SectionLayout {
  // If sectionsLayout is defined, use it
  if (expertise.sectionsLayout?.[sectionIndex]) {
    const layout = expertise.sectionsLayout[sectionIndex];

    // Resolve image path: if it's a key (like "img1"), get the actual path
    let resolvedImage: string | null = null;

    if (layout.image) {
      // Check if it's a path (starts with /) or a key (like "img1")
      if (layout.image.startsWith("/")) {
        resolvedImage = layout.image;
      } else {
        // It's a key, resolve it from the expertise object
        const imageKey = layout.image as keyof Expertise;
        resolvedImage = (expertise[imageKey] as string) ?? null;
      }
    }

    return {
      image: resolvedImage,
      position: layout.position ?? "auto",
    };
  }

  // Fallback: use img1-5 with auto alternation
  const imageKey = `img${String(sectionIndex + 1)}` as keyof Expertise;
  const image = expertise[imageKey] as string | undefined;

  return {
    image: image ?? null,
    position: "auto",
  };
}
