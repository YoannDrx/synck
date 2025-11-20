/**
 * Appliquer la liste complète des 59 labels à tous les fichiers sous-edition
 */

import fs from "fs";
import path from "path";

const labelsContent = fs.readFileSync(
  path.join(process.cwd(), "scripts/labels-generated.txt"),
  "utf-8",
);

const files = [
  "content/expertises/en/sous-edition.md",
  "seed-data/expertises/fr/sous-edition.md",
  "seed-data/expertises/en/sous-edition.md",
];

console.log("🔄 Application des 59 labels à tous les fichiers...\n");

files.forEach((file) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Fichier non trouvé: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Remplacer toute la section labels existante
  const labelsRegex = /labels:[\s\S]*?(?=\n---)/;

  if (labelsRegex.test(content)) {
    content = content.replace(labelsRegex, labelsContent);
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ ${file}: 59 labels appliqués`);
  } else {
    console.log(`   ⚠️  ${file}: pattern labels non trouvé`);
  }
});

console.log("\n✨ Application terminée !");
