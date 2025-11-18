import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface MappingEntry {
  filename: string;
  workId: string | null;
  workSlug: string | null;
  workTitle: string | null;
  currentLabel: string | null;
  suggestedLabel: string;
  confidence: string;
  reasoning: string;
  needsLabelUpdate: boolean;
  currentPath: string;
  targetPath: string | null;
}

async function reorganizeAutresFiles(dryRun: boolean = true) {
  console.log('\n🔄 RÉORGANISATION DES FICHIERS DOCUMENTAIRES/AUTRES/\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (simulation)' : '✅ EXÉCUTION RÉELLE'}\n`);
  console.log('='.repeat(80) + '\n');

  // Charger le mapping
  const mappingData = JSON.parse(
    fs.readFileSync('/Users/yoannandrieux/Projets/synck/scripts/autres-detailed-mapping.json', 'utf-8')
  );

  const mapping: MappingEntry[] = mappingData.mapping;

  console.log(`📊 ${mapping.length} fichiers à traiter\n`);
  console.log('='.repeat(80) + '\n');

  // Filtrer les fichiers à réorganiser (exclure 'unknown' et ceux sans targetPath)
  const filesToMove = mapping.filter(m =>
    m.suggestedLabel !== 'unknown' &&
    m.targetPath &&
    m.confidence !== 'none'
  );

  const lowConfidence = mapping.filter(m => m.confidence === 'low' || m.confidence === 'medium');
  const unknownFiles = mapping.filter(m => m.suggestedLabel === 'unknown' || m.confidence === 'none');

  console.log(`📋 PLAN DE RÉORGANISATION:\n`);
  console.log(`   ✅ Fichiers à déplacer: ${filesToMove.length}`);
  console.log(`   ⚠️  Confiance moyenne/basse: ${lowConfidence.length}`);
  console.log(`   ❌ Fichiers unknown/non mappés: ${unknownFiles.length}\n`);

  if (unknownFiles.length > 0) {
    console.log('📝 FICHIERS QUI RESTERONT DANS "AUTRES/":\n');
    unknownFiles.forEach(f => {
      console.log(`   ${f.filename} - ${f.reasoning}`);
    });
    console.log('');
  }

  console.log('='.repeat(80) + '\n');

  let moved = 0;
  let labelsUpdated = 0;
  let assetsUpdated = 0;
  let errors: string[] = [];

  if (!dryRun) {
    console.log('🔄 TRAITEMENT EN COURS...\n');

    // Récupérer tous les labels pour mapping nom → id
    const labels = await prisma.label.findMany();
    const labelMap = new Map(labels.map(l => [l.slug, l.id]));

    for (const entry of filesToMove) {
      const { filename, workId, suggestedLabel, currentPath, targetPath, needsLabelUpdate } = entry;

      try {
        // 1. Mettre à jour le label du work en BDD si nécessaire
        if (workId && needsLabelUpdate) {
          const labelId = labelMap.get(suggestedLabel);

          if (labelId) {
            await prisma.work.update({
              where: { id: workId },
              data: { labelId }
            });
            labelsUpdated++;
          } else {
            errors.push(`Label ${suggestedLabel} introuvable pour ${filename}`);
            continue;
          }
        }

        // 2. Déplacer le fichier physiquement
        const sourcePath = path.join('/Users/yoannandrieux/Projets/synck/public', currentPath.replace('/images/portfolio/', 'images/portfolio/'));
        const destPath = path.join('/Users/yoannandrieux/Projets/synck/public', targetPath!.replace('/images/portfolio/', 'images/portfolio/'));
        const destDir = path.dirname(destPath);

        // Créer le dossier de destination si nécessaire
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Vérifier si le fichier destination existe déjà
        if (fs.existsSync(destPath)) {
          // Fichier existe déjà, probablement un doublon
          console.log(`⚠️  ${filename} - Fichier existe déjà dans ${suggestedLabel}/, suppression du doublon\n`);
          fs.unlinkSync(sourcePath);
        } else {
          // Déplacer le fichier
          fs.renameSync(sourcePath, destPath);
        }

        moved++;

        // 3. Mettre à jour le chemin dans Asset
        const asset = await prisma.asset.findUnique({
          where: { path: currentPath }
        });

        if (asset) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: { path: targetPath! }
          });
          assetsUpdated++;
        }

        console.log(`✅ ${filename}`);
        console.log(`   ${suggestedLabel}/ - ${entry.reasoning}\n`);

      } catch (error) {
        console.error(`❌ Erreur pour ${filename}:`, error);
        errors.push(`${filename}: ${error}`);
      }
    }

    console.log('='.repeat(80));
    console.log('\n📊 RÉSUMÉ:\n');
    console.log(`   Fichiers déplacés: ${moved}/${filesToMove.length}`);
    console.log(`   Labels mis à jour en BDD: ${labelsUpdated}`);
    console.log(`   Assets mis à jour: ${assetsUpdated}`);
    console.log(`   Erreurs: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ ERREURS:\n');
      errors.forEach(err => console.log(`   ${err}`));
    }

    // Vérifier ce qui reste dans autres/
    const autresDir = '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/autres';
    const remaining = fs.readdirSync(autresDir).filter(f => f.endsWith('.jpg'));

    console.log(`\n📁 Fichiers restants dans "autres/": ${remaining.length}`);
    if (remaining.length > 0) {
      console.log('\n📝 FICHIERS RESTANTS (à traiter manuellement):\n');
      remaining.forEach(f => {
        const entry = mapping.find(m => m.filename === f);
        console.log(`   ${f} - ${entry?.reasoning || 'inconnu'}`);
      });
    }

  } else {
    console.log('📋 APERÇU DES DÉPLACEMENTS (DRY RUN):\n');

    // Grouper par label
    const byLabel = new Map<string, MappingEntry[]>();
    filesToMove.forEach(entry => {
      if (!byLabel.has(entry.suggestedLabel)) {
        byLabel.set(entry.suggestedLabel, []);
      }
      byLabel.get(entry.suggestedLabel)!.push(entry);
    });

    byLabel.forEach((entries, label) => {
      console.log(`\n📁 ${label.toUpperCase()} (${entries.length} fichiers):\n`);
      entries.slice(0, 5).forEach(e => {
        console.log(`   ${e.filename} - ${e.reasoning}`);
      });
      if (entries.length > 5) {
        console.log(`   ... et ${entries.length - 5} autres`);
      }
    });

    console.log(`\n\n📊 STATISTIQUES DRY RUN:\n`);
    console.log(`   Fichiers qui seront déplacés: ${filesToMove.length}`);
    console.log(`   Labels qui seront mis à jour: ${filesToMove.filter(f => f.needsLabelUpdate && f.workId).length}`);
    console.log(`   Fichiers qui resteront dans "autres/": ${unknownFiles.length}`);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Sauvegarder le rapport
  const reportPath = `/Users/yoannandrieux/Projets/synck/scripts/reorganization-report-${dryRun ? 'dryrun' : 'executed'}.json`;
  fs.writeFileSync(reportPath, JSON.stringify({
    mode: dryRun ? 'dry-run' : 'executed',
    timestamp: new Date().toISOString(),
    filesToMove: filesToMove.length,
    moved,
    labelsUpdated,
    assetsUpdated,
    errors,
    remaining: unknownFiles.map(u => u.filename)
  }, null, 2));

  console.log(`✅ Rapport sauvegardé: ${reportPath}\n`);

  await prisma.$disconnect();
}

async function main() {
  const isDryRun = process.argv.includes('--execute') ? false : true;

  if (!isDryRun) {
    console.log('\n⚠️  ATTENTION: Vous êtes sur le point de réorganiser les fichiers.\n');
    console.log('   Cette opération va:');
    console.log('   1. Mettre à jour les labels en BDD');
    console.log('   2. Déplacer les fichiers vers leurs sous-dossiers');
    console.log('   3. Mettre à jour les chemins dans la table Asset\n');
  }

  await reorganizeAutresFiles(isDryRun);
}

main().catch(console.error);
