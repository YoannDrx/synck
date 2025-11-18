import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
const PORTFOLIO_BASE = '/Users/yoannandrieux/Projets/synck/public/images/portfolio';

interface ConversionResult {
  filePath: string;
  actualFormat: string;
  fileExtension: string;
  originalSize: number;
  newSize: number;
  success: boolean;
  error?: string;
}

// Détecter le vrai format d'un fichier avec la commande 'file'
function detectRealFormat(filePath: string): string {
  try {
    const output = execSync(`file -b "${filePath}"`).toString().trim();

    if (output.includes('PNG')) return 'png';
    if (output.includes('JPEG')) return 'jpeg';
    if (output.match(/JPEG.*JFIF/i)) return 'jpeg';
    if (output.includes('WebP')) return 'webp';

    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

async function convertMisnamedImages(dryRun: boolean = true) {
  console.log('\n🔄 CONVERSION DES IMAGES MAL NOMMÉES\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (simulation)' : '✅ EXÉCUTION RÉELLE'}\n`);
  console.log('='.repeat(80) + '\n');

  const results: ConversionResult[] = [];
  const toConvert: { path: string; realFormat: string }[] = [];
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  // Fonction récursive pour trouver tous les fichiers .jpg
  function findAllJpgFiles(dir: string, results: string[] = []): string[] {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findAllJpgFiles(fullPath, results);
      } else if (/\.jpg$/i.test(item)) {
        results.push(fullPath);
      }
    }

    return results;
  }

  console.log('🔍 Recherche des fichiers .jpg...\n');
  const allJpgFiles = findAllJpgFiles(PORTFOLIO_BASE);
  console.log(`📊 ${allJpgFiles.length} fichiers .jpg trouvés\n`);

  console.log('🔍 Détection des vrais formats...\n');
  let checked = 0;

  for (const file of allJpgFiles) {
    const realFormat = detectRealFormat(file);
    const fileExt = path.extname(file).toLowerCase();

    // Si le fichier .jpg est en réalité un PNG ou autre
    if (realFormat !== 'jpeg' && realFormat !== 'unknown') {
      toConvert.push({ path: file, realFormat });
    }

    checked++;
    if (checked % 50 === 0) {
      process.stdout.write(`   Vérifiés: ${checked}/${allJpgFiles.length}\r`);
    }
  }
  console.log(`   Vérifiés: ${checked}/${allJpgFiles.length}\n`);

  console.log('='.repeat(80));
  console.log(`\n📊 RÉSULTAT DE L'ANALYSE:\n`);
  console.log(`   Fichiers .jpg analysés: ${allJpgFiles.length}`);
  console.log(`   ✅ Vrais JPEG: ${allJpgFiles.length - toConvert.length}`);
  console.log(`   ⚠️  Fichiers mal nommés: ${toConvert.length}\n`);

  if (toConvert.length === 0) {
    console.log('✅ Aucune conversion nécessaire ! Tous les fichiers .jpg sont de vrais JPEG.\n');
    await prisma.$disconnect();
    return;
  }

  // Grouper par format
  const byFormat: { [key: string]: number } = {};
  toConvert.forEach(item => {
    byFormat[item.realFormat] = (byFormat[item.realFormat] || 0) + 1;
  });

  console.log('📋 FORMATS À CONVERTIR:\n');
  Object.entries(byFormat).forEach(([format, count]) => {
    console.log(`   ${format.toUpperCase()}: ${count}`);
  });
  console.log('');

  console.log('='.repeat(80) + '\n');

  if (!dryRun) {
    console.log('🔄 CONVERSION EN COURS...\n');

    for (const item of toConvert) {
      const filePath = item.path;
      const fileName = path.basename(filePath);
      const tempPath = filePath + '.tmp';

      try {
        // Lire la taille originale
        const originalSize = fs.statSync(filePath).size;

        // Convertir l'image en vrai JPEG avec Sharp
        await sharp(filePath)
          .jpeg({ quality: 90, mozjpeg: true })
          .toFile(tempPath);

        const newSize = fs.statSync(tempPath).size;

        // Remplacer l'ancien fichier par le nouveau
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);

        totalOriginalSize += originalSize;
        totalNewSize += newSize;

        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        const sign = newSize < originalSize ? '↓' : '↑';

        console.log(`✅ ${fileName}`);
        console.log(`   ${item.realFormat.toUpperCase()} → JPEG (${sign} ${Math.abs(parseFloat(reduction))}%)\n`);

        results.push({
          filePath,
          actualFormat: item.realFormat,
          fileExtension: '.jpg',
          originalSize,
          newSize,
          success: true
        });

      } catch (error) {
        console.error(`❌ Erreur: ${fileName}`);
        console.error(`   ${error}\n`);

        // Nettoyer le fichier temporaire si existe
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }

        results.push({
          filePath,
          actualFormat: item.realFormat,
          fileExtension: '.jpg',
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
    console.log(`   Total d'images: ${toConvert.length}`);
    console.log(`   ✅ Converties avec succès: ${results.filter(r => r.success).length}`);
    console.log(`   ❌ Erreurs: ${results.filter(r => !r.success).length}`);

    if (totalOriginalSize > 0) {
      const totalReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
      const sign = totalNewSize < totalOriginalSize ? '↓' : '↑';

      console.log(`\n💾 ESPACE DISQUE:`);
      console.log(`   Taille originale: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Nouvelle taille: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   ${sign} ${Math.abs(parseFloat(totalReduction))}% (${Math.abs((totalOriginalSize - totalNewSize) / 1024 / 1024).toFixed(2)} MB)`);
    }

    // Sauvegarder le rapport
    const reportPath = '/Users/yoannandrieux/Projets/synck/scripts/misnamed-conversion-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalImages: toConvert.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalOriginalSize,
      totalNewSize,
      results
    }, null, 2));

    console.log(`\n✅ Rapport sauvegardé: ${reportPath}`);
  } else {
    console.log('📋 EXEMPLES DE CONVERSIONS (DRY RUN):\n');
    toConvert.slice(0, 20).forEach(item => {
      console.log(`   ${path.basename(item.path)} (${item.realFormat.toUpperCase()} → JPEG)`);
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');

  await prisma.$disconnect();
}

async function main() {
  const isDryRun = process.argv.includes('--execute') ? false : true;

  if (!isDryRun) {
    console.log('\n⚠️  ATTENTION: Vous êtes sur le point de convertir les images mal nommées.\n');
    console.log('   Cette opération va:');
    console.log('   1. Détecter les fichiers .jpg qui sont en réalité des PNG/WEBP');
    console.log('   2. Les convertir en vrais JPEG');
    console.log('   3. Remplacer les fichiers originaux\n');
    console.log('   Assurez-vous d\'avoir une sauvegarde avant de continuer!\n');
  }

  await convertMisnamedImages(isDryRun);
}

main().catch((error) => {
  console.error('Erreur fatale:', error);
  prisma.$disconnect();
  process.exit(1);
});
