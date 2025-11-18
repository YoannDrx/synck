import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const PORTFOLIO_BASE = '/Users/yoannandrieux/Projets/synck/public/images/portfolio';

interface Change {
  oldPath: string;
  newPath: string;
  reason: string[];
  assetUpdated: boolean;
}

// Normaliser le nom de fichier
function normalizeFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  let baseName = fileName.replace(/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i, '');

  baseName = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/['']/g, '-') // Apostrophes -> tirets
    .replace(/[\s_\.]+/g, '-') // Espaces, underscores, points -> tirets
    .replace(/[^a-z0-9-]/g, '-') // Autres caractères -> tirets
    .replace(/-+/g, '-') // Tirets multiples -> un seul
    .replace(/^-+|-+$/g, ''); // Retirer tirets début/fin

  // Garder l'extension d'origine pour l'instant (ne pas convertir les formats)
  return baseName + ext;
}

async function normalizeAllImages(dryRun: boolean = true) {
  console.log('\n🔧 NORMALISATION DES IMAGES DU PORTFOLIO\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (simulation)' : '✅ EXÉCUTION RÉELLE'}\n`);
  console.log('='.repeat(80) + '\n');

  // Charger les rapports d'analyse
  const analysisReport = JSON.parse(
    fs.readFileSync('/Users/yoannandrieux/Projets/synck/scripts/image-analysis-report.json', 'utf-8')
  );
  const labelMatching = JSON.parse(
    fs.readFileSync('/Users/yoannandrieux/Projets/synck/scripts/documentaires-label-matching.json', 'utf-8')
  );

  const changes: Change[] = [];
  let errors: string[] = [];

  // === ÉTAPE 1: Normaliser les noms de fichiers ===
  console.log('📝 ÉTAPE 1: Normalisation des noms de fichiers\n');

  for (const issue of analysisReport.issues) {
    const currentFullPath = path.join(PORTFOLIO_BASE, issue.currentPath);

    // Vérifier si le fichier existe
    if (!fs.existsSync(currentFullPath)) {
      errors.push(`Fichier introuvable: ${issue.currentPath}`);
      continue;
    }

    // Déterminer le nouveau chemin
    let newPath: string;
    let reasons: string[] = [...issue.issues];

    // Cas spécial: fichiers documentaires à la racine
    if (issue.issues.includes('Fichier à la racine (devrait être dans sous-dossier label)')) {
      // Trouver le match dans labelMatching
      const fileName = path.basename(issue.currentPath);
      const match = labelMatching.matches.find((m: any) => m.file === fileName);

      if (match && match.label !== 'unknown') {
        // Déplacer vers le sous-dossier du label
        const normalizedFileName = normalizeFileName(fileName);
        newPath = `/images/portfolio/documentaires/${match.label}/${normalizedFileName}`;
        reasons.push(`Déplacé vers ${match.label}/`);
      } else {
        // Créer un dossier "autres" pour les fichiers sans label
        const normalizedFileName = normalizeFileName(fileName);
        newPath = `/images/portfolio/documentaires/autres/${normalizedFileName}`;
        reasons.push('Déplacé vers autres/ (pas de label)');
      }
    } else if (issue.suggestedPath) {
      // Utiliser le chemin suggéré par l'analyse
      newPath = `/images/portfolio/${issue.suggestedPath}`;
    } else {
      // Garder le même dossier, juste normaliser le nom
      const dir = path.dirname(issue.currentPath);
      const fileName = path.basename(issue.currentPath);
      const normalizedFileName = normalizeFileName(fileName);
      newPath = `/images/portfolio/${dir}/${normalizedFileName}`;
    }

    // Si le chemin ne change pas, skip
    const oldPath = `/images/portfolio/${issue.currentPath}`;
    if (oldPath === newPath) {
      continue;
    }

    changes.push({
      oldPath,
      newPath,
      reason: reasons,
      assetUpdated: false
    });
  }

  console.log(`   ✅ ${changes.length} fichiers à traiter\n`);

  // === ÉTAPE 2: Appliquer les changements ===
  if (!dryRun) {
    console.log('🔄 ÉTAPE 2: Application des changements\n');

    // Créer le dossier "autres" si nécessaire
    const autresDir = path.join(PORTFOLIO_BASE, 'documentaires', 'autres');
    if (!fs.existsSync(autresDir)) {
      console.log('   📁 Création du dossier documentaires/autres/\n');
      fs.mkdirSync(autresDir, { recursive: true });
    }

    for (const change of changes) {
      // Construire les chemins complets en enlevant '/images/portfolio/' du début
      const relativePath = change.oldPath.replace('/images/portfolio/', '');
      const newRelativePath = change.newPath.replace('/images/portfolio/', '');
      const oldFullPath = path.join(PORTFOLIO_BASE, relativePath);
      const newFullPath = path.join(PORTFOLIO_BASE, newRelativePath);

      try {
        // Créer le dossier de destination si nécessaire
        const newDir = path.dirname(newFullPath);
        if (!fs.existsSync(newDir)) {
          fs.mkdirSync(newDir, { recursive: true });
        }

        // Renommer/déplacer le fichier
        fs.renameSync(oldFullPath, newFullPath);

        // Mettre à jour la BDD
        const asset = await prisma.asset.findUnique({
          where: { path: change.oldPath }
        });

        if (asset) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: { path: change.newPath }
          });
          change.assetUpdated = true;
        }

        console.log(`✅ ${path.basename(change.oldPath)} → ${path.basename(change.newPath)}`);
      } catch (error) {
        console.error(`❌ Erreur pour ${change.oldPath}:`, error);
        errors.push(`Erreur: ${change.oldPath} - ${error}`);
      }
    }
  } else {
    // DRY RUN: Afficher quelques exemples
    console.log('📋 EXEMPLES DE CHANGEMENTS (DRY RUN):\n');
    changes.slice(0, 20).forEach(change => {
      console.log(`   ${change.oldPath}`);
      console.log(`   → ${change.newPath}`);
      console.log(`   Raisons: ${change.reason.join(', ')}\n`);
    });
  }

  // === RÉSUMÉ ===
  console.log('='.repeat(80));
  console.log('\n📊 RÉSUMÉ:\n');
  console.log(`   Total de changements: ${changes.length}`);
  if (!dryRun) {
    const assetsUpdated = changes.filter(c => c.assetUpdated).length;
    console.log(`   Assets mis à jour en BDD: ${assetsUpdated}`);
  }
  console.log(`   Erreurs: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ ERREURS:\n');
    errors.forEach(err => console.log(`   ${err}`));
  }

  // Sauvegarder le rapport
  const reportPath = `/Users/yoannandrieux/Projets/synck/scripts/normalization-report-${dryRun ? 'dryrun' : 'executed'}.json`;
  fs.writeFileSync(reportPath, JSON.stringify({
    mode: dryRun ? 'dry-run' : 'executed',
    timestamp: new Date().toISOString(),
    changes,
    errors
  }, null, 2));

  console.log(`\n✅ Rapport sauvegardé: ${reportPath}\n`);
  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
}

async function main() {
  // Par défaut, faire un dry run
  const isDryRun = process.argv.includes('--execute') ? false : true;

  if (!isDryRun) {
    console.log('\n⚠️  ATTENTION: Vous êtes sur le point d\'exécuter la normalisation réelle.\n');
    console.log('   Cette opération va:');
    console.log('   1. Renommer des fichiers');
    console.log('   2. Déplacer des fichiers');
    console.log('   3. Modifier la base de données\n');
    console.log('   Assurez-vous d\'avoir une sauvegarde avant de continuer!\n');
  }

  await normalizeAllImages(isDryRun);
}

main().catch((error) => {
  console.error('Erreur fatale:', error);
  prisma.$disconnect();
  process.exit(1);
});
