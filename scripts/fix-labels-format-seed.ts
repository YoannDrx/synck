/**
 * Corriger le format des labels dans seed-data/expertises aussi
 */

import fs from "fs";
import path from "path";

const files = [
  "seed-data/expertises/fr/sous-edition.md",
  "seed-data/expertises/en/sous-edition.md",
];

const newLabels = `labels:
  - { name: "Little Big Story", src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo2-gestionadmin.jpg", href: "https://littlebigstory.fr" }
  - { name: "13 Prods", src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo3-gestionadmin.jpg", href: "https://www.13prods.fr" }
  - { name: "Pop Films", src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo4-gestionadmin.jpg", href: "https://popfilms.fr" }
  - { name: "Via Découvertes Films", src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo5-gestionadmin.jpg", href: "http://www.viadecouvertes.fr" }`;

console.log("🔧 Correction du format des labels dans seed-data...\n");

files.forEach((file) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Fichier non trouvé: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Trouver et remplacer la section labels existante
  const labelsRegex = /labels:\s*\n(?:\s*-\s*(?:name|src|href):[^\n]*\n?)+/g;

  if (labelsRegex.test(content)) {
    content = content.replace(labelsRegex, newLabels + "\n");
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ ${file}: format corrigé`);
  } else {
    console.log(`   ⚠️  ${file}: section labels non trouvée`);
  }
});

console.log("\n✨ Corrections terminées !");
