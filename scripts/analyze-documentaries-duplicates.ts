import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

interface ImageFile {
  fullPath: string;
  fileName: string;
  baseName: string;
  extension: string;
  size: number;
  folder: string;
}

interface DuplicateGroup {
  baseName: string;
  files: ImageFile[];
  folder: string;
}

// Fonction pour normaliser le nom de base (pour détecter les doublons)
function normalizeBaseName(fileName: string): string {
  const withoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i, '');
  return withoutExt
    .toLowerCase()
    .replace(/[_\s]+/g, '-') // Remplace espaces et underscores par tirets
    .replace(/\.$/g, '') // Supprime points finaux
    .trim();
}

// Scanner récursivement un dossier
async function scanFolder(folderPath: string, relativeTo: string = folderPath): Promise<ImageFile[]> {
  const files: ImageFile[] = [];

  try {
    const entries = await readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);

      if (entry.isDirectory()) {
        // Récursion dans les sous-dossiers
        const subFiles = await scanFolder(fullPath, relativeTo);
        files.push(...subFiles);
      } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
        // Fichier image trouvé
        const stats = await stat(fullPath);
        const extension = path.extname(entry.name);
        const baseName = normalizeBaseName(entry.name);

        files.push({
          fullPath,
          fileName: entry.name,
          baseName,
          extension: extension.toLowerCase(),
          size: stats.size,
          folder: path.relative(relativeTo, path.dirname(fullPath))
        });
      }
    }
  } catch (error) {
    console.error(`Erreur lors du scan de ${folderPath}:`, error);
  }

  return files;
}

// Grouper les fichiers par baseName pour trouver les doublons
function findDuplicates(files: ImageFile[]): DuplicateGroup[] {
  const grouped = new Map<string, ImageFile[]>();

  files.forEach(file => {
    const key = `${file.folder}/${file.baseName}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(file);
  });

  // Ne garder que les groupes avec plusieurs fichiers (doublons)
  const duplicates: DuplicateGroup[] = [];
  grouped.forEach((files, key) => {
    if (files.length > 1) {
      duplicates.push({
        baseName: files[0].baseName,
        folder: files[0].folder,
        files: files.sort((a, b) => b.size - a.size) // Trier par taille décroissante
      });
    }
  });

  return duplicates.sort((a, b) => a.folder.localeCompare(b.folder));
}

// Générer un rapport formaté
function generateReport(duplicates: DuplicateGroup[]): string {
  let report = '# RAPPORT DES DOUBLONS D\'IMAGES DOCUMENTAIRES\n\n';
  report += `**Total de groupes de doublons trouvés : ${duplicates.length}**\n\n`;

  if (duplicates.length === 0) {
    report += 'Aucun doublon détecté !\n';
    return report;
  }

  report += '---\n\n';

  let currentFolder = '';
  duplicates.forEach((group, index) => {
    if (group.folder !== currentFolder) {
      currentFolder = group.folder;
      report += `## Dossier: ${group.folder || '(racine)'}\n\n`;
    }

    report += `### ${index + 1}. "${group.baseName}"\n\n`;

    group.files.forEach((file, i) => {
      const sizeKb = (file.size / 1024).toFixed(2);
      const marker = i === 0 ? '🏆 **RECOMMANDÉ** (plus gros)' : '';
      report += `${i + 1}. \`${file.fileName}\` ${marker}\n`;
      report += `   - Taille: ${sizeKb} KB\n`;
      report += `   - Extension: ${file.extension}\n`;
      report += `   - Chemin: ${file.fullPath}\n\n`;
    });

    report += '---\n\n';
  });

  return report;
}

// Générer un fichier JSON pour traitement automatisé
function generateJSON(duplicates: DuplicateGroup[]): string {
  const data = duplicates.map(group => ({
    baseName: group.baseName,
    folder: group.folder,
    recommended: group.files[0].fullPath, // Le plus gros par défaut
    alternatives: group.files.slice(1).map(f => f.fullPath)
  }));

  return JSON.stringify(data, null, 2);
}

// MAIN
async function main() {
  console.log('🔍 Scan des images documentaires...\n');

  const foldersToScan = [
    '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires',
    '/Users/yoannandrieux/Projets/synck/public/images/gestion-admin'
  ];

  let allFiles: ImageFile[] = [];

  for (const folder of foldersToScan) {
    if (fs.existsSync(folder)) {
      console.log(`📂 Scan de: ${folder}`);
      const files = await scanFolder(folder);
      console.log(`   → ${files.length} images trouvées\n`);
      allFiles.push(...files);
    } else {
      console.log(`⚠️  Dossier non trouvé: ${folder}\n`);
    }
  }

  console.log(`\n📊 Total: ${allFiles.length} images scannées\n`);

  // Trouver les doublons
  const duplicates = findDuplicates(allFiles);

  // Générer les rapports
  const report = generateReport(duplicates);
  const jsonData = generateJSON(duplicates);

  // Sauvegarder les rapports
  const reportPath = path.join(__dirname, 'duplicates-report.md');
  const jsonPath = path.join(__dirname, 'duplicates-data.json');

  fs.writeFileSync(reportPath, report);
  fs.writeFileSync(jsonPath, jsonData);

  console.log('✅ Rapports générés:');
  console.log(`   📄 ${reportPath}`);
  console.log(`   📄 ${jsonPath}\n`);

  // Afficher un résumé
  console.log(report.split('\n').slice(0, 20).join('\n'));
  console.log(`\n... (voir ${reportPath} pour le rapport complet)\n`);
}

main().catch(console.error);
