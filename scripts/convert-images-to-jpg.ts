import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const PORTFOLIO_BASE = '/Users/yoannandrieux/Projets/synck/public/images/portfolio';

interface ConversionResult {
  originalPath: string;
  newPath: string;
  originalFormat: string;
  originalSize: number;
  newSize: number;
  success: boolean;
  error?: string;
}

async function convertImagesToJpg(dryRun: boolean = true) {
  console.log('\n🔄 CONVERSION DES IMAGES EN .JPG\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (simulation)' : '✅ EXÉCUTION RÉELLE'}\n`);
  console.log('='.repeat(80) + '\n');

  const results: ConversionResult[] = [];
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  // Fonction récursive pour trouver tous les fichiers à convertir
  function findImagesToConvert(dir: string, results: string[] = []): string[] {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findImagesToConvert(fullPath, results);
      } else if (/\.(png|jpeg|PNG|JPEG)$/i.test(item) && !item.endsWith('.jpg')) {
        results.push(fullPath);
      }
    }

    return results;
  }

  console.log('🔍 Recherche des images à convertir...\n');
  const imagesToConvert = findImagesToConvert(PORTFOLIO_BASE);

  console.log(`📊 ${imagesToConvert.length} images à convertir\n`);

  if (imagesToConvert.length === 0) {
    console.log('✅ Aucune image à convertir ! Toutes les images sont déjà au format .jpg\n');
    await prisma.$disconnect();
    return;
  }

  // Afficher les formats trouvés
  const formats: { [key: string]: number } = {};
  imagesToConvert.forEach(img => {
    const ext = path.extname(img).toLowerCase();
    formats[ext] = (formats[ext] || 0) + 1;
  });

  console.log('📋 FORMATS TROUVÉS:\n');
  Object.entries(formats).forEach(([format, count]) => {
    console.log(`   ${format}: ${count}`);
  });
  console.log('');

  console.log('='.repeat(80) + '\n');

  if (!dryRun) {
    console.log('🔄 CONVERSION EN COURS...\n');

    for (const imagePath of imagesToConvert) {
      const ext = path.extname(imagePath);
      const baseName = imagePath.replace(/\.(png|jpeg|PNG|JPEG)$/i, '');
      const newPath = `${baseName}.jpg`;
      const relativePath = imagePath.replace(PORTFOLIO_BASE, '');
      const newRelativePath = newPath.replace(PORTFOLIO_BASE, '');

      try {
        // Lire les métadonnées de l'image originale
        const metadata = await sharp(imagePath).metadata();
        const originalSize = fs.statSync(imagePath).size;

        // Convertir l'image en JPG avec qualité 90%
        await sharp(imagePath)
          .jpeg({ quality: 90, mozjpeg: true })
          .toFile(newPath);

        const newSize = fs.statSync(newPath).size;

        // Supprimer l'ancien fichier
        fs.unlinkSync(imagePath);

        // Mettre à jour la BDD
        const oldDbPath = `/images/portfolio${relativePath}`;
        const newDbPath = `/images/portfolio${newRelativePath}`;

        const asset = await prisma.asset.findUnique({
          where: { path: oldDbPath }
        });

        if (asset) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: { path: newDbPath }
          });
        }

        totalOriginalSize += originalSize;
        totalNewSize += newSize;

        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        const sign = newSize < originalSize ? '↓' : '↑';

        console.log(`✅ ${path.basename(imagePath)}`);
        console.log(`   ${ext} → .jpg (${sign} ${Math.abs(parseFloat(reduction))}%)\n`);

        results.push({
          originalPath: imagePath,
          newPath,
          originalFormat: ext,
          originalSize,
          newSize,
          success: true
        });

      } catch (error) {
        console.error(`❌ Erreur: ${path.basename(imagePath)}`);
        console.error(`   ${error}\n`);

        results.push({
          originalPath: imagePath,
          newPath,
          originalFormat: ext,
          originalSize: 0,
          newSize: 0,
          success: false,
          error: String(error)
        });
      }
    }

    // Résumé final
    console.log('='.repeat(80));
    console.log('\n📊 RÉSUMÉ DE LA CONVERSION:\n');
    console.log(`   Total d'images: ${imagesToConvert.length}`);
    console.log(`   ✅ Converties avec succès: ${results.filter(r => r.success).length}`);
    console.log(`   ❌ Erreurs: ${results.filter(r => !r.success).length}`);

    if (totalOriginalSize > 0) {
      const totalReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
      console.log(`\n💾 ESPACE DISQUE:`);
      console.log(`   Taille originale: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Nouvelle taille: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Réduction: ${totalReduction}% (${((totalOriginalSize - totalNewSize) / 1024 / 1024).toFixed(2)} MB économisés)`);
    }

    // Sauvegarder le rapport
    const reportPath = '/Users/yoannandrieux/Projets/synck/scripts/conversion-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalImages: imagesToConvert.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalOriginalSize,
      totalNewSize,
      reduction: totalReduction,
      results
    }, null, 2));

    console.log(`\n✅ Rapport sauvegardé: ${reportPath}`);
  } else {
    console.log('📋 EXEMPLES DE CONVERSIONS (DRY RUN):\n');
    imagesToConvert.slice(0, 20).forEach(img => {
      const ext = path.extname(img);
      const newPath = img.replace(/\.(png|jpeg|PNG|JPEG)$/i, '.jpg');
      console.log(`   ${path.basename(img)} → ${path.basename(newPath)}`);
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');

  await prisma.$disconnect();
}

async function main() {
  const isDryRun = process.argv.includes('--execute') ? false : true;

  if (!isDryRun) {
    console.log('\n⚠️  ATTENTION: Vous êtes sur le point de convertir toutes les images.\n');
    console.log('   Cette opération va:');
    console.log('   1. Convertir les images .png et .jpeg en .jpg');
    console.log('   2. Supprimer les fichiers originaux');
    console.log('   3. Modifier la base de données\n');
    console.log('   Assurez-vous d\'avoir une sauvegarde avant de continuer!\n');
  }

  await convertImagesToJpg(isDryRun);
}

main().catch((error) => {
  console.error('Erreur fatale:', error);
  prisma.$disconnect();
  process.exit(1);
});
