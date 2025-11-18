import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const PORTFOLIO_BASE = '/Users/yoannandrieux/Projets/synck/public/images/portfolio';

interface ImageIssue {
  currentPath: string;
  issues: string[];
  suggestedPath?: string;
  workTitle?: string;
  labelSlug?: string;
}

// Normaliser le nom de fichier
function normalizeFileName(fileName: string): string {
  const ext = path.extname(fileName);
  let baseName = fileName.replace(/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i, '');

  // Convertir en minuscules
  baseName = baseName.toLowerCase();

  // Remplacer caractères spéciaux et accents
  baseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/['']/g, '-') // Apostrophes -> tirets
    .replace(/[\s_\.]+/g, '-') // Espaces, underscores, points -> tirets
    .replace(/[^a-z0-9-]/g, '-') // Autres caractères -> tirets
    .replace(/-+/g, '-') // Tirets multiples -> un seul
    .replace(/^-+|-+$/g, ''); // Retirer tirets début/fin

  return baseName + '.jpg';
}

async function analyzeAllImages() {
  console.log('\n🔍 ANALYSE COMPLÈTE DES IMAGES DU PORTFOLIO\n');
  console.log('='.repeat(80) + '\n');

  const issues: ImageIssue[] = [];
  let totalFiles = 0;
  let perfectFiles = 0;

  // Parcourir tous les sous-dossiers
  const categories = ['albums', 'clips', 'documentaires', 'evenements', 'photosCompo', 'photosynchro', 'vinyles'];

  for (const category of categories) {
    const categoryPath = path.join(PORTFOLIO_BASE, category);

    if (!fs.existsSync(categoryPath)) continue;

    console.log(`\n📁 Analyse de ${category}/...`);

    // Fonction récursive pour analyser les fichiers
    function analyzeDirectory(dirPath: string, relativePath: string = '') {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Analyser récursivement
          analyzeDirectory(fullPath, path.join(relativePath, item));
        } else if (/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i.test(item)) {
          totalFiles++;
          const currentRelativePath = path.join(category, relativePath, item);
          const fileIssues: string[] = [];

          // Vérifier extension
          if (item.endsWith('.JPG')) {
            fileIssues.push('Extension .JPG (devrait être .jpg)');
          } else if (item.endsWith('.JPEG') || item.endsWith('.jpeg')) {
            fileIssues.push('Extension .JPEG (devrait être .jpg)');
          } else if (item.endsWith('.PNG') || item.endsWith('.png')) {
            fileIssues.push('Extension .PNG (devrait être .jpg)');
          } else if (item.endsWith('.WEBP') || item.endsWith('.webp')) {
            fileIssues.push('Extension .WEBP (devrait être .jpg)');
          }

          // Vérifier majuscules
          if (/[A-Z]/.test(item.replace(/\.(JPG|PNG|JPEG|WEBP)$/, ''))) {
            fileIssues.push('Contient des majuscules');
          }

          // Vérifier espaces
          if (/ /.test(item)) {
            fileIssues.push('Contient des espaces');
          }

          // Vérifier underscores
          if (/_/.test(item)) {
            fileIssues.push('Contient des underscores');
          }

          // Vérifier accents
          if (/[àâäéèêëïîôùûüÿçœæ]/i.test(item)) {
            fileIssues.push('Contient des accents');
          }

          // Vérifier apostrophes
          if (/['']/.test(item)) {
            fileIssues.push('Contient des apostrophes');
          }

          if (fileIssues.length > 0) {
            const normalizedName = normalizeFileName(item);
            const suggestedPath = path.join(category, relativePath, normalizedName);

            issues.push({
              currentPath: currentRelativePath,
              issues: fileIssues,
              suggestedPath
            });
          } else {
            perfectFiles++;
          }
        }
      }
    }

    analyzeDirectory(categoryPath);
  }

  // Analyser les fichiers documentaires à la racine
  console.log(`\n📁 Analyse de documentaires/ (fichiers à la racine)...`);
  const docRoot = path.join(PORTFOLIO_BASE, 'documentaires');
  const docFiles = fs.readdirSync(docRoot).filter(f =>
    /\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i.test(f) &&
    fs.statSync(path.join(docRoot, f)).isFile()
  );

  console.log(`   ⚠️  ${docFiles.length} fichiers trouvés à la racine (devraient être dans sous-dossiers labels)`);

  for (const file of docFiles) {
    totalFiles++;
    const currentRelativePath = `documentaires/${file}`;
    const fileIssues: string[] = ['Fichier à la racine (devrait être dans sous-dossier label)'];

    // Vérifier aussi les problèmes de nommage
    if (file.endsWith('.JPG')) fileIssues.push('Extension .JPG');
    if (file.endsWith('.JPEG') || file.endsWith('.jpeg')) fileIssues.push('Extension .JPEG');
    if (file.endsWith('.PNG') || file.endsWith('.png')) fileIssues.push('Extension .PNG');
    if (/[A-Z]/.test(file.replace(/\.(JPG|PNG|JPEG|WEBP)$/, ''))) fileIssues.push('Majuscules');
    if (/ /.test(file)) fileIssues.push('Espaces');
    if (/_/.test(file)) fileIssues.push('Underscores');
    if (/[àâäéèêëïîôùûüÿçœæ]/i.test(file)) fileIssues.push('Accents');

    issues.push({
      currentPath: currentRelativePath,
      issues: fileIssues,
      suggestedPath: undefined // À déterminer via BDD
    });
  }

  // Afficher le résumé
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RÉSUMÉ DE L\'ANALYSE\n');
  console.log(`   Total de fichiers: ${totalFiles}`);
  console.log(`   ✅ Fichiers parfaits: ${perfectFiles} (${Math.round(perfectFiles/totalFiles*100)}%)`);
  console.log(`   ⚠️  Fichiers avec problèmes: ${issues.length} (${Math.round(issues.length/totalFiles*100)}%)`);

  // Grouper par type de problème
  const problemCounts: { [key: string]: number } = {};
  issues.forEach(issue => {
    issue.issues.forEach(problem => {
      problemCounts[problem] = (problemCounts[problem] || 0) + 1;
    });
  });

  console.log('\n📋 PROBLÈMES PAR TYPE:\n');
  Object.entries(problemCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([problem, count]) => {
      console.log(`   ${problem}: ${count}`);
    });

  // Afficher quelques exemples
  console.log('\n📝 EXEMPLES DE FICHIERS À CORRIGER:\n');
  issues.slice(0, 10).forEach(issue => {
    console.log(`   ${issue.currentPath}`);
    console.log(`      Problèmes: ${issue.issues.join(', ')}`);
    if (issue.suggestedPath) {
      console.log(`      Suggestion: ${issue.suggestedPath}`);
    }
    console.log('');
  });

  console.log('='.repeat(80) + '\n');

  // Sauvegarder le rapport complet
  const reportPath = '/Users/yoannandrieux/Projets/synck/scripts/image-analysis-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalFiles,
      perfectFiles,
      issuesCount: issues.length,
      problemCounts
    },
    issues
  }, null, 2));

  console.log(`✅ Rapport complet sauvegardé dans: ${reportPath}\n`);

  await prisma.$disconnect();
}

async function main() {
  await analyzeAllImages();
}

main().catch((error) => {
  console.error('Erreur:', error);
  prisma.$disconnect();
  process.exit(1);
});
