import fs from "fs";
import path from "path";

console.log("🔄 Phase 2 : Mise à jour des fichiers locaux\n");

// Chemins
const backupsDir = path.join(process.cwd(), "backups");
const contentDir = path.join(process.cwd(), "content");
const dataDir = path.join(contentDir, "projets");

// 1. Charger les backups
console.log("📦 Chargement des backups...");
const worksBackup = JSON.parse(
  fs.readFileSync(path.join(backupsDir, "backup-works-full.json"), "utf-8"),
);
const composersBackup = JSON.parse(
  fs.readFileSync(path.join(backupsDir, "backup-composers-full.json"), "utf-8"),
);
const labelsBackup = JSON.parse(
  fs.readFileSync(path.join(backupsDir, "backup-labels.json"), "utf-8"),
);

// 2. Charger metadata.json existant
const metadataFrPath = path.join(dataDir, "fr", "metadata.json");
const metadataEnPath = path.join(dataDir, "en", "metadata.json");

const metadataFr = JSON.parse(fs.readFileSync(metadataFrPath, "utf-8"));
const metadataEn = JSON.parse(fs.readFileSync(metadataEnPath, "utf-8"));

console.log(
  `   Current metadata: ${metadataFr.length} works FR, ${metadataEn.length} works EN`,
);
console.log(`   Backup: ${worksBackup.length} works total\n`);

// 3. Identifier les works manquants
const existingSlugs = new Set(metadataFr.map((w: any) => w.slug));
const missingWorks = worksBackup.filter((w: any) => !existingSlugs.has(w.slug));

console.log(`📌 ${missingWorks.length} works manquants identifiés\n`);

if (missingWorks.length > 0) {
  console.log("   Exemples:");
  missingWorks.slice(0, 5).forEach((w: any) => {
    const titleFr = w.translations.find((t: any) => t.locale === "fr")?.title;
    console.log(`   - ${w.slug} : "${titleFr}"`);
  });
  console.log(`   ... et ${missingWorks.length - 5} autres\n`);
}

// 4. Convertir works DB vers format metadata.json
console.log("🔄 Conversion des works manquants vers format metadata.json...");

function convertWorkToMetadata(work: any, locale: "fr" | "en") {
  const translation = work.translations.find((t: any) => t.locale === locale);
  const category = work.category?.translations?.find(
    (t: any) => t.locale === locale,
  );

  // Trouver le dernier ID dans metadata
  const currentMetadata = locale === "fr" ? metadataFr : metadataEn;
  const maxId = Math.max(...currentMetadata.map((w: any) => w.id || 0));
  const newId = maxId + 1 + missingWorks.indexOf(work);

  return {
    id: newId,
    slug: work.slug,
    title: translation?.title || work.slug,
    subtitle: translation?.subtitle || "",
    category: category?.name || work.category?.slug || "",
    externalLink: work.externalUrl || undefined,
    linkSpotify: work.spotifyUrl || undefined,
    src: work.coverImage?.path?.replace("public", "") || "",
    height: "",
    releaseDate: work.releaseDate || undefined,
    genre: work.genre || undefined,
    compositeurs: work.contributions.map((c: any) => ({
      name:
        c.composer.translations?.find((t: any) => t.locale === locale)?.name ||
        c.composer.slug,
      compoImg: c.composer.image?.path?.replace("public", "") || "",
      links: c.composer.externalUrl || "",
    })),
  };
}

const newWorksFr = missingWorks.map((w: any) => convertWorkToMetadata(w, "fr"));
const newWorksEn = missingWorks.map((w: any) => convertWorkToMetadata(w, "en"));

console.log(`   ✅ ${newWorksFr.length} works convertis\n`);

// 5. Fusionner avec metadata existant
console.log("📝 Fusion avec metadata.json existant...");

const updatedMetadataFr = [...metadataFr, ...newWorksFr];
const updatedMetadataEn = [...metadataEn, ...newWorksEn];

