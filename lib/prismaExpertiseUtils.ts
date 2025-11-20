import { prisma } from "./prisma";
import { cache } from "react";
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
 * Parse additional metadata from markdown file (labels, documentaires, image links)
 */
async function parseExpertiseMetadata(
  slug: string,
  locale: Locale,
): Promise<{
  labels?: Label[];
  documentaires?: Documentaire[];
  supports?: Support[];
  productionCompanies?: ProductionCompany[];
  img2Link?: string;
  img3Link?: string;
  img4Link?: string;
  img5Link?: string;
  imgFooter?: string;
}> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "content",
      "expertises",
      locale,
      `${slug}.md`,
    );

    if (!fs.existsSync(filePath)) {
      return {};
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(fileContent);

    if (!frontmatterMatch) {
      return {};
    }

    const frontmatterStr = frontmatterMatch[1];
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
    } = {};

    // Extract image links
    const img2LinkMatch = /img2Link:\s*['"](.+)['"]/.exec(frontmatterStr);
    const img3LinkMatch = /img3Link:\s*['"](.+)['"]/.exec(frontmatterStr);
    const img4LinkMatch = /img4Link:\s*['"](.+)['"]/.exec(frontmatterStr);
    const img5LinkMatch = /img5Link:\s*['"](.+)['"]/.exec(frontmatterStr);

    if (img2LinkMatch) result.img2Link = img2LinkMatch[1];
    if (img3LinkMatch) result.img3Link = img3LinkMatch[1];
    if (img4LinkMatch) result.img4Link = img4LinkMatch[1];
    if (img5LinkMatch) result.img5Link = img5LinkMatch[1];

    // Extract imgFooter (can be with or without quotes, and can be empty string)
    const imgFooterMatch = /imgFooter:\s*(['"]?)([^'"\n]*)(['"]?)/.exec(
      frontmatterStr,
    );
    if (imgFooterMatch) {
      const footerValue = imgFooterMatch[2].trim();
      // Only set imgFooter if it's not empty
      if (footerValue && footerValue !== "") {
        result.imgFooter = footerValue;
      }
    }

    // Parse labels array (for sous-edition)
    // Labels are formatted as: - { name: "...", src: "...", href: "..." }
    const labelsSection = /labels:\s*\n([\s\S]+)$/.exec(frontmatterStr);
    if (labelsSection) {
      const labelsStr = labelsSection[1];
      // Match with optional dash and whitespace before the brace
      const labelMatches = labelsStr.matchAll(
        /-?\s*\{\s*name:\s*"([^"]+)",\s*src:\s*"([^"]+)",\s*href:\s*"([^"]*)"\s*\}/g,
      );
      result.labels = Array.from(labelMatches).map((match) => ({
        name: match[1],
        src: match[2],
        href: match[3],
      }));
    }

    // Parse documentaires array (for gestion-admin)
    const documentairesSection = /documentaires:\s*\n([\s\S]+)$/.exec(
      frontmatterStr,
    );
    if (documentairesSection) {
      const docsStr = documentairesSection[1];
      const docEntries = docsStr.split(/\n\s*-\s*title:/).filter(Boolean);

      result.documentaires = docEntries.map((entry, index) => {
        // For the first entry, strip the leading "- title:" prefix if present
        let cleanEntry = entry;
        if (index === 0) {
          cleanEntry = entry.replace(/^\s*-\s*title:\s*/, "");
        }

        const titleMatch = /(.+)/.exec(cleanEntry);
        const subtitleMatch = /subtitle:\s*(.+)/.exec(cleanEntry);
        const hrefMatch = /href:\s*(?:>-\s*)?(.+)/.exec(cleanEntry);
        const srcMatch = /(?:^|\n)\s*src:\s*(?:>-\s*)?(.+)/.exec(cleanEntry);
        const srcLgMatch = /srcLg:\s*(?:>-\s*)?(.+)/.exec(cleanEntry);
        const linkMatch = /link:\s*['"](.+)['"]/.exec(cleanEntry);
        const categoryMatch = /category:\s*(.+)/.exec(cleanEntry);
        const heightMatch = /height:\s*['"](.*)['"]/.exec(cleanEntry);

        return {
          title: titleMatch ? titleMatch[1].trim() : "",
          subtitle: subtitleMatch ? subtitleMatch[1].trim() : "",
          href: hrefMatch ? hrefMatch[1].trim() : "",
          src: srcMatch ? srcMatch[1].trim() : "",
          srcLg: srcLgMatch ? srcLgMatch[1].trim() : "",
          link: linkMatch ? linkMatch[1].trim() : "",
          category: categoryMatch ? categoryMatch[1].trim() : "",
          height: heightMatch ? heightMatch[1].trim() : undefined,
        };
      });
    }

    // Parse supports array (for dossier-subvention)
    const supportsSection = /supports:\s*\n([\s\S]+?)(?=\n\w+:|$)/.exec(
      frontmatterStr,
    );
    if (supportsSection) {
      const supportsStr = supportsSection[1];
      const supportEntries = supportsStr
        .split(/\n\s*-\s*name:/)
        .filter(Boolean);

      result.supports = supportEntries.map((entry, index) => {
        // For the first entry, strip the leading "- name:" prefix if present
        let cleanEntry = entry;
        if (index === 0) {
          cleanEntry = entry.replace(/^\s*-\s*name:\s*/, "");
        }

        // Extract name - handle quoted strings properly
        const nameMatch =
          /^['"](.+?)['"]/.exec(cleanEntry) ?? /^([^\n:]+)/.exec(cleanEntry);
        const logoMatch = /logo:\s*(.+)/.exec(cleanEntry);
        const descriptionMatch =
          /description:\s*['"]([\s\S]+?)['"](?=\s*links:|\s*$)/.exec(
            cleanEntry,
          );

        // Parse links array within this support entry
        const linksSection = /links:\s*\n([\s\S]+?)(?=\n\s*-\s*name:|$)/.exec(
          cleanEntry,
        );
        const links: SupportLink[] = [];

        if (linksSection) {
          const linksStr = linksSection[1];
          const linkMatches = linksStr.matchAll(
            /-\s*title:\s*['"](.+?)['"]\s*url:\s*['"](.+?)['"]/g,
          );
          links.push(
            ...Array.from(linkMatches).map((match) => ({
              title: match[1],
              url: match[2],
            })),
          );
        }

        return {
          name: nameMatch ? nameMatch[1].trim() : "",
          logo: logoMatch ? logoMatch[1].trim() : "",
          description: descriptionMatch ? descriptionMatch[1].trim() : "",
          links,
        };
      });
    }

    // Parse productionCompanies array (for gestion-administrative-et-editoriale)
    const productionCompaniesSection =
      /productionCompanies:\s*\n([\s\S]+?)(?=\n\w+:|$)/.exec(frontmatterStr);
    if (productionCompaniesSection) {
      const companiesStr = productionCompaniesSection[1];
      const companyEntries = companiesStr
        .split(/\n\s*-\s*name:/)
        .filter(Boolean);

      result.productionCompanies = companyEntries.map((entry, index) => {
        // For the first entry, strip the leading "- name:" prefix if present
        let cleanEntry = entry;
        if (index === 0) {
          cleanEntry = entry.replace(/^\s*-\s*name:\s*/, "");
        }

        // Extract name - handle quoted strings properly
        const nameMatch =
          /^['"](.+?)['"]/.exec(cleanEntry) ?? /^([^\n:]+)/.exec(cleanEntry);
        const logoMatch = /logo:\s*(.+)/.exec(cleanEntry);
        const descriptionMatch =
          /description:\s*['"]([\s\S]+?)['"](?=\s*website:|\s*$)/.exec(
            cleanEntry,
          );
        const websiteMatch = /website:\s*['"](.+?)['"]/.exec(cleanEntry);

        return {
          name: nameMatch ? nameMatch[1].trim() : "",
          logo: logoMatch ? logoMatch[1].trim() : "",
          description: descriptionMatch ? descriptionMatch[1].trim() : "",
          website: websiteMatch ? websiteMatch[1].trim() : undefined,
        };
      });
    }

    return result;
  } catch {
    return {};
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

      // Split markdown content into sections
      const sections = splitMarkdownIntoSections(translation.content);

      // Parse additional metadata from markdown file
      const metadata = await parseExpertiseMetadata(slug, locale);

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
        documentaires: metadata.documentaires,
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
