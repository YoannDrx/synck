/**
 * Ajouter la galerie de labels dans les fichiers sous-edition.md
 */

import fs from "fs";
import path from "path";

const labels = `labels:
  - name: "Little Big Story"
    src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo2-gestionadmin.jpg"
    href: "https://littlebigstory.fr"
  - name: "13 Prods"
    src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo3-gestionadmin.jpg"
    href: "https://www.13prods.fr"
  - name: "Pop Films"
    src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo4-gestionadmin.jpg"
    href: "https://popfilms.fr"
  - name: "Via Découvertes Films"
    src: "/images/projets/expertises/gestion-administrative-et-editoriale/photo5-gestionadmin.jpg"
    href: "http://www.viadecouvertes.fr"`;

const files = [
  "seed-data/expertises/fr/sous-edition.md",
  "seed-data/expertises/en/sous-edition.md",
  "content/expertises/fr/sous-edition.md",
  "content/expertises/en/sous-edition.md",
];

console.log("➕ Ajout de la galerie de labels dans sous-edition.md...\n");

files.forEach((file) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Fichier non trouvé: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Vérifier si labels: existe déjà
  if (content.includes("labels:")) {
    console.log(`   ⏭️  ${file}: labels déjà présent, ignoré`);
    return;
  }

  // Trouver la fin du frontmatter
  const frontmatterEnd = content.indexOf("---", 3);

  if (frontmatterEnd === -1) {
    console.log(`   ❌ ${file}: frontmatter invalide`);
    return;
  }

  // Insérer labels avant la fin du frontmatter
  const before = content.substring(0, frontmatterEnd);
  const after = content.substring(frontmatterEnd);

  content = `${before}${labels}\n${after}`;

  fs.writeFileSync(filePath, content);
  console.log(`   ✅ ${file}: labels ajoutés`);
});

console.log("\n✨ Ajout terminé !");
