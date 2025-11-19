import { prisma } from "../lib/prisma.js";
import fs from "fs";
import sharp from "sharp";

console.log("🔧 Association des coverImages manquantes\n");

interface ImageToAssociate {
  slug: string;
  imagePath: string;
}

const imagesToAssociate: ImageToAssociate[] = [
  {
    slug: "les-oublies-de-latome",
    imagePath:
      "public/images/projets/documentaires/little-big-story/les-oublies-de-latome-1.jpg",
  },
  {
    slug: "lofi-hip-hop",
    imagePath: "public/images/projets/clips/lofi-hip-hop.jpg",
  },
];

async function createAssetFromImage(imagePath: string) {
  // Vérifier si l'asset existe déjà
  const existingAsset = await prisma.asset.findFirst({
    where: { path: imagePath },
  });

  if (existingAsset) {
    console.log(`   ℹ️  Asset existe déjà: ${imagePath}`);
    return existingAsset;
  }

  // Lire les métadonnées de l'image
  const imageBuffer = fs.readFileSync(imagePath);
  const metadata = await sharp(imageBuffer).metadata();

  // Générer blur placeholder
  const blurBuffer = await sharp(imageBuffer)
    .resize(20, 20, { fit: "inside" })
    .blur(10)
    .toBuffer();
  const base64 = blurBuffer.toString("base64");
  const blurDataUrl = "data:image/jpeg;base64," + base64;

  // Créer l'asset
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const aspectRatio = width && height ? width / height : null;

  const asset = await prisma.asset.create({
    data: {
      path: imagePath,
      width,
      height,
      aspectRatio,
      blurDataUrl,
    },
  });

  console.log(`   ✅ Asset créé: ${imagePath}`);
  return asset;
}

async function main() {
  console.log(`📋 Traitement de ${imagesToAssociate.length} works...\n`);

  for (const { slug, imagePath } of imagesToAssociate) {
    const work = await prisma.work.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        coverImageId: true,
        translations: {
          where: { locale: "fr" },
          select: { title: true },
        },
      },
    });

    if (!work) {
      console.log(`❌ Work "${slug}" non trouvé en DB`);
      continue;
    }

    const title = work.translations[0]?.title || slug;

    // Vérifier si le fichier existe
    if (!fs.existsSync(imagePath)) {
      console.log(`❌ "${title}" - Fichier introuvable: ${imagePath}`);
      continue;
    }

    // Créer ou récupérer l'asset
    const asset = await createAssetFromImage(imagePath);

    // Associer l'asset au work
    await prisma.work.update({
      where: { id: work.id },
      data: { coverImageId: asset.id },
    });

    console.log(`✅ "${title}" - CoverImage associée\n`);
  }

  console.log("=".repeat(60));
  console.log("✨ Association terminée !");
  console.log("=".repeat(60));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
