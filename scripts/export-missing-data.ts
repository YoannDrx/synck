import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportMissingData() {
  const metadataFr = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'content/projets/fr/metadata.json'), 'utf8')
  );
  
  const slugsInJSON = new Set(metadataFr.map((w: any) => w.slug));
  
  const missingWorks = await prisma.work.findMany({
    where: {
      slug: {
        notIn: Array.from(slugsInJSON)
      }
    },
    include: {
      translations: true,
      category: {
        include: {
          translations: true
        }
      },
      label: {
        include: {
          translations: true
        }
      },
      coverImage: true,
      images: true,
      contributions: {
        include: {
          composer: {
            include: {
              translations: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: {
      slug: 'asc'
    }
  });
  
  const exportData = {
    totalMissing: missingWorks.length,
    exported: new Date().toISOString(),
    works: missingWorks.map(work => ({
      slug: work.slug,
      titleFr: work.translations.find(t => t.locale === 'fr')?.title,
      titleEn: work.translations.find(t => t.locale === 'en')?.title,
      descriptionFr: work.translations.find(t => t.locale === 'fr')?.description,
      descriptionEn: work.translations.find(t => t.locale === 'en')?.description,
      roleFr: work.translations.find(t => t.locale === 'fr')?.role,
      roleEn: work.translations.find(t => t.locale === 'en')?.role,
      category: {
        slug: work.category.slug,
        nameFr: work.category.translations.find(t => t.locale === 'fr')?.name,
        nameEn: work.category.translations.find(t => t.locale === 'en')?.name
      },
      label: work.label ? {
        slug: work.label.slug,
        nameFr: work.label.translations.find(t => t.locale === 'fr')?.name,
        nameEn: work.label.translations.find(t => t.locale === 'en')?.name
      } : null,
      year: work.year,
      duration: work.duration,
      releaseDate: work.releaseDate,
      genre: work.genre,
      isrcCode: work.isrcCode,
      spotifyUrl: work.spotifyUrl,
      externalUrl: work.externalUrl,
      coverImage: work.coverImage ? {
        path: work.coverImage.path,
        alt: work.coverImage.alt,
        width: work.coverImage.width,
        height: work.coverImage.height
      } : null,
      images: work.images.map(img => ({
        path: img.path,
        alt: img.alt,
        width: img.width,
        height: img.height
      })),
      composers: work.contributions.map(contrib => ({
        name: contrib.composer.translations.find(t => t.locale === 'fr')?.name,
        role: contrib.role,
        order: contrib.order
      })),
      order: work.order,
      isActive: work.isActive,
      isFeatured: work.isFeatured
    }))
  };
  
  const outputPath = path.join(process.cwd(), 'scripts/missing-works-export.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  
  console.log('Export terminé:', outputPath);
  console.log('Total works manquants exportés:', exportData.totalMissing);
  
  const composerLinks = await prisma.composer.findMany({
    where: {
      OR: [
        { links: { some: {} } },
        { externalUrl: { not: null } }
      ]
    },
    include: {
      translations: true,
      links: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });
  
  const composerLinksExport = {
    totalComposersWithLinks: composerLinks.length,
    exported: new Date().toISOString(),
    composers: composerLinks.map(comp => ({
      slug: comp.slug,
      name: comp.translations.find(t => t.locale === 'fr')?.name,
      externalUrl: comp.externalUrl,
      links: comp.links.map(link => ({
        platform: link.platform,
        url: link.url,
        label: link.label,
        order: link.order
      }))
    }))
  };
  
  const linksOutputPath = path.join(process.cwd(), 'scripts/composer-links-export.json');
  fs.writeFileSync(linksOutputPath, JSON.stringify(composerLinksExport, null, 2));
  
  console.log('Export liens compositeurs:', linksOutputPath);
  console.log('Total compositeurs avec liens:', composerLinksExport.totalComposersWithLinks);
  
  await prisma.$disconnect();
}

exportMissingData().catch(console.error);
