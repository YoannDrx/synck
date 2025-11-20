/**
 * Réduire la taille des images des logos dans gestion-administrative-et-editoriale
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const imagesToResize = [
  {
    path: "public/images/projets/expertises/gestion-administrative-et-editoriale/photo2-gestionadmin.jpg",
    name: "little big story",
  },
  {
    path: "public/images/projets/expertises/gestion-administrative-et-editoriale/photo3-gestionadmin.jpg",
    name: "13 prods",
  },
  {
    path: "public/images/projets/expertises/gestion-administrative-et-editoriale/photo4-gestionadmin.jpg",
    name: "pop film",
  },
  {
    path: "public/images/projets/expertises/gestion-administrative-et-editoriale/photo5-gestionadmin.jpg",
    name: "via découverte",
  },
];

const TARGET_WIDTH = 200; // Largeur cible pour les logos

console.log("🖼️  Redimensionnement des logos...\n");

async function resizeImage(imgPath: string, name: string) {
  const fullPath = path.join(process.cwd(), imgPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`   ⚠️  Image non trouvée: ${name}`);
    return;
  }

  try {
    const metadata = await sharp(fullPath).metadata();
    const originalWidth = metadata.width || 0;
    const originalSize = fs.statSync(fullPath).size;

    // Créer une version redimensionnée
    await sharp(fullPath)
      .resize(TARGET_WIDTH, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(fullPath + ".tmp");

    // Remplacer l'original
    fs.renameSync(fullPath + ".tmp", fullPath);

    const newSize = fs.statSync(fullPath).size;
    const savedKB = ((originalSize - newSize) / 1024).toFixed(1);

    console.log(
      `   ✅ ${name}: ${originalWidth}px → ${TARGET_WIDTH}px (économie: ${savedKB} KB)`,
    );
  } catch (error: unknown) {
    console.error(`   ❌ Erreur pour ${name}:`, error);
  }
}

async function main() {
  for (const img of imagesToResize) {
    await resizeImage(img.path, img.name);
  }
  console.log("\n✨ Redimensionnement terminé !");
}

main();
