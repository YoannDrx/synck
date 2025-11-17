import { prisma } from './prisma'
import { cache } from 'react'
import type { Prisma } from '@prisma/client'
import type { Locale } from './i18n-config'

export interface GalleryWork {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  coverImage: string;
  coverImageAlt: string;
  composers: string[];
}

// Cache the portfolio data fetch for deduplication
export const getPortfolioWorksFromPrisma = cache(async (locale: Locale): Promise<GalleryWork[]> => {
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
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    })

    // Transform Prisma data to GalleryWork format
    const galleryWorks: GalleryWork[] = works.map((work) => {
      const translation = work.translations[0]
      const categoryTranslation = work.category.translations[0]

      return {
        id: work.id,
        slug: work.slug,
        title: translation?.title || work.slug,
        subtitle: translation?.description || undefined,
        category: categoryTranslation?.name || 'Autres',
        coverImage: work.coverImage?.path || '/images/placeholder.jpg',
        coverImageAlt: work.coverImage?.alt || translation?.title || work.slug,
        composers: work.contributions.map((contrib) => {
          const composerTranslation = contrib.composer.translations[0]
          return composerTranslation?.name || ''
        }),
      }
    })

    return galleryWorks
  } catch (error) {
    console.error('Error fetching portfolio works from Prisma:', error)
    return []
  }
})

// Get all categories with translations
export const getPortfolioCategoriesFromPrisma = cache(async (locale: Locale) => {
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
        order: 'asc',
      },
    })

    return categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.translations[0]?.name || cat.slug,
      color: cat.color,
    }))
  } catch (error) {
    console.error('Error fetching categories from Prisma:', error)
    return []
  }
})

// Get a single work by slug with full details
export const getWorkBySlug = cache(async (slug: string, locale: Locale) => {
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
            order: 'asc',
          },
        },
      },
    })

    return work
  } catch (error) {
    console.error(`Error fetching work ${slug} from Prisma:`, error)
    return null
  }
})

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
    })

    return works.map((work) => work.slug)
  } catch (error) {
    console.error('Error fetching work slugs:', error)
    return []
  }
}

// ============================================
// COMPOSERS / ARTISTS
// ============================================

export interface GalleryComposer {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
  externalUrl?: string;
  worksCount: number;
}

export type ComposerWithContributions = Prisma.ComposerGetPayload<{
  include: {
    translations: {
      where: {
        locale: Locale;
      };
    };
    image: true;
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
        order: 'asc';
      };
    };
  };
}>;

// Get all composers with translations
export const getComposersFromPrisma = cache(async (locale: Locale): Promise<GalleryComposer[]> => {
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
        order: 'asc',
      },
    })

    return composers.map((composer) => {
      const translation = composer.translations[0]
      return {
        id: composer.id,
        slug: composer.slug,
        name: translation?.name || composer.slug,
        bio: translation?.bio || undefined,
        image: composer.image?.path || undefined,
        imageAlt: composer.image?.alt || translation?.name || composer.slug,
        externalUrl: composer.externalUrl || undefined,
        worksCount: composer.contributions.length,
      }
    })
  } catch (error) {
    console.error('Error fetching composers from Prisma:', error)
    return []
  }
})

// Get a single composer by slug with full details
export const getComposerBySlug = cache(async (slug: string, locale: Locale): Promise<ComposerWithContributions | null> => {
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
            order: 'asc',
          },
        },
      },
    })

    return composer
  } catch (error) {
    console.error(`Error fetching composer ${slug} from Prisma:`, error)
    return null
  }
})

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
    })

    return composers.map((composer) => composer.slug)
  } catch (error) {
    console.error('Error fetching composer slugs:', error)
    return []
  }
}