// Backup avant modification
fs.writeFileSync(
  path.join(backupsDir, "metadata.json.backup"),
  JSON.stringify(metadataFr, null, 2),
);
fs.writeFileSync(
  path.join(backupsDir, "metadata-en.json.backup"),
  JSON.stringify(metadataEn, null, 2),
);

// Écrire les nouveaux fichiers
fs.writeFileSync(metadataFrPath, JSON.stringify(updatedMetadataFr, null, 2));
fs.writeFileSync(metadataEnPath, JSON.stringify(updatedMetadataEn, null, 2));

console.log(
  `   ✅ metadata.json mis à jour: ${updatedMetadataFr.length} works`,
);
console.log(
  `   ✅ metadata-en.json mis à jour: ${updatedMetadataEn.length} works\n`,
);

// 6. Créer data/labels.json
console.log("🏷️  Création de data/labels.json...");

const labelsData = labelsBackup.map((label: any, index: number) => ({
  id: index + 1,
  slug: label.slug,
  name: label.name,
  nameFr: label.name, // À affiner si vous avez des traductions
  nameEn: label.name,
  website: label.website || "",
  description: label.description || "",
}));

fs.writeFileSync(
  path.join(contentDir, "labels.json"),
  JSON.stringify(labelsData, null, 2),
);

console.log(
  `   ✅ ${labelsData.length} labels exportés vers content/labels.json\n`,
);

// 7. Analyser les liens multiples des compositeurs
console.log("🔗 Analyse des liens compositeurs...");

const composersWithMultipleLinks = composersBackup.filter(
  (c: any) => c.links && c.links.length > 1,
);

console.log(
  `   ${composersWithMultipleLinks.length} compositeurs avec liens multiples\n`,
);

if (composersWithMultipleLinks.length > 0) {
  console.log("   Exemples:");
  composersWithMultipleLinks.slice(0, 3).forEach((c: any) => {
    console.log(`   - ${c.slug}: ${c.links.length} liens`);
    c.links.forEach((link: any) => {
      console.log(`     • ${link.platform}: ${link.url.substring(0, 50)}...`);
    });
  });
}

// Créer fichier avec mapping des liens
const composerLinksMapping = composersBackup.map((c: any) => ({
  slug: c.slug,
  name: c.translations?.find((t: any) => t.locale === "fr")?.name || c.slug,
  externalUrl: c.externalUrl,
  links: c.links.map((link: any) => ({
    platform: link.platform,
    url: link.url,
    label: link.label,
    order: link.order,
  })),
}));

fs.writeFileSync(
  path.join(contentDir, "composer-links.json"),
  JSON.stringify(composerLinksMapping, null, 2),
);

console.log(`\n   ✅ Liens exportés vers content/composer-links.json`);

// 8. Rapport final
console.log("\n" + "=".repeat(60));
console.log("✨ Phase 2 terminée !");
console.log("=".repeat(60));
console.log("\n📊 Résumé des modifications:");
console.log(
  `   • metadata.json: ${metadataFr.length} → ${updatedMetadataFr.length} works (+${newWorksFr.length})`,
);
console.log(
  `   • metadata-en.json: ${metadataEn.length} → ${updatedMetadataEn.length} works (+${newWorksEn.length})`,
);
console.log(`   • content/labels.json: créé avec ${labelsData.length} labels`);
console.log(
  `   • content/composer-links.json: créé avec ${composersBackup.length} compositeurs`,
);

console.log("\n📁 Fichiers créés/modifiés:");
console.log("   • content/projets/fr/metadata.json");
console.log("   • content/projets/en/metadata.json");
console.log("   • content/labels.json");
console.log("   • content/composer-links.json");
console.log("   • backups/metadata.json.backup");
console.log("   • backups/metadata-en.json.backup");

console.log("\n⚠️  Actions manuelles requises:");
console.log("   1. Créer fonction seedLabels() dans prisma/seed.ts");
console.log("   2. Modifier seed pour lire composer-links.json");
console.log("   3. Créer content/expertises/*/mise-en-page.md");
console.log("\n✅ Données locales complètes et prêtes pour seed!");
