/**
 * Nettoyer les images imgFooter des fichiers expertises
 */

import fs from "fs";
import path from "path";

const expertisesDir = path.join(process.cwd(), "seed-data/expertises");

const files = [
  "fr/droits-voisins.md",
  "en/droits-voisins.md",
  "fr/gestion-distribution.md",
  "en/gestion-distribution.md",
  "fr/sous-edition.md",
  "en/sous-edition.md",
  "fr/dossier-subvention.md",
  "en/dossier-subvention.md",
];

console.log("🧹 Nettoyage des images imgFooter...\n");

files.forEach((file) => {
  const filePath = path.join(expertisesDir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Fichier non trouvé: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  // Supprimer la ligne imgFooter
  const updatedContent = content.replace(/^imgFooter:.*$/m, "");

  fs.writeFileSync(filePath, updatedContent);
  console.log(`   ✅ Nettoyé: ${file}`);
});

console.log("\n✨ Nettoyage terminé !");
