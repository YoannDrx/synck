import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const prisma = new PrismaClient();

const MD_FILE_PATH = '/Users/yoannandrieux/Projets/synck/content/expertises/fr/gestion-administrative-et-editoriale.md';
const IMAGE_BASE = '/Users/yoannandrieux/Projets/synck/public';

// Mapping category → label slug
const CATEGORY_TO_LABEL: Record<string, string> = {
  '13-prods': '13prods',
  'little-big-story': 'little-big-story',
  'pop-films': 'pop-films',
  'via-decouvertes-films': 'via-decouvertes-films'
};

interface DocumentaireFromMD {
  title: string;
  subtitle?: string;
  srcLg: string;
  link?: string;
  category: string;
}

// Générer un slug à partir d'un titre
function generateSlug(title: string, existingSlugs: Set<string>): string {
  let baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^\w\s-]/g, '') // Retirer les caractères spéciaux
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Si le slug existe déjà, ajouter un suffixe
  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  existingSlugs.add(slug);
  return slug;
}

// Normaliser le chemin d'image (même logique que le script de renommage)
function normalizeImagePath(originalPath: string): string {
  // Extraire le chemin relatif depuis /images/
  const relativePath = originalPath.replace(/^\/images\//, '');
  const parts = relativePath.split('/');
  const fileName = parts[parts.length - 1];

  // Normaliser le nom de fichier
  const ext = path.extname(fileName);
  let baseName = fileName.replace(/\.(jpg|jpeg|png|webp|JPG|PNG|JPEG|WEBP)$/i, '');
  baseName = baseName
    .toLowerCase()
    .replace(/[\s_\.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const normalizedFileName = `${baseName}.jpg`;

  // Reconstruire le chemin
  // /images/gestion-admin/13-prods/xxx → /images/portfolio/documentaires/13prods/xxx
  if (relativePath.includes('gestion-admin/13-prods')) {
    return `/images/portfolio/documentaires/13prods/${normalizedFileName}`;
  } else if (relativePath.includes('gestion-admin/little-big-story')) {
    return `/images/portfolio/documentaires/little-big-story/${normalizedFileName}`;
  } else if (relativePath.includes('gestion-admin/pop-films')) {
    return `/images/portfolio/documentaires/pop-films/${normalizedFileName}`;
  } else if (relativePath.includes('gestion-admin/via-decouvertes-films')) {
    return `/images/portfolio/documentaires/via-decouvertes-films/${normalizedFileName}`;
  }

  // Sinon, juste normaliser le nom
  parts[parts.length - 1] = normalizedFileName;
  return '/images/' + parts.join('/');
}

// Créer ou trouver un Asset
async function findOrCreateAsset(imagePath: string): Promise<string | null> {
  const normalizedPath = normalizeImagePath(imagePath);
  const fullPath = path.join(IMAGE_BASE, normalizedPath);

  // Vérifier si le fichier existe
  if (!fs.existsSync(fullPath)) {
    console.warn(`   ⚠️  Image non trouvée: ${normalizedPath}`);
    return null;
  }

  // Chercher l'asset existant
  let asset = await prisma.asset.findUnique({
    where: { path: normalizedPath }
  });

  if (!asset) {
    // Créer l'asset
    asset = await prisma.asset.create({
      data: {
        path: normalizedPath,
        alt: null
      }
    });
  }

  return asset.id;
}

// MAIN
async function main() {
  console.log('\n📚 MIGRATION DES DOCUMENTAIRES VERS PRISMA\n');

  // 1. Lire et parser le fichier MD
  const fileContent = fs.readFileSync(MD_FILE_PATH, 'utf-8');
  const { data } = matter(fileContent);

  const documentaires = data.documentaires as DocumentaireFromMD[];
  console.log(`📄 ${documentaires.length} documentaires trouvés dans le MD\n`);

  // 2. Récupérer la catégorie "documentaire"
  const category = await prisma.category.findUnique({
    where: { slug: 'documentaire' }
  });

  if (!category) {
    console.error('❌ Catégorie "documentaire" non trouvée en BDD !');
    console.log('   Veuillez d\'abord créer la catégorie "documentaire"\n');
    process.exit(1);
  }

  console.log(`✓ Catégorie "documentaire" trouvée (ID: ${category.id})\n`);

  // 3. Récupérer tous les labels
  const labels = await prisma.label.findMany({
    select: { id: true, slug: true }
  });

  const labelMap = new Map(labels.map(l => [l.slug, l.id]));
  console.log(`✓ ${labels.length} labels chargés\n`);

  console.log('='.repeat(70) + '\n');

  // 4. Migrer chaque documentaire
  const existingSlugs = new Set<string>();
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const doc of documentaires) {
    try {
      const slug = generateSlug(doc.title, existingSlugs);

      // Vérifier si le work existe déjà
      const existing = await prisma.work.findUnique({ where: { slug } });
      if (existing) {
        console.log(`⏭️  "${doc.title}" existe déjà`);
        skipped++;
        continue;
      }

      // Trouver le label
      const labelSlug = CATEGORY_TO_LABEL[doc.category];
      const labelId = labelMap.get(labelSlug);

      if (!labelId) {
        console.error(`❌ Label "${labelSlug}" non trouvé pour "${doc.title}"`);
        errors++;
        continue;
      }

      // Créer ou trouver l'asset
      const coverImageId = await findOrCreateAsset(doc.srcLg);

      // Créer le work
      await prisma.work.create({
        data: {
          slug,
          categoryId: category.id,
          labelId,
          coverImageId,
          isActive: true,
          isFeatured: false,
          order: created,
          translations: {
            create: [
              {
                locale: 'fr',
                title: doc.title,
                description: doc.link || null
              },
              {
                locale: 'en',
                title: doc.title, // Pas de traduction EN pour l'instant
                description: doc.link || null
              }
            ]
          }
        }
      });

      console.log(`✅ [${created + 1}] "${doc.title}" (${labelSlug})`);
      created++;

      // Feedback tous les 20 documentaires
      if (created % 20 === 0) {
        console.log(`\n   📊 Progression: ${created}/${documentaires.length}\n`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour "${doc.title}":`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 RÉSUMÉ DE LA MIGRATION:');
  console.log('='.repeat(70));
  console.log(`   ✅ ${created} documentaires créés`);
  console.log(`   ⏭️  ${skipped} déjà existants`);
  console.log(`   ❌ ${errors} erreurs`);
  console.log(`   📚 ${created + skipped}/${documentaires.length} total`);
  console.log('='.repeat(70) + '\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Erreur fatale:', error);
  prisma.$disconnect();
  process.exit(1);
});
