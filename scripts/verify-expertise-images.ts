import fs from "fs";
import path from "path";
import matter from "gray-matter";

const EXPERTISES_DIR = path.join(process.cwd(), "content/expertises");
const PUBLIC_DIR = path.join(process.cwd(), "public");

type ImageField =
  | "imgHome"
  | "img1"
  | "img2"
  | "img3"
  | "img4"
  | "img5"
  | "img6"
  | "img7"
  | "imgFooter";

interface ExpertiseCheck {
  file: string;
  locale: string;
  slug: string;
  missingImages: string[];
  existingImages: string[];
  sectionsCount: number;
  sectionsLayoutCount: number;
}

async function verifyExpertiseImages() {
  const results: ExpertiseCheck[] = [];
  const locales = ["fr", "en"];

  console.log("🔍 Vérification des images des expertises...\n");

  for (const locale of locales) {
    const localeDir = path.join(EXPERTISES_DIR, locale);

    if (!fs.existsSync(localeDir)) {
      console.log(`⚠️  Répertoire ${locale} non trouvé`);
      continue;
    }

    const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(localeDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data: frontmatter, content } = matter(fileContent);

      const slug = frontmatter.slug || path.basename(file, ".md");
      const missingImages: string[] = [];
      const existingImages: string[] = [];

      // Count sections
      const sectionsCount = (content.match(/<!-- section:start -->/g) || [])
        .length;
      const sectionsLayoutCount = frontmatter.sectionsLayout?.length || 0;

      // Check all image fields
      const imageFields: ImageField[] = [
        "imgHome",
        "img1",
        "img2",
        "img3",
        "img4",
        "img5",
        "img6",
        "img7",
        "imgFooter",
      ];

      for (const field of imageFields) {
        const imagePath = frontmatter[field];
        if (imagePath) {
          // Convert /images/... to public/images/...
          const fullPath = path.join(PUBLIC_DIR, imagePath);

          if (fs.existsSync(fullPath)) {
            existingImages.push(`${field}: ${imagePath}`);
          } else {
            missingImages.push(`${field}: ${imagePath}`);
          }
        }
      }

      // Check labels images
      if (frontmatter.labels && Array.isArray(frontmatter.labels)) {
        frontmatter.labels.forEach((label: any, index: number) => {
          if (label.src) {
            const fullPath = path.join(PUBLIC_DIR, label.src);
            if (!fs.existsSync(fullPath)) {
              missingImages.push(`label[${index}].src: ${label.src}`);
            }
          }
        });
      }

      results.push({
        file,
        locale,
        slug,
        missingImages,
        existingImages,
        sectionsCount,
        sectionsLayoutCount,
      });
    }
  }

  // Display results
  console.log("📊 RÉSULTATS DE LA VÉRIFICATION\n");
  console.log("=".repeat(80));

  for (const result of results) {
    const hasIssues =
      result.missingImages.length > 0 ||
      result.sectionsCount !== result.sectionsLayoutCount;

    if (hasIssues) {
      console.log(`\n❌ ${result.locale}/${result.file}`);
      console.log(`   Slug: ${result.slug}`);

      if (result.sectionsCount !== result.sectionsLayoutCount) {
        console.log(
          `   ⚠️  Mismatch: ${result.sectionsCount} sections mais ${result.sectionsLayoutCount} layouts`,
        );
      }

      if (result.missingImages.length > 0) {
        console.log(
          `   ❌ Images manquantes (${result.missingImages.length}):`,
        );
        result.missingImages.forEach((img) => console.log(`      - ${img}`));
      }
    } else {
      console.log(`\n✅ ${result.locale}/${result.file}`);
      console.log(`   Slug: ${result.slug}`);
      console.log(
        `   Sections: ${result.sectionsCount} (layout: ${result.sectionsLayoutCount})`,
      );
      console.log(`   Images: ${result.existingImages.length} trouvées`);
    }
  }

  // Summary
  const totalFiles = results.length;
  const filesWithIssues = results.filter(
    (r) =>
      r.missingImages.length > 0 || r.sectionsCount !== r.sectionsLayoutCount,
  ).length;
  const totalMissingImages = results.reduce(
    (sum, r) => sum + r.missingImages.length,
    0,
  );

  console.log("\n" + "=".repeat(80));
  console.log("\n📈 RÉSUMÉ:");
  console.log(`   Fichiers vérifiés: ${totalFiles}`);
  console.log(`   Fichiers avec problèmes: ${filesWithIssues}`);
  console.log(`   Images manquantes au total: ${totalMissingImages}`);

  if (filesWithIssues === 0) {
    console.log("\n🎉 Toutes les expertises sont OK !");
  } else {
    console.log("\n⚠️  Des corrections sont nécessaires.");
  }
}

verifyExpertiseImages().catch(console.error);
