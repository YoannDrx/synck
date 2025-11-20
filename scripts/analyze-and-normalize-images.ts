import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import sharp from "sharp";

const prisma = new PrismaClient();

interface FileInfo {
  currentPath: string; // Relatif depuis /public
  currentName: string;
  currentDir: string;
  currentExtension: string;
  targetPath: string; // Après normalisation
  targetName: string;
  targetDir: string;
  targetExtension: string;
  hasTransparency: boolean | null; // null = pas vérifié encore
  needsConversion: boolean; // PNG → JPG
  needsRename: boolean;
  needsMove: boolean;
  conflictGroup: string | null; // Si conflit, identifiant du groupe
  conflictNumber: number | null; // Numérotation (-1, -2, -3)
}

interface NormalizationPlan {
  timestamp: string;
  totalFiles: number;
  filesToProcess: FileInfo[];
  conflicts: {
    [group: string]: FileInfo[];
  };
  pngWithTransparency: FileInfo[];
  pngToConvert: FileInfo[];
  stats: {
    needsRename: number;
    needsMove: number;
    needsConversion: number;
    hasConflicts: number;
  };
}

/**
 * Normalise un nom de fichier selon les règles :
 * - Tout en minuscules
 * - Espaces et underscores → tirets
 * - Accents supprimés
 * - Caractères spéciaux supprimés (sauf tirets et chiffres)
 * - Tirets multiples fusionnés
 */
function normalizeName(filename: string): string {
  const parsed = path.parse(filename);
  let name = parsed.name;

  // Minuscules
  name = name.toLowerCase();

  // Supprimer accents
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remplacer espaces et underscores par tirets
  name = name.replace(/[\s_]+/g, "-");

  // Supprimer caractères spéciaux (garder lettres, chiffres, tirets)
  name = name.replace(/[^a-z0-9-]/g, "");

  // Fusionner tirets multiples
  name = name.replace(/-+/g, "-");

  // Supprimer tirets en début/fin
  name = name.replace(/^-+|-+$/g, "");

  return name;
}

/**
 * Normalise l'extension selon les règles :
 * - .jpeg, .JPG → .jpg
 * - .PNG → .png (si transparence) ou .jpg (si pas transparence)
 */
function normalizeExtension(ext: string, hasTransparency: boolean): string {
  ext = ext.toLowerCase();

  if (ext === ".jpeg" || ext === ".jpg") {
    return ".jpg";
  }

  if (ext === ".png") {
    return hasTransparency ? ".png" : ".jpg";
  }

  // Autre extension (gif, webp, etc.) : garder tel quel
  return ext;
}

/**
 * Détermine le dossier cible pour un fichier de documentaires mal placé
 * Utilise un mapping intelligent basé sur :
 * - Nom du fichier (mots-clés)
 * - Labels de la DB (si disponible)
 * - Slugs de works
 */
