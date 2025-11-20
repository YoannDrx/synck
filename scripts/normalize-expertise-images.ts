/**
 * Normaliser toutes les images des expertises :
 * 1. Renommer avec convention logique : {slug}-{type}.jpg
 * 2. Mettre imgFooter à "" partout
 * 3. Mettre à jour tous les chemins dans les .md
 */

import fs from "fs";
import path from "path";

const expertises = [
  {
    slug: "droits-auteur",
    images: {
      imgHome: "Home-PHOTODROITSDAUTEUR.JPG",
      img1: "photo1-droitsdauteur.jpeg",
      img2: "photo2-droitsdauteur.JPG",
      img3: "photo3-droitsdauteur.JPG",
      img4: "photo4-droitsdauteur.JPG",
      img5: "photo5-droitsdauteur.JPG",
    },
  },
  {
    slug: "droits-voisins",
    images: {
      imgHome: "Home-Photodroitsvoisins.JPG",
      img1: "photo1-droitsvoisins.JPG",
      img2: "photo2-droitsvoisins.JPG",
      img3: "photo4-droitsvoisins.JPG", // Note: photo4 est utilisé pour img3
      img4: "photo5-droitsvoisins.JPG",
      img5: "photo7-droitsvoisins.JPG",
    },
  },
  {
    slug: "gestion-administrative-et-editoriale",
    images: {
      imgHome: "Home-PhotoGestionEditoriale.JPG",
      img1: "photo1-gestionadmin.jpg",
      img2: "photo2-gestionadmin.jpg",
      img3: "photo3-gestionadmin.jpg",
      img4: "photo4-gestionadmin.jpg",
      img5: "photo5-gestionadmin.jpg",
    },
  },
  {
    slug: "gestion-distribution",
    images: {
      imgHome: "Home-PhotoGestionDistrib.JPG",
      img1: "photo1-gestiondistrib.JPG",
      img2: "photo2-gestiondistrib.JPG",
      img3: "photo3-gestiondistrib.JPG",
      img4: "photo4-gestiondistrib.JPG",
    },
  },
  {
    slug: "sous-edition",
    images: {
      imgHome: "Home-PhotoGestionSoused.JPG",
      img1: "photo1-soused.JPG",
      img2: "photo2-soused.JPG",
      img3: "photo3-soused.JPG",
    },
  },
  {
    slug: "dossier-subvention",
    images: {
      imgHome: "Home-GestionSubventions.JPG",
      img1: "photo1-subvention.JPG",
      img2: "photo2-subvention.JPG",
      img3: "photo3-subvention.png",
      img4: "photo4-subvention.JPG",
      img5: "photo5-subvention.JPG",
    },
  },
];

console.log("🔄 Normalisation des images expertises...\n");

const renameMapping: Record<string, string> = {};

// Étape 1: Renommer les fichiers physiquement
expertises.forEach((expertise) => {
  const baseDir = path.join(
    process.cwd(),
    "public/images/projets/expertises",
    expertise.slug,
  );

  Object.entries(expertise.images).forEach(([key, oldFilename]) => {
    const oldPath = path.join(baseDir, oldFilename);

    // Déterminer le nouveau nom
    let newFilename: string;
    if (key === "imgHome") {
      newFilename = `${expertise.slug}-home.jpg`;
    } else {
      const sectionNum = key.replace("img", "");
      newFilename = `${expertise.slug}-section-${sectionNum}.jpg`;
    }

    const newPath = path.join(baseDir, newFilename);

    // Sauvegarder le mapping pour mise à jour des .md
    const oldUrlPath = `/images/projets/expertises/${expertise.slug}/${oldFilename}`;
    const newUrlPath = `/images/projets/expertises/${expertise.slug}/${newFilename}`;
    renameMapping[oldUrlPath] = newUrlPath;

    // Renommer le fichier
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`   ✅ ${oldFilename} → ${newFilename}`);
    } else {
      console.log(`   ⚠️  Fichier non trouvé: ${oldFilename}`);
    }
  });
});

console.log("\n📝 Mise à jour des fichiers markdown...\n");

// Étape 2: Mettre à jour les fichiers .md
const mdFiles = [
  "seed-data/expertises/fr/droits-auteur.md",
  "seed-data/expertises/en/droits-auteur.md",
  "content/expertises/fr/droits-auteur.md",
  "content/expertises/en/droits-auteur.md",
  "seed-data/expertises/fr/droits-voisins.md",
  "seed-data/expertises/en/droits-voisins.md",
  "content/expertises/fr/droits-voisins.md",
  "content/expertises/en/droits-voisins.md",
  "seed-data/expertises/fr/gestion-administrative-et-editoriale.md",
  "seed-data/expertises/en/gestion-administrative-et-editoriale.md",
  "content/expertises/fr/gestion-administrative-et-editoriale.md",
  "content/expertises/en/gestion-administrative-et-editoriale.md",
  "seed-data/expertises/fr/gestion-distribution.md",
  "seed-data/expertises/en/gestion-distribution.md",
  "content/expertises/fr/gestion-distribution.md",
  "content/expertises/en/gestion-distribution.md",
  "seed-data/expertises/fr/sous-edition.md",
  "seed-data/expertises/en/sous-edition.md",
  "content/expertises/fr/sous-edition.md",
  "content/expertises/en/sous-edition.md",
  "seed-data/expertises/fr/dossier-subvention.md",
  "seed-data/expertises/en/dossier-subvention.md",
  "content/expertises/fr/dossier-subvention.md",
  "content/expertises/en/dossier-subvention.md",
];

mdFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Fichier non trouvé: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let changes = 0;

  // Remplacer tous les anciens chemins par les nouveaux
  Object.entries(renameMapping).forEach(([oldPath, newPath]) => {
    if (content.includes(oldPath)) {
      content = content.replace(new RegExp(oldPath, "g"), newPath);
      changes++;
    }
  });

  // Vider imgFooter s'il existe
  if (content.includes("imgFooter:")) {
    content = content.replace(/imgFooter:\s*[^\n]+/g, 'imgFooter: ""');
    changes++;
  }

  // Enlever les guillemets des chemins d'images pour uniformiser
  content = content.replace(
    /(img(?:Home|Footer|\d|2Link|3Link|4Link|5Link)):\s*"([^"]+)"/g,
    "$1: $2",
  );

  fs.writeFileSync(filePath, content);
  console.log(`   ✅ ${file}: ${changes} modifications`);
});

console.log("\n✨ Normalisation terminée !");
console.log("📋 Résumé:");
console.log(
  `   - ${Object.keys(renameMapping).length} images renommées en .jpg minuscule`,
);
console.log("   - imgFooter vidé dans tous les fichiers");
console.log("   - Guillemets supprimés pour uniformiser le format YAML");
