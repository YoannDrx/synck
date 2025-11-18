import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

interface FileInfo {
  path: string;
  name: string;
  size: number;
  ext: string;
}

// Normaliser le nom (même logique que le script précédent)
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

// Scanner un dossier et trouver les doublons après normalisation
async function findNormalizedDuplicates(folderPath: string): Promise<Map<string, FileInfo[]>> {
  const duplicates = new Map<string, FileInfo[]>();

  async function scan(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
        const normalizedName = normalizeFileName(entry.name);
        const stats = await stat(fullPath);

        const info: FileInfo = {
          path: fullPath,
          name: entry.name,
          size: stats.size,
          ext: path.extname(entry.name).toLowerCase()
        };

        if (!duplicates.has(normalizedName)) {
          duplicates.set(normalizedName, []);
        }
        duplicates.get(normalizedName)!.push(info);
      }
    }
  }

  await scan(folderPath);

  // Ne garder que les doublons réels (plusieurs fichiers)
  const realDuplicates = new Map<string, FileInfo[]>();
  duplicates.forEach((files, normalizedName) => {
    if (files.length > 1) {
      // Trier par : 1) .jpg en premier, 2) taille décroissante
      files.sort((a, b) => {
        if (a.ext === '.jpg' && b.ext !== '.jpg') return -1;
        if (a.ext !== '.jpg' && b.ext === '.jpg') return 1;
        return b.size - a.size;
      });
      realDuplicates.set(normalizedName, files);
    }
  });

  return realDuplicates;
}

// MAIN
async function main() {
  console.log('\n🔍 RECHERCHE DES CONFLITS RESTANTS...\n');

  const folders = [
    '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires',
    '/Users/yoannandrieux/Projets/synck/public/images/gestion-admin'
  ];

  let allConflicts = new Map<string, FileInfo[]>();

  for (const folder of folders) {
    if (fs.existsSync(folder)) {
      const conflicts = await findNormalizedDuplicates(folder);
      conflicts.forEach((files, name) => {
        if (!allConflicts.has(name)) {
          allConflicts.set(name, []);
        }
        allConflicts.get(name)!.push(...files);
      });
    }
  }

  console.log(`📊 ${allConflicts.size} groupes de conflits trouvés\n`);

  if (allConflicts.size === 0) {
    console.log('✅ Aucun conflit ! Tous les fichiers ont des noms uniques.\n');
    return;
  }

  console.log('═'.repeat(80) + '\n');

  let index = 1;
  const toDelete: string[] = [];

  allConflicts.forEach((files, normalizedName) => {
    console.log(`${index}. "${normalizedName}" (${files.length} fichiers)`);

    files.forEach((file, i) => {
      const sizeKb = (file.size / 1024).toFixed(2);
      const marker = i === 0 ? '✅ GARDER' : '❌ SUPPRIMER';
      const folder = path.relative('/Users/yoannandrieux/Projets/synck/public/images', path.dirname(file.path));

      console.log(`   ${i === 0 ? '→' : ' '} [${marker}] ${file.name} (${sizeKb} KB)`);
      console.log(`      ${folder}/`);

      if (i > 0) {
        toDelete.push(file.path);
      }
    });

    console.log('');
    index++;
  });

  console.log('═'.repeat(80));
  console.log(`\n📊 RÉSUMÉ: ${toDelete.length} fichiers à supprimer\n`);

  // Demander confirmation
  const args = process.argv.slice(2);
  if (args.includes('--delete')) {
    console.log('🗑️  SUPPRESSION DES DOUBLONS...\n');

    for (const filePath of toDelete) {
      try {
        await unlink(filePath);
        console.log(`   ✓ Supprimé: ${path.basename(filePath)}`);
      } catch (error) {
        console.error(`   ✗ Erreur: ${path.basename(filePath)}`, error);
      }
    }

    console.log(`\n✅ ${toDelete.length} fichiers supprimés\n`);
  } else {
    console.log('💡 Pour supprimer ces doublons, relancez avec : --delete\n');
  }
}

main().catch(console.error);
