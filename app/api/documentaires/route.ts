 

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') ?? 'fr';
    const labelSlug = searchParams.get('label'); // Filter by label (optional)

    // Récupérer tous les documentaires
    const works = await prisma.work.findMany({
      where: {
        isActive: true,
        category: {
          slug: 'documentaire'
        },
        ...(labelSlug && {
          label: {
            slug: labelSlug
          }
        })
      },
      include: {
        label: {
          include: {
            translations: {
              where: { locale }
            }
          }
        },
        coverImage: true,
        translations: {
          where: { locale }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Transformer les données pour le format attendu par le composant
    const documentaires = works.map(work => {
      const translation = work.translations[0];
      const labelTranslation = work.label?.translations[0];

      return {
        title: translation?.title ?? work.slug,
        subtitle: labelTranslation?.name ?? work.label?.slug ?? '',
        href: work.coverImage?.path ?? '',
        src: work.coverImage?.path ?? '',
        srcLg: work.coverImage?.path ?? '',
        link: translation?.description ?? '', // Le lien externe est stocké dans description
        category: work.label?.slug ?? 'autre',
        height: ''
      };
    });

    return NextResponse.json(documentaires);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch documentaires' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
