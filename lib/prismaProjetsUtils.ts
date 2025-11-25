import { prisma } from "./prisma";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import type { Locale } from "./i18n-config";

/**
 * Transforme un chemin filesystem (public/images/...) en URL (/images/...)
 * pour le composant Next.js Image
 */
function assetPathToUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  // Si le chemin commence par 'public/', on retire ce préfixe
  if (path.startsWith("public/")) {
    return `/${path.substring("public/".length)}`;
  }
  // Si le chemin commence déjà par '/', on le retourne tel quel
  if (path.startsWith("/")) {
    return path;
  }
  // Sinon, on ajoute '/' au début
  return `/${path}`;
}

export type GalleryWork = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  categorySlug: string;
  coverImage: string;
  coverImageAlt: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  coverImageAspectRatio?: number;
  coverImageBlurDataUrl?: string;
  composers: string[];
  externalUrl?: string;
  youtubeUrl?: string;
  year?: number;
};

// Cache the projets data fetch for deduplication
export const getProjetsFromPrisma = cache(
  async (locale: Locale): Promise<GalleryWork[]> => {
    try {
      const works = await prisma.work.findMany({
        where: {
          isActive: true,
        },
        include: {
          category: {
            include: {
              translations: {
                where: {
                  locale,
                },
              },
            },
          },
          coverImage: true,
          translations: {
            where: {
              locale,
            },
          },
          contributions: {
            include: {
              composer: {
                include: {
                  translations: {
                    where: {
                      locale,
                    },
                  },
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      // Transform Prisma data to GalleryWork format
      const galleryWorks: GalleryWork[] = works.map((work) => {
        const translation = work.translations[0];
        const categoryTranslation = work.category.translations[0];

        return {
          id: work.id,
          slug: work.slug,
          title: translation?.title ?? work.slug,
          subtitle: translation?.subtitle ?? undefined,
          category: categoryTranslation?.name ?? "Autres",
          categorySlug: work.category.slug,
          coverImage:
            assetPathToUrl(work.coverImage?.path) ?? "/images/placeholder.jpg",
          coverImageAlt:
            work.coverImage?.alt ?? translation?.title ?? work.slug,
          coverImageWidth: work.coverImage?.width ?? undefined,
          coverImageHeight: work.coverImage?.height ?? undefined,
          coverImageAspectRatio: work.coverImage?.aspectRatio ?? undefined,
          coverImageBlurDataUrl: work.coverImage?.blurDataUrl ?? undefined,
          composers: work.contributions.map((contrib) => {
            const composerTranslation = contrib.composer.translations[0];
            return composerTranslation?.name ?? "";
          }),
          externalUrl: work.externalUrl ?? undefined,
          youtubeUrl: work.youtubeUrl ?? undefined,
          year: work.year ?? undefined,
        };
      });

      return galleryWorks;
    } catch {
      return [];
    }
  },
);

// Get all categories with translations
export const getProjetsCategoriesFromPrisma = cache(async (locale: Locale) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        translations: {
          where: {
            locale,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.translations[0]?.name || cat.slug,
      color: cat.color,
    }));
  } catch {
    return [];
  }
});

export type WorkImage = Prisma.AssetGetPayload<{
  select: {
    id: true;
    path: true;
    alt: true;
    blurDataUrl: true;
    width: true;
    height: true;
    aspectRatio: true;
  };
}>;

export type WorkContribution = Prisma.ContributionGetPayload<{
  include: {
    composer: {
      include: {
        translations: {
          where: {
            locale: Locale;
          };
        };
        image: true;
      };
    };
  };
}>;

export type WorkWithDetails = Prisma.WorkGetPayload<{
  include: {
    category: {
      include: {
        translations: {
          where: {
            locale: Locale;
          };
        };
      };
    };
    label: {
      include: {
        translations: {
          where: {
            locale: Locale;
          };
        };
      };
    };
    coverImage: true;
    images: true;
    translations: {
      where: {
        locale: Locale;
      };
    };
    contributions: {
      include: {
        composer: {
          include: {
            translations: {
              where: {
                locale: Locale;
              };
            };
            image: true;
          };
        };
      };
      orderBy: {
        order: "asc";
      };
    };
  };
}>;

// Get a single work by slug with full details
export const getWorkBySlug = cache(
  async (slug: string, locale: Locale): Promise<WorkWithDetails | null> => {
    try {
      const work = await prisma.work.findUnique({
        where: { slug },
        include: {
          category: {
            include: {
              translations: {
                where: {
                  locale,
                },
              },
            },
          },
          label: {
            include: {
              translations: {
                where: {
                  locale,
                },
              },
            },
          },
          coverImage: true,
          images: true,
          translations: {
            where: {
              locale,
            },
          },
          contributions: {
            include: {
              composer: {
                include: {
                  translations: {
                    where: {
                      locale,
                    },
                  },
                  image: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return work;
    } catch {
      return null;
    }
  },
);

// Get all work slugs for generateStaticParams
export async function getAllWorkSlugs(): Promise<string[]> {
  try {
    const works = await prisma.work.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
      },
    });

    return works.map((work) => work.slug);
  } catch {
    return [];
  }
}

// ============================================
// COMPOSERS / ARTISTS
// ============================================

export type GalleryComposer = {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
  externalUrl?: string;
  worksCount: number;
};

export type ComposerWithContributions = Prisma.ComposerGetPayload<{
  include: {
    translations: {
      where: {
        locale: Locale;
      };
    };
    image: true;
    links: {
      orderBy: {
        order: "asc";
      };
    };
    contributions: {
      where: {
        work: {
          isActive: true;
        };
      };
      include: {
        work: {
          include: {
            coverImage: true;
            translations: {
              where: {
                locale: Locale;
              };
            };
            category: {
              include: {
                translations: {
                  where: {
                    locale: Locale;
                  };
                };
              };
            };
          };
        };
      };
      orderBy: {
        order: "asc";
      };
    };
  };
}>;

// Get all composers with translations
// NOTE: cache() is used for performance. If image paths appear incorrect after DB changes,
// restart the dev server to clear React's in-memory cache.
export const getComposersFromPrisma = cache(
  async (locale: Locale): Promise<GalleryComposer[]> => {
    try {
      const composers = await prisma.composer.findMany({
        where: {
          isActive: true,
        },
        include: {
          translations: {
            where: {
              locale,
            },
          },
          image: true,
          contributions: {
            where: {
              work: {
                isActive: true,
              },
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      return composers.map((composer) => {
        const translation = composer.translations[0];
        return {
          id: composer.id,
          slug: composer.slug,
          name: translation?.name ?? composer.slug,
          bio: translation?.bio ?? undefined,
          image: assetPathToUrl(composer.image?.path),
          imageAlt: composer.image?.alt ?? translation?.name ?? composer.slug,
          externalUrl: composer.externalUrl ?? undefined,
          worksCount: composer.contributions.length,
        };
      });
    } catch {
      return [];
    }
  },
);

// Get a single composer by slug with full details
export const getComposerBySlug = cache(
  async (
    slug: string,
    locale: Locale,
  ): Promise<ComposerWithContributions | null> => {
    try {
      const composer = await prisma.composer.findUnique({
        where: { slug },
        include: {
          translations: {
            where: {
              locale,
            },
          },
          image: true,
          links: {
            orderBy: {
              order: "asc",
            },
          },
          contributions: {
            where: {
              work: {
                isActive: true,
              },
            },
            include: {
              work: {
                include: {
                  coverImage: true,
                  translations: {
                    where: {
                      locale,
                    },
                  },
                  category: {
                    include: {
                      translations: {
                        where: {
                          locale,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      return composer;
    } catch {
      return null;
    }
  },
);

// Get all composer slugs for generateStaticParams
export async function getAllComposerSlugs(): Promise<string[]> {
  try {
    const composers = await prisma.composer.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
      },
    });

    return composers.map((composer) => composer.slug);
  } catch {
    return [];
  }
}
