import fs from "fs";
import path from "path";
import matter from "gray-matter";

const EXPERTISES_DIR = path.join(process.cwd(), "content/expertises");

// Files to translate
const filesToTranslate = [
  "droits-auteur.md",
  "droits-voisins.md",
  "gestion-administrative-et-editoriale.md",
  "gestion-distribution.md",
  "sous-edition.md",
];

interface TranslationMap {
  [key: string]: string;
}

// Common translations for frontmatter
const titleTranslations: TranslationMap = {
  "Gestion des droits d'auteur": "Copyright Management",
  "Gestion des droits voisins": "Neighboring Rights Management",
  "Gestion administrative et éditoriale":
    "Administrative and Editorial Management",
  "Gestion de la distribution physique et digitale":
    "Physical and Digital Distribution Management",
  "Gestion des oeuvres en sous-édition": "Sub-publishing Management",
};

const descriptionTranslations: TranslationMap = {
  "Le terme auteur désigne l'individu qui rédige les paroles d'une chanson":
    "The term 'author' refers to the individual who writes the lyrics of a song",
  "description de la gestion des droits voisins":
    "Neighboring rights management description",
  "Description de la gestion administrative et éditoriale":
    "Administrative and editorial management description",
  "description de la gestion de la distribution physique et digitale":
    "Physical and digital distribution management description",
  "description de la sous édition": "Sub-publishing description",
};

async function translateExpertise(filename: string) {
  console.log(`\n📝 Traduction de ${filename}...`);

  const frPath = path.join(EXPERTISES_DIR, "fr", filename);
  const enPath = path.join(EXPERTISES_DIR, "en", filename);

  if (!fs.existsSync(frPath)) {
    console.log(`  ⚠️  Fichier FR non trouvé: ${frPath}`);
    return;
  }

  const frContent = fs.readFileSync(frPath, "utf-8");
  const { data: frFrontmatter, content: frBody } = matter(frContent);

  // Translate frontmatter
  const enFrontmatter = { ...frFrontmatter };
  enFrontmatter.title =
    titleTranslations[frFrontmatter.title] || frFrontmatter.title;
  enFrontmatter.description =
    descriptionTranslations[frFrontmatter.description] ||
    frFrontmatter.description;

  // For now, keep the French content and add a note
  // You'll need to manually translate the content or use a translation API
  const enBody = `<!-- section:start -->

⚠️ **Translation needed** - This content needs to be translated from French to English.

Please translate the content from the French version while maintaining the same structure and markdown formatting.

<!-- section:end -->

${frBody}`;

  const enContent = matter.stringify(enBody, enFrontmatter);

  fs.writeFileSync(enPath, enContent, "utf-8");
  console.log(`  ✅ Fichier EN créé: ${enPath}`);
  console.log(`  ⚠️  La traduction du contenu doit être faite manuellement`);
}

async function main() {
  console.log("🌐 Début de la préparation des fichiers EN...\n");

  for (const file of filesToTranslate) {
    await translateExpertise(file);
  }

  console.log("\n✅ Préparation terminée!");
  console.log("\n📌 Prochaines étapes:");
  console.log("  1. Traduire le contenu de chaque fichier EN manuellement");
  console.log(
    "  2. Garder la même structure de sections (<!-- section:start --> / <!-- section:end -->)",
  );
  console.log("  3. Garder le même nombre de sections que la version FR");
  console.log("  4. Relancer verify-expertise-images.ts pour vérifier");
}

main().catch(console.error);