async function determineDocumentairesFolder(
  filename: string,
  dbAssets: any[],
): Promise<string> {
  const name = filename.toLowerCase();

  // Mapping basé sur mots-clés communs
  const keywords: { [key: string]: string[] } = {
    "13prods": [
      "clearstream",
      "gaudin",
      "piolle",
      "jirai-crier",
      "solidarnosc",
      "cogolin",
      "bastelica",
      "gal",
      "ymca",
      "terrorisme-armenien",
      "marcus-klingberg",
      "georges-perec",
      "perec",
      "masque-de-fer",
      "amoureux-de-marianne",
      "leila",
      "makatea",
      "vivants",
      "poisons-de-poutine",
      "femmes-du-iiieme-reich",
      "enfants-de-huahine",
      "proces",
      "rumeur-dorleans",
      "double-vie-du-cognac",
      "brousse",
      "guadeloupe",
      "martinique",
      "outremer",
      "micmac-a-millau",
      "mayotte",
      "petit-pays",
      "quand-lafrique",
      "resistantes-allemandes",
      "si-loin-de-la-polynesie",
      "unique-en-mon-genre",
      "entendez-nous",
      "deconfines",
      "comment-te-dire-adieu",
      "cancre",
      "cabrera",
      "au-nom-de-la-mer",
    ],
    "little-big-story": [
      "bnp-paribas",
      "taiwan",
      "sous-la-loi-des-talibans",
      "oublies-de-latome",
      "empire-de-lor-rouge",
      "femme-sans-nom",
      "democratie-du-dollar",
      "disparu-387",
    ],
    "pop-films": [
      "sweet-sweetback",
      "souvenirs-en-cuisine",
      "reves-de-princesses",
      "pedro-almodovar",
      "almodovar",
      "patrick-edlinger",
      "naissance-dun-heros",
      "mangas",
      "jules-verne",
      "jamie-lee-curtis",
      "generation-grand-bleu",
      "chants-gregoriens",
    ],
    "via-decouvertes-films": [
      "se-mettre-au-vert",
      "plonger-pour-guerir",
      "operation-biodiversite",
      "gorongosa",
      "calanques",
      "avant-que-la-grande-nacre",
    ],
  };

  // Chercher correspondance par mots-clés
  for (const [folder, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (name.includes(word)) {
        return `documentaires/${folder}`;
      }
    }
  }

  // Si aucun match, chercher dans la DB par nom de fichier
  const normalizedName = normalizeName(path.parse(filename).name);
  for (const asset of dbAssets) {
    if (asset.path && asset.path.toLowerCase().includes(normalizedName)) {
      // Extraire le dossier de l'asset DB
      const match = asset.path.match(/\/documentaires\/([^/]+)\//);
      if (match && match[1]) {
        return `documentaires/${match[1]}`;
      }
    }
  }

  // Par défaut, mettre dans 13prods (dossier le plus grand)
  console.warn(
    `⚠️  Impossible de catégoriser automatiquement: ${filename}, placé dans 13prods par défaut`,
  );
  return "documentaires/13prods";
}

/**
 * Détecte si un PNG a de la transparence (alpha channel)
 */
async function hasTransparency(imagePath: string): Promise<boolean> {
  try {
    const metadata = await sharp(imagePath).metadata();
    return metadata.hasAlpha === true;
  } catch (error) {
    console.error(
      `Erreur lors de la détection de transparence: ${imagePath}`,
      error,
    );
    return false;
  }
}

/**
 * Scanner tous les fichiers et générer le plan de normalisation
 */
async function generateNormalizationPlan(): Promise<NormalizationPlan> {
  console.log("🔍 Scanning all files...\n");

  // Scanner tous les fichiers images
  const files = await glob(
    "public/images/projets/**/*.{jpg,jpeg,png,JPG,JPEG,PNG,gif,GIF}",
    {
      nocase: false,
    },
  );

  console.log(`✅ Found ${files.length} files\n`);

  // Charger les Assets de la DB pour aider au mapping
  console.log("📊 Loading assets from database...");
  const dbAssets = await prisma.asset.findMany({
    select: { path: true },
  });
  console.log(`✅ Loaded ${dbAssets.length} assets from DB\n`);

  const filesInfo: FileInfo[] = [];

  // Analyser chaque fichier
  for (const file of files) {
    const relativePath = "/" + file.replace("public/", "");
    const parsed = path.parse(relativePath);
    const currentDir = parsed.dir;
    const currentName = parsed.base;
    const currentExtension = parsed.ext.toLowerCase();

    // Déterminer le dossier cible
    let targetDir = currentDir;

    // Si fichier à la racine de /documentaires/, déterminer le sous-dossier
    if (currentDir === "/images/projets/documentaires") {
      targetDir = await determineDocumentairesFolder(currentName, dbAssets);
      targetDir = "/images/projets/" + targetDir;
    }

    // Détecter transparence pour PNG
    let hasAlpha: boolean | null = null;
    if (currentExtension === ".png") {
      const fullPath = path.join(process.cwd(), "public", relativePath);
      hasAlpha = await hasTransparency(fullPath);
    }

    // Normaliser le nom
    const normalizedName = normalizeName(parsed.name);
    const normalizedExt = normalizeExtension(
      currentExtension,
      hasAlpha === true,
    );

    const targetName = normalizedName + normalizedExt;
    const targetPath = path.join(targetDir, targetName);

    filesInfo.push({
      currentPath: relativePath,
      currentName,
      currentDir,
      currentExtension,
      targetPath,
      targetName,
      targetDir,
      targetExtension: normalizedExt,
      hasTransparency: hasAlpha,
      needsConversion: currentExtension === ".png" && normalizedExt === ".jpg",
      needsRename: currentName !== targetName,
      needsMove: currentDir !== targetDir,
      conflictGroup: null,
      conflictNumber: null,
    });
  }

  console.log("🔍 Detecting conflicts...\n");

  // Détecter les conflits (fichiers qui auraient le même nom après normalisation)
  const targetPaths = new Map<string, FileInfo[]>();
  for (const file of filesInfo) {
    const key = file.targetPath;
    if (!targetPaths.has(key)) {
      targetPaths.set(key, []);
    }
    targetPaths.get(key)!.push(file);
  }

  const conflicts: { [group: string]: FileInfo[] } = {};
  let conflictCount = 0;

  for (const [targetPath, conflictingFiles] of targetPaths.entries()) {
    if (conflictingFiles.length > 1) {
      conflictCount++;
      const group = `conflict_${conflictCount}`;

      // Numéroter les fichiers en conflit
      conflictingFiles.forEach((file, index) => {
        file.conflictGroup = group;
        file.conflictNumber = index + 1;

        // Mettre à jour targetPath avec numérotation
        const parsed = path.parse(file.targetPath);
        file.targetPath = path.join(
          parsed.dir,
          `${parsed.name}-${file.conflictNumber}${parsed.ext}`,
        );
        file.targetName = `${parsed.name}-${file.conflictNumber}${parsed.ext}`;
      });

      conflicts[group] = conflictingFiles;
    }
  }

  console.log(
    `⚠️  Detected ${Object.keys(conflicts).length} conflict groups\n`,
  );

  // Statistiques
  const stats = {
    needsRename: filesInfo.filter((f) => f.needsRename).length,
    needsMove: filesInfo.filter((f) => f.needsMove).length,
    needsConversion: filesInfo.filter((f) => f.needsConversion).length,
    hasConflicts: filesInfo.filter((f) => f.conflictGroup !== null).length,
  };

  const plan: NormalizationPlan = {
    timestamp: new Date().toISOString(),
    totalFiles: filesInfo.length,
    filesToProcess: filesInfo,
    conflicts,
    pngWithTransparency: filesInfo.filter(
      (f) => f.hasTransparency === true && f.currentExtension === ".png",
    ),
    pngToConvert: filesInfo.filter((f) => f.needsConversion),
    stats,
  };

  return plan;
}

async function main() {
  try {
    console.log(
      "🚀 Starting image analysis and normalization plan generation\n",
    );

    const plan = await generateNormalizationPlan();

    // Sauvegarder le plan
    const planPath = path.join(
      process.cwd(),
      "scripts",
      "normalization-plan.json",
    );
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));

    // Sauvegarder les rapports séparés
    const conflictsPath = path.join(
      process.cwd(),
      "scripts",
      "conflicts-report.json",
    );
    fs.writeFileSync(
      conflictsPath,
      JSON.stringify({ conflicts: plan.conflicts }, null, 2),
    );

    const pngPath = path.join(
      process.cwd(),
      "scripts",
      "png-transparency-report.json",
    );
    fs.writeFileSync(
      pngPath,
      JSON.stringify(
        {
          pngWithTransparency: plan.pngWithTransparency,
          pngToConvert: plan.pngToConvert,
        },
        null,
        2,
      ),
    );

    // Afficher le résumé
    console.log("📊 NORMALIZATION PLAN SUMMARY\n");
    console.log("=".repeat(60));
    console.log(`Total files:              ${plan.totalFiles}`);
    console.log(`Files to rename:          ${plan.stats.needsRename}`);
    console.log(`Files to move:            ${plan.stats.needsMove}`);
    console.log(`PNG to convert to JPG:    ${plan.stats.needsConversion}`);
    console.log(
      `PNG with transparency:    ${plan.pngWithTransparency.length} (kept as .png)`,
    );
    console.log(`Files in conflicts:       ${plan.stats.hasConflicts}`);
    console.log(
      `Conflict groups:          ${Object.keys(plan.conflicts).length}`,
    );
    console.log("=".repeat(60));

    if (Object.keys(plan.conflicts).length > 0) {
      console.log("\n⚠️  CONFLICTS DETECTED:\n");
      for (const [group, files] of Object.entries(plan.conflicts)) {
        console.log(`${group}:`);
        files.forEach((file) => {
          console.log(`  [${file.conflictNumber}] ${file.currentPath}`);
          console.log(`      → ${file.targetPath}`);
        });
        console.log();
      }
    }

    console.log("\n📄 Reports saved:");
    console.log(`  - ${planPath}`);
    console.log(`  - ${conflictsPath}`);
    console.log(`  - ${pngPath}`);

    console.log("\n✅ Analysis complete!");
    console.log("\n💡 Next steps:");
    console.log(
      "  1. Review the normalization plan in normalization-plan.json",
    );
    console.log("  2. Check conflicts in conflicts-report.json");
    console.log("  3. Verify PNG transparency in png-transparency-report.json");
    console.log(
      "  4. Run conversion script: pnpm tsx scripts/convert-png-to-jpg.ts",
    );
  } catch (error) {
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
