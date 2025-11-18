import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const IMAGE_BASE = '/Users/yoannandrieux/Projets/synck/public';

// Normaliser le nom de fichier (même logique que le script de renommage)
function normalizeFileName(fileName: string): string {
  const ext = path.extname(fileName);
  let baseName = fileName.replace(/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i, '');

  baseName = baseName
    .toLowerCase()
    .replace(/[\s_\.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseName}.jpg`;
}

// Normaliser un chemin complet d'image
function normalizePath(oldPath: string): string {
  const parts = oldPath.split('/');
  const fileName = parts[parts.length - 1];
  const normalizedFileName = normalizeFileName(fileName);
  parts[parts.length - 1] = normalizedFileName;
  return parts.join('/');
}

async function main() {
  console.log('\n🔧 CORRECTION DES CHEMINS D\'IMAGES DANS LA BDD\n');

  // Récupérer tous les assets avec chemins problématiques
  const assets = await prisma.asset.findMany({
    include: {
      workCover: {
        include: {
          translations: {
            where: { locale: 'fr' }
          }
        }
      }
    }
  });

  console.log(`📊 ${assets.length} assets trouvés\n`);
  console.log('='.repeat(80) + '\n');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const asset of assets) {
    const oldPath = asset.path;
    const normalizedPath = normalizePath(oldPath);

    // Si le chemin est déjà normalisé, skip
    if (oldPath === normalizedPath) {
      skipped++;
      continue;
    }

    // Vérifier si le fichier normalisé existe
    const fullPath = path.join(IMAGE_BASE, normalizedPath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Fichier normalisé introuvable:`);
      console.log(`   Ancien: ${oldPath}`);
      console.log(`   Nouveau: ${normalizedPath}`);
      console.log('');
      errors++;
      continue;
    }

    // Mettre à jour le chemin dans la BDD
    try {
      await prisma.asset.update({
        where: { id: asset.id },
        data: { path: normalizedPath }
      });

      // Afficher les works concernés
      if (asset.workCover.length > 0) {
        const titles = asset.workCover.map(w => w.translations[0]?.title || w.slug).join(', ');
        console.log(`✅ Mis à jour: "${titles}"`);
        console.log(`   ${oldPath}`);
        console.log(`   → ${normalizedPath}\n`);
      }

      updated++;
    } catch (error) {
      console.error(`❌ Erreur pour ${oldPath}:`, error);
      errors++;
    }
  }

  console.log('='.repeat(80));
  console.log(`\n📊 RÉSUMÉ:`);
  console.log(`   ✅ ${updated} chemins mis à jour`);
  console.log(`   ⏭️  ${skipped} déjà corrects`);
  console.log(`   ❌ ${errors} erreurs`);
  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Erreur fatale:', error);
  prisma.$disconnect();
  process.exit(1);
});
