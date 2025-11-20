/**
 * Vérifier quelles images de documentaires existent
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const mdPath = path.join(
  process.cwd(),
  "seed-data/expertises/fr/gestion-administrative-et-editoriale.md",
);

const fileContent = fs.readFileSync(mdPath, "utf-8");
const { data } = matter(fileContent);

const documentaires = data.documentaires as Array<{
  title: string;
  href: string;
  category: string;
}>;

console.log("🔍 Vérification des images documentaires...\n");

const missing: string[] = [];
const existing: string[] = [];

documentaires.forEach((doc) => {
  const imagePath = path.join(process.cwd(), "public", doc.href);
  const exists = fs.existsSync(imagePath);

  if (exists) {
    existing.push(doc.title);
  } else {
    missing.push(doc.title);
    console.log(`   ❌ ${doc.title}`);
    console.log(`      Cherché: ${doc.href}`);
  }
});

console.log(`\n📊 Résumé:`);
console.log(`   ✅ Images trouvées: ${existing.length}`);
console.log(`   ❌ Images manquantes: ${missing.length}`);

if (missing.length > 0) {
  console.log(`\n💡 Titres manquants:`);
  missing.forEach((title) => console.log(`   - ${title}`));
}
