import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const PORTFOLIO_BASE = '/Users/yoannandrieux/Projets/synck/public/images/portfolio';

const FIXES = [
  {
    currentFile: 'disparu-387.jpg',
    newFile: 'disparu-387.jpg', // garder le nom
    label: 'ligne-de-mire',
    searchTitle: 'disparu'
  },
  {
    currentFile: 'entendez-nous-portfolio.jpg',
    newFile: 'entendez-nous-violence-intrafamiliales-en-polynesie.jpg',
    label: '13prods',
    searchTitle: 'entendez-nous'
  },
  {
    currentFile: 'les-viants-portfolio.jpg',
    newFile: 'les-vivants.jpg', // corriger le nom
    label: '13prods',
    searchTitle: 'vivants'
  }
];

async function fixLastFiles() {
  console.log('\n🔧 CORRECTION DES 3 DERNIERS FICHIERS\n');
  console.log('='.repeat(80) + '\n');

  // Récupérer les labels pour mapping
  const labels = await prisma.label.findMany();
  const labelMap = new Map(labels.map(l => [l.slug, l.id]));

  for (const fix of FIXES) {
    console.log(`📝 Traitement de ${fix.currentFile}...`);

    const currentPath = path.join(PORTFOLIO_BASE, 'documentaires/autres', fix.currentFile);
    const targetPath = path.join(PORTFOLIO_BASE, `documentaires/${fix.label}`, fix.newFile);

    try {
      // 1. Vérifier si le fichier source existe
      if (!fs.existsSync(currentPath)) {
        console.log(`   ⚠️  Fichier source introuvable: ${currentPath}\n`);
        continue;
      }

      // 2. Chercher le work en BDD
      const works = await prisma.work.findMany({
        where: {
          category: { slug: 'documentaire' },
          OR: [
            { slug: { contains: fix.searchTitle.toLowerCase() } },
            { translations: { some: { title: { contains: fix.searchTitle, mode: 'insensitive' } } } }
          ]
        },
        include: {
          translations: { where: { locale: 'fr' } },
          coverImage: true,
          label: true
        }
      });

      const work = works[0];

      if (work) {
        console.log(`   ✅ Work trouvé: "${work.translations[0]?.title || work.slug}"`);

        // 3. Mettre à jour le label si nécessaire
        const labelId = labelMap.get(fix.label);
        if (labelId && work.labelId !== labelId) {
          await prisma.work.update({
            where: { id: work.id },
            data: { labelId }
          });
          console.log(`   ✅ Label mis à jour: ${fix.label}`);
        }

        // 4. Déplacer/renommer le fichier
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Vérifier si fichier destination existe déjà
        if (fs.existsSync(targetPath)) {
          console.log(`   ⚠️  Fichier existe déjà: ${fix.newFile}, suppression du doublon`);
          fs.unlinkSync(currentPath);
        } else {
          fs.renameSync(currentPath, targetPath);
          console.log(`   ✅ Fichier déplacé: ${fix.label}/${fix.newFile}`);
        }

        // 5. Mettre à jour le chemin dans Asset
        const oldAssetPath = `/images/portfolio/documentaires/autres/${fix.currentFile}`;
        const newAssetPath = `/images/portfolio/documentaires/${fix.label}/${fix.newFile}`;

        const asset = await prisma.asset.findUnique({
          where: { path: oldAssetPath }
        });

        if (asset) {
          await prisma.asset.update({
            where: { id: asset.id },
            data: { path: newAssetPath }
          });
          console.log(`   ✅ Asset mis à jour en BDD`);
        } else {
          // Chercher par l'ancien nom de fichier dans le chemin
          const assets = await prisma.asset.findMany({
            where: { path: { contains: fix.currentFile } }
          });

          if (assets.length > 0) {
            for (const a of assets) {
              await prisma.asset.update({
                where: { id: a.id },
                data: { path: newAssetPath }
              });
              console.log(`   ✅ Asset trouvé et mis à jour: ${a.path} → ${newAssetPath}`);
            }
          } else {
            console.log(`   ⚠️  Aucun asset trouvé pour ${fix.currentFile}`);
          }
        }

        // 6. Mettre à jour le coverImage du work si nécessaire
        if (work.coverImage && work.coverImage.path.includes(fix.currentFile)) {
          const newCoverAsset = await prisma.asset.findUnique({
            where: { path: newAssetPath }
          });

          if (newCoverAsset) {
            await prisma.work.update({
              where: { id: work.id },
              data: { coverImageId: newCoverAsset.id }
            });
            console.log(`   ✅ coverImageId mis à jour`);
          }
        }

      } else {
        console.log(`   ⚠️  Aucun work trouvé en BDD pour "${fix.searchTitle}"`);

        // Déplacer quand même le fichier
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        if (fs.existsSync(targetPath)) {
          console.log(`   ⚠️  Fichier existe déjà, suppression du doublon`);
          fs.unlinkSync(currentPath);
        } else {
          fs.renameSync(currentPath, targetPath);
          console.log(`   ✅ Fichier déplacé quand même: ${fix.label}/${fix.newFile}`);
        }
      }

      console.log('');

    } catch (error) {
      console.error(`   ❌ Erreur:`, error);
      console.log('');
    }
  }

  // Vérifier ce qui reste dans autres/
  const autresDir = path.join(PORTFOLIO_BASE, 'documentaires/autres');
  const remaining = fs.readdirSync(autresDir).filter(f => f.endsWith('.jpg'));

  console.log('='.repeat(80));
  console.log(`\n📊 RÉSULTAT:\n`);
  console.log(`   Fichiers traités: ${FIXES.length}`);
  console.log(`   Fichiers restants dans "autres/": ${remaining.length}`);

  if (remaining.length > 0) {
    console.log('\n⚠️  FICHIERS RESTANTS:\n');
    remaining.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log('\n✅ Le dossier "autres/" est maintenant VIDE !');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  await prisma.$disconnect();
}

fixLastFiles().catch(console.error);
