import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Liste des doublons à supprimer (validée par l'utilisateur)
const DUPLICATES_TO_DELETE = [
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/souvenirs-en-cuisine2.png',
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/13prods/jimmy_somerville.jpg',
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/13prods/Joseph-Kessel.jpeg',
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/13prods/KHALED KELKAL.png',
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/13prods/Les-Antilles-empoisonnees.jpg',
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/13prods/LES-YEUX-DANS-LES-VIEUX.jpeg',
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/ligne-de-mire/INDE-LES-PAYSANS.jpg',
  '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/ligne-de-mire/INDE LES PAYSANS.jpg',
];

interface RenameOperation {
  oldPath: string;
  newPath: string;
  reason: string;
}

// Normaliser le nom de fichier selon la convention
function normalizeFileName(fileName: string): string {
  // Extraire le nom sans extension
  const ext = path.extname(fileName);
  let baseName = fileName.replace(/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i, '');

  // Normalisation :
  // 1. Minuscules
  baseName = baseName.toLowerCase();

  // 2. Remplacer espaces, underscores, points par des tirets
  baseName = baseName
    .replace(/[\s_\.]+/g, '-')
    // 3. Supprimer les tirets multiples
    .replace(/-+/g, '-')
    // 4. Supprimer les tirets au début et à la fin
    .replace(/^-+|-+$/g, '');

  // 5. Standardiser l'extension à .jpg
  return `${baseName}.jpg`;
}

// Scanner récursivement et collecter les opérations de renommage
async function collectRenameOperations(
  folderPath: string,
  operations: RenameOperation[] = []
): Promise<RenameOperation[]> {
  try {
    const entries = await readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);

      if (entry.isDirectory()) {
        // Récursion
        await collectRenameOperations(fullPath, operations);
      } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
        const normalizedName = normalizeFileName(entry.name);
        const newPath = path.join(path.dirname(fullPath), normalizedName);

        // Si le nom change
        if (normalizedName !== entry.name) {
          operations.push({
            oldPath: fullPath,
            newPath,
            reason: `"${entry.name}" → "${normalizedName}"`
          });
        }
      }
    }
  } catch (error) {
    console.error(`Erreur lors du scan de ${folderPath}:`, error);
  }

  return operations;
}

// Afficher un rapport
function displayReport(
  duplicates: string[],
  renames: RenameOperation[]
) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 RAPPORT DES OPÉRATIONS À EFFECTUER');
  console.log('='.repeat(80) + '\n');

  // Doublons
  console.log(`🗑️  SUPPRESSIONS DE DOUBLONS (${duplicates.length} fichiers)\n`);
  duplicates.forEach((file, i) => {
    const fileName = path.basename(file);
    const folder = path.basename(path.dirname(file));
    console.log(`   ${i + 1}. ${folder}/${fileName}`);
  });

  // Renommages
  console.log(`\n✏️  RENOMMAGES (${renames.length} fichiers)\n`);

  // Grouper par dossier
  const byFolder = new Map<string, RenameOperation[]>();
  renames.forEach(op => {
    const folder = path.dirname(op.oldPath);
    if (!byFolder.has(folder)) {
      byFolder.set(folder, []);
    }
    byFolder.get(folder)!.push(op);
  });

  let count = 1;
  byFolder.forEach((ops, folder) => {
    const folderName = folder.replace('/Users/yoannandrieux/Projets/synck/public/images/', '');
    console.log(`\n   📁 ${folderName} (${ops.length} fichiers)`);
    ops.slice(0, 5).forEach(op => {
      console.log(`      ${count}. ${op.reason}`);
      count++;
    });
    if (ops.length > 5) {
      console.log(`      ... et ${ops.length - 5} autres`);
      count += ops.length - 5;
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📊 TOTAL: ${duplicates.length} suppressions + ${renames.length} renommages`);
  console.log('='.repeat(80) + '\n');
}

// Exécuter les opérations
async function executeOperations(
  duplicates: string[],
  renames: RenameOperation[],
  dryRun: boolean = true
) {
  if (dryRun) {
    console.log('🔍 MODE DRY-RUN - Aucune modification ne sera appliquée\n');
    return;
  }

  console.log('⚡ EXÉCUTION DES OPÉRATIONS...\n');

  // 1. Supprimer les doublons
  console.log(`🗑️  Suppression de ${duplicates.length} doublons...`);
  for (const file of duplicates) {
    try {
      if (fs.existsSync(file)) {
        await unlink(file);
        console.log(`   ✓ Supprimé: ${path.basename(file)}`);
      } else {
        console.log(`   ⚠️  Fichier déjà supprimé: ${path.basename(file)}`);
      }
    } catch (error) {
      console.error(`   ✗ Erreur lors de la suppression de ${file}:`, error);
    }
  }

  // 2. Renommer les fichiers
  console.log(`\n✏️  Renommage de ${renames.length} fichiers...`);
  let success = 0;
  let errors = 0;

  for (const op of renames) {
    try {
      // Vérifier si le fichier de destination existe déjà
      if (fs.existsSync(op.newPath) && op.oldPath !== op.newPath) {
        console.log(`   ⚠️  Conflit: ${path.basename(op.newPath)} existe déjà`);
        errors++;
        continue;
      }

      await rename(op.oldPath, op.newPath);
      success++;

      if (success % 10 === 0) {
        console.log(`   ✓ ${success} fichiers renommés...`);
      }
    } catch (error) {
      console.error(`   ✗ Erreur: ${op.reason}`, error);
      errors++;
    }
  }

  console.log(`\n✅ Opérations terminées:`);
  console.log(`   - ${duplicates.length} doublons supprimés`);
  console.log(`   - ${success} fichiers renommés avec succès`);
  if (errors > 0) {
    console.log(`   - ${errors} erreurs`);
  }
}

// MAIN
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  console.log('\n🧹 NETTOYAGE ET RENOMMAGE DES IMAGES DOCUMENTAIRES\n');

  // 1. Collecter les renommages
  const folders = [
    '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires',
    '/Users/yoannandrieux/Projets/synck/public/images/gestion-admin'
  ];

  let allRenames: RenameOperation[] = [];

  for (const folder of folders) {
    if (fs.existsSync(folder)) {
      console.log(`📂 Scan de: ${folder}`);
      const renames = await collectRenameOperations(folder);
      allRenames.push(...renames);
    }
  }

  // 2. Afficher le rapport
  displayReport(DUPLICATES_TO_DELETE, allRenames);

  // 3. Exécuter ou dry-run
  if (dryRun) {
    console.log('💡 Pour exécuter ces opérations, relancez avec : --execute\n');
  } else {
    console.log('⚠️  ATTENTION: Cette opération va modifier les fichiers !\n');
    await executeOperations(DUPLICATES_TO_DELETE, allRenames, false);
  }
}

main().catch(console.error);
