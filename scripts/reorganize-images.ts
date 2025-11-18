import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const BASE_PATH = '/Users/yoannandrieux/Projets/synck/public/images';
const SOURCE_BASE = path.join(BASE_PATH, 'gestion-admin');
const TARGET_BASE = path.join(BASE_PATH, 'portfolio/documentaires');

interface MoveOperation {
  source: string;
  target: string;
  fileName: string;
  producer: string;
}

// Mapping des dossiers source → producteur
const FOLDER_MAPPING: Record<string, string> = {
  '13-prods': '13prods',
  'little-big-story': 'little-big-story',
  'pop-films': 'pop-films',
  'via-decouvertes-films': 'via-decouvertes-films'
};

// Scanner et collecter toutes les opérations de déplacement
async function collectMoveOperations(): Promise<MoveOperation[]> {
  const operations: MoveOperation[] = [];

  for (const [sourceFolder, producer] of Object.entries(FOLDER_MAPPING)) {
    const sourcePath = path.join(SOURCE_BASE, sourceFolder);

    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Dossier non trouvé: ${sourceFolder}`);
      continue;
    }

    const files = await readdir(sourcePath);

    for (const file of files) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        const source = path.join(sourcePath, file);
        const targetFolder = path.join(TARGET_BASE, producer);
        const target = path.join(targetFolder, file);

        operations.push({
          source,
          target,
          fileName: file,
          producer
        });
      }
    }
  }

  return operations;
}

// Vérifier les conflits
function checkConflicts(operations: MoveOperation[]): {
  safe: MoveOperation[];
  conflicts: MoveOperation[];
} {
  const safe: MoveOperation[] = [];
  const conflicts: MoveOperation[] = [];

  for (const op of operations) {
    if (fs.existsSync(op.target)) {
      // Vérifier si c'est le même fichier (même taille)
      const sourceStat = fs.statSync(op.source);
      const targetStat = fs.statSync(op.target);

      if (sourceStat.size === targetStat.size) {
        // Même fichier, on peut juste supprimer la source
        safe.push(op);
      } else {
        // Vraiment un conflit
        conflicts.push(op);
      }
    } else {
      safe.push(op);
    }
  }

  return { safe, conflicts };
}

// Créer les dossiers cibles
async function createTargetFolders() {
  const producers = Object.values(FOLDER_MAPPING);

  for (const producer of producers) {
    const targetFolder = path.join(TARGET_BASE, producer);

    if (!fs.existsSync(targetFolder)) {
      console.log(`📁 Création du dossier: ${producer}/`);
      await mkdir(targetFolder, { recursive: true });
    }
  }
}

// Afficher le rapport
function displayReport(
  safe: MoveOperation[],
  conflicts: MoveOperation[]
) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 RAPPORT DE RÉORGANISATION');
  console.log('='.repeat(80) + '\n');

  // Grouper par producteur
  const byProducer = new Map<string, MoveOperation[]>();
  safe.forEach(op => {
    if (!byProducer.has(op.producer)) {
      byProducer.set(op.producer, []);
    }
    byProducer.get(op.producer)!.push(op);
  });

  console.log('✅ DÉPLACEMENTS SÉCURISÉS:\n');
  byProducer.forEach((ops, producer) => {
    console.log(`   📁 ${producer}/ (${ops.length} fichiers)`);
    ops.slice(0, 3).forEach(op => {
      console.log(`      - ${op.fileName}`);
    });
    if (ops.length > 3) {
      console.log(`      ... et ${ops.length - 3} autres`);
    }
    console.log('');
  });

  if (conflicts.length > 0) {
    console.log('\n⚠️  CONFLITS DÉTECTÉS:\n');
    conflicts.forEach(op => {
      console.log(`   ❌ ${op.producer}/${op.fileName}`);
      console.log(`      Source: ${op.source}`);
      console.log(`      Cible:  ${op.target} (existe déjà avec taille différente)`);
      console.log('');
    });
  }

  console.log('='.repeat(80));
  console.log(`📊 TOTAL: ${safe.length} déplacements + ${conflicts.length} conflits`);
  console.log('='.repeat(80) + '\n');
}

// Exécuter les déplacements
async function executeMove(operations: MoveOperation[], dryRun: boolean = true) {
  if (dryRun) {
    console.log('🔍 MODE DRY-RUN - Aucune modification ne sera appliquée\n');
    return;
  }

  console.log('⚡ DÉPLACEMENT DES FICHIERS...\n');

  let moved = 0;
  let deleted = 0;

  for (const op of operations) {
    try {
      if (fs.existsSync(op.target)) {
        // Le fichier existe déjà, supprimer la source
        fs.unlinkSync(op.source);
        deleted++;
        console.log(`   🗑️  Supprimé (doublon): ${op.fileName}`);
      } else {
        // Déplacer le fichier
        await rename(op.source, op.target);
        moved++;
        if (moved % 20 === 0) {
          console.log(`   ✓ ${moved} fichiers déplacés...`);
        }
      }
    } catch (error) {
      console.error(`   ✗ Erreur pour ${op.fileName}:`, error);
    }
  }

  console.log(`\n✅ Terminé:`);
  console.log(`   - ${moved} fichiers déplacés`);
  console.log(`   - ${deleted} doublons supprimés`);
}

// MAIN
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  console.log('\n📦 RÉORGANISATION DES IMAGES DOCUMENTAIRES\n');
  console.log(`Source: /images/gestion-admin/`);
  console.log(`Cible:  /images/portfolio/documentaires/\n`);

  // 1. Créer les dossiers cibles
  await createTargetFolders();

  // 2. Collecter les opérations
  const operations = await collectMoveOperations();
  console.log(`📊 ${operations.length} fichiers à traiter\n`);

  // 3. Vérifier les conflits
  const { safe, conflicts } = checkConflicts(operations);

  // 4. Afficher le rapport
  displayReport(safe, conflicts);

  // 5. Exécuter ou dry-run
  if (conflicts.length > 0 && !dryRun) {
    console.log('⚠️  ATTENTION: Il y a des conflits. Veuillez les résoudre manuellement.\n');
    console.log('Les fichiers sans conflit seront quand même déplacés.\n');
  }

  if (dryRun) {
    console.log('💡 Pour exécuter ces opérations, relancez avec : --execute\n');
  } else {
    await executeMove(safe, false);
  }
}

main().catch(console.error);
