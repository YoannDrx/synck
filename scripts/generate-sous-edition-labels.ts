/**
 * Générer automatiquement la liste complète des labels pour sous-edition.md
 */

import fs from "fs";
import path from "path";

const logoDir = path.join(
  process.cwd(),
  "public/images/projets/expertises/sous-edition/logo-label-soused",
);

// Lire tous les fichiers PNG dans le dossier
const logoFiles = fs
  .readdirSync(logoDir)
  .filter((file) => file.endsWith(".png"))
  .sort((a, b) => {
    const numA = parseInt(a.replace(".png", ""), 10);
    const numB = parseInt(b.replace(".png", ""), 10);
    return numA - numB;
  });

console.log(`📋 Génération de ${logoFiles.length} labels...\n`);

// Générer les entrées labels au format attendu par le parser
const labels = logoFiles.map((file) => {
  const name = file.replace(".png", "");
  const src = `/images/projets/expertises/sous-edition/logo-label-soused/${file}`;
  return `  - { name: "label-${name}", src: "${src}", href: "" }`;
});

const labelsSection = `labels:\n${labels.join("\n")}`;

console.log("✅ Labels générés:\n");
console.log(labelsSection);

// Sauvegarder dans un fichier temporaire pour copier/coller
fs.writeFileSync(
  path.join(process.cwd(), "scripts/labels-generated.txt"),
  labelsSection,
);

console.log(
  '\n💾 Sauvegardé dans "scripts/labels-generated.txt" pour référence',
);
