#!/usr/bin/env tsx
/* eslint-disable no-console */

import fs from "fs";
import path from "path";

// Mapping des noms de fichiers vers les slugs
const FILE_TO_SLUG_MAP: Record<string, string> = {
  "2080": "2080",
  "Aeon Seven": "aeon-seven",
  "After in Paris": "after-in-paris",
  Aïwa: "aiwa",
  Arandel: "arandel",
  "Arat Kilo": "arat-kilo",
  "AROM (AMAURY MESSELIER)": "arom", // Garder arom, supprimer amaury-messelier
  Bonetrips: "bonetrips",
  "Bruno Hovart": "bruno-hovart",
  "Charlotte Savary": "charlotte-savary",
  "Chicho Cortez": "chicho-cortez",
  Cœur: "coeur",
  "Cyril laurent": "cyril-laurent",
  "Dan Amozig": "dan-amozig",
  "DJ HERTZ (Franck Sinnassamy)": "dj-hertz", // Garder dj-hertz, supprimer franck-sinnassamy
  "DJ TROUBL": "dj-troubl",
  Drixxxé: "drixxxe",
  "F. Stokes": "f-stokes",
  "Fabien Girard": "fabien-girard",
  Flore: "flore",
  "Forever Pavot": "emile-sornin-forever-pavot",
  "Grand David": "grand-david",
  "JB Hanak": "jb-hanak",
  "Jean-Pierre Ménager": "jean-pierre-menager",
  "Laurent Dury": "laurent-dury",
  Liqid: "liqid",
  Madben: "madben",
  Minimatic: "minimatic",
  "Mister Modo": "mister-modo",
  Modulhater: "modulhater",
  Nicodrum: "nicodrums-friends",
  "Nicolas Pisani": "nicolas-pisani",
  NSDOS: "nsdos",
  "Of Ivory & Horn": "of-ivory-horn",
  "Pierre Millet": "pierre-millet",
  "Sébastien Blanchon": "sebastien-blanchon",
  "Sr Ortegon": "sr-ortegon",
  Tcheep: "tcheep",
  "The Architect": "the-architect",
  "Thierry Los": "thierry-los",
  "Ugly Mac Beer": "ugly-mac-beer",
  "Viro Major Records": "patrice-dambrine-viro-major-records",
  "Well Quartet": "well-quartet", // Nouveau compositeur à créer
  "Yann Jankielewicz": "yann-jankielewicz",
  "Yann Kornowicz": "yann-kornowicz",
};

type ExtractedBio = {
  fileName: string;
  slug: string;
  link: string;
  platform: string;
  bioFr: string;
  bioEn: string;
};

function detectPlatform(url: string): string {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("soundcloud.com")) return "soundcloud";
  if (url.includes("bandcamp.com")) return "bandcamp";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("youtube.com")) return "youtube";
  return "website";
}

function extractBio(filePath: string): ExtractedBio | null {
  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath, ".txt");

  // Extraire le lien (première ligne)
  const lines = content.split("\n");
  const firstLine = lines[0]?.trim() || "";

  // Le lien est souvent après le nom de l'artiste
  const linkMatch =
    firstLine.match(/https?:\/\/[^\s]+/) || content.match(/https?:\/\/[^\s]+/);
  const link = linkMatch ? linkMatch[0].trim() : "";
  const platform = link ? detectPlatform(link) : "";

  // Séparer bio FR et EN
  const parts = content.split(/Anglais\s*:/i);
  let bioFr = parts[0] || "";
  let bioEn = parts[1] || "";

  // Nettoyer bioFr : enlever la première ligne (nom + lien)
  bioFr = bioFr.split("\n").slice(1).join("\n").trim();

  // Nettoyer bioEn
  bioEn = bioEn.trim();

  // Si pas de bio EN, utiliser la bio FR
  if (!bioEn) {
    bioEn = bioFr;
  }

  const slug = FILE_TO_SLUG_MAP[fileName];
  if (!slug) {
    console.warn(`⚠️  No slug mapping for: ${fileName}`);
    return null;
  }

  return {
    fileName,
    slug,
    link,
    platform,
    bioFr,
    bioEn,
  };
}

async function main() {
  const biosDir = "/Users/yoannandrieux/Downloads/BIOGRAPHIES ARTISTES 2";
  const outputDirFr = path.join(process.cwd(), "content/composer-bios/fr");
  const outputDirEn = path.join(process.cwd(), "content/composer-bios/en");

  // Créer les dossiers si nécessaire
  fs.mkdirSync(outputDirFr, { recursive: true });
  fs.mkdirSync(outputDirEn, { recursive: true });

  const files = fs
    .readdirSync(biosDir)
    .filter((f) => f.endsWith(".txt"))
    .map((f) => path.join(biosDir, f));

  console.log(`📁 Found ${files.length} .txt files\n`);

  const extractedBios: ExtractedBio[] = [];
  const linksToAdd: Record<
    string,
    Array<{ platform: string; url: string }>
  > = {};

  for (const filePath of files) {
    const bio = extractBio(filePath);
    if (!bio) continue;

    extractedBios.push(bio);

    // Créer les fichiers .md
    const frPath = path.join(outputDirFr, `${bio.slug}.md`);
    const enPath = path.join(outputDirEn, `${bio.slug}.md`);

    fs.writeFileSync(frPath, bio.bioFr, "utf-8");
    fs.writeFileSync(enPath, bio.bioEn, "utf-8");

    console.log(`✅ Created bio files for: ${bio.slug}`);
    console.log(`   FR: ${frPath}`);
    console.log(`   EN: ${enPath}`);
    if (bio.link) {
      console.log(`   Link: ${bio.link} (${bio.platform})`);
      if (!linksToAdd[bio.slug]) {
        linksToAdd[bio.slug] = [];
      }
      linksToAdd[bio.slug]!.push({ platform: bio.platform, url: bio.link });
    }
    console.log("");
  }

  console.log(`\n🎉 Created ${extractedBios.length} biography files`);

  // Sauvegarder le rapport
  const reportPath = path.join(
    process.cwd(),
    "scripts/bio-extraction-report.json",
  );
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        extractedBios,
        linksToAdd,
        summary: {
          total: extractedBios.length,
          withLinks: Object.keys(linksToAdd).length,
          slugsToDelete: ["amaury-messelier", "franck-sinnassamy"],
          slugsToCreate: ["well-quartet"],
        },
      },
      null,
      2,
    ),
    "utf-8",
  );

  console.log(`\n📄 Report saved to: ${reportPath}`);
}

main().catch(console.error);
