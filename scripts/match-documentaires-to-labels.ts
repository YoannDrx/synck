import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const DOC_ROOT = '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires';

// Normaliser le nom de fichier pour le matching
function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer accents
    .replace(/[^a-z0-9]/g, '') // Garder seulement lettres et chiffres
    .trim();
}

async function main() {
  console.log('\n🔍 MATCHING DOCUMENTAIRES → LABELS\n');
  console.log('='.repeat(80) + '\n');

  // Récupérer tous les works documentaires avec leur label
  const works = await prisma.work.findMany({
    where: {
      category: {
        slug: 'documentaire'
      }
    },
    include: {
      label: true,
      coverImage: true,
      translations: {
        where: { locale: 'fr' }
      }
    }
  });

  console.log(`📊 ${works.length} documentaires trouvés en BDD\n`);

  // Récupérer les fichiers à la racine
  const rootFiles = fs.readdirSync(DOC_ROOT).filter(f =>
    /\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i.test(f) &&
    fs.statSync(path.join(DOC_ROOT, f)).isFile()
  );

  console.log(`📁 ${rootFiles.length} fichiers trouvés à la racine de documentaires/\n`);
  console.log('='.repeat(80) + '\n');

  const matches: { file: string; work: any; label: string; confidence: string }[] = [];
  const noMatch: string[] = [];

  // Pour chaque fichier, essayer de trouver le work correspondant
  for (const file of rootFiles) {
    const fileWithoutExt = file.replace(/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i, '');
    const normalizedFile = normalizeForMatch(fileWithoutExt);

    let bestMatch: any = null;
    let bestConfidence = 'none';

    // Chercher par slug exact
    const slugMatch = works.find(w => normalizeForMatch(w.slug) === normalizedFile);
    if (slugMatch) {
      bestMatch = slugMatch;
      bestConfidence = 'exact_slug';
    }

    // Chercher par titre exact
    if (!bestMatch) {
      const titleMatch = works.find(w => {
        const title = w.translations[0]?.title || '';
        return normalizeForMatch(title) === normalizedFile;
      });
      if (titleMatch) {
        bestMatch = titleMatch;
        bestConfidence = 'exact_title';
      }
    }

    // Chercher par slug partiel
    if (!bestMatch) {
      const slugPartialMatch = works.find(w => {
        const slug = normalizeForMatch(w.slug);
        return slug.includes(normalizedFile) || normalizedFile.includes(slug);
      });
      if (slugPartialMatch) {
        bestMatch = slugPartialMatch;
        bestConfidence = 'partial_slug';
      }
    }

    // Chercher par titre partiel
    if (!bestMatch) {
      const titlePartialMatch = works.find(w => {
        const title = normalizeForMatch(w.translations[0]?.title || '');
        return title.includes(normalizedFile) || normalizedFile.includes(title);
      });
      if (titlePartialMatch) {
        bestMatch = titlePartialMatch;
        bestConfidence = 'partial_title';
      }
    }

    if (bestMatch) {
      const labelSlug = bestMatch.label?.slug || 'unknown';
      matches.push({
        file,
        work: bestMatch,
        label: labelSlug,
        confidence: bestConfidence
      });

      console.log(`✅ ${file}`);
      console.log(`   → Work: "${bestMatch.translations[0]?.title || bestMatch.slug}"`);
      console.log(`   → Label: ${labelSlug}`);
      console.log(`   → Confidence: ${bestConfidence}\n`);
    } else {
      noMatch.push(file);
      console.log(`❌ ${file}`);
      console.log(`   → Aucun match trouvé\n`);
    }
  }

  console.log('='.repeat(80));
  console.log(`\n📊 RÉSUMÉ DU MATCHING:\n`);
  console.log(`   ✅ Fichiers matchés: ${matches.length}/${rootFiles.length}`);
  console.log(`   ❌ Fichiers non matchés: ${noMatch.length}/${rootFiles.length}`);

  // Grouper par label
  const byLabel: { [key: string]: number } = {};
  matches.forEach(m => {
    byLabel[m.label] = (byLabel[m.label] || 0) + 1;
  });

  console.log('\n📋 RÉPARTITION PAR LABEL:\n');
  Object.entries(byLabel)
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, count]) => {
      console.log(`   ${label}: ${count}`);
    });

  // Sauvegarder le rapport
  const reportPath = '/Users/yoannandrieux/Projets/synck/scripts/documentaires-label-matching.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      totalFiles: rootFiles.length,
      matched: matches.length,
      noMatch: noMatch.length,
      byLabel
    },
    matches: matches.map(m => ({
      file: m.file,
      workSlug: m.work.slug,
      workTitle: m.work.translations[0]?.title,
      label: m.label,
      confidence: m.confidence,
      currentPath: `/images/portfolio/documentaires/${m.file}`,
      suggestedPath: `/images/portfolio/documentaires/${m.label}/${m.file}`
    })),
    noMatch
  }, null, 2));

  console.log(`\n✅ Rapport sauvegardé: ${reportPath}\n`);

  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Erreur:', error);
  prisma.$disconnect();
  process.exit(1);
});
