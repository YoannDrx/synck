import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const newDocumentaires = [
  {
    slug: "gang-stories",
    titleFr: "Gang Stories",
    titleEn: "Gang Stories",
    descriptionFr: "",
    descriptionEn: "",
    imagePath: "public/images/projets/documentaires/13prods/gang-stories.jpg",
  },
  {
    slug: "hors-radar",
    titleFr: "Hors Radar",
    titleEn: "Hors Radar",
    descriptionFr: "",
    descriptionEn: "",
    imagePath: "public/images/projets/documentaires/13prods/hors-radar.jpg",
  },
  {
    slug: "ivg-en-polynesie",
    titleFr: "IVG en Polynésie",
    titleEn: "IVG en Polynésie",
    descriptionFr: "",
    descriptionEn: "",
    imagePath:
      "public/images/projets/documentaires/13prods/ivg-en-polynesie.jpeg",
  },
  {
    slug: "la-dette",
    titleFr: "La Dette",
    titleEn: "La Dette",
    descriptionFr: "",
    descriptionEn: "",
    imagePath: "public/images/projets/documentaires/13prods/la-dette.jpg",
  },
  {
    slug: "un-jou-je-serai",
    titleFr: "Un Jour Je Serai",
    titleEn: "Un Jour Je Serai",
    descriptionFr: "",
    descriptionEn: "",
    imagePath:
      "public/images/projets/documentaires/13prods/un-jou-je-serai.jpg",
  },
  {
    slug: "veilleur-de-nuit",
    titleFr: "Veilleur de Nuit",
    titleEn: "Veilleur de Nuit",
    descriptionFr: "",
    descriptionEn: "",
    imagePath:
      "public/images/projets/documentaires/13prods/veilleur-de-nuit.jpg",
  },
];

async function generateBlurDataUrl(imagePath: string): Promise<string> {
  const imageBuffer = readFileSync(imagePath);
  const { data, info } = await sharp(imageBuffer)
    .resize(10, 10, { fit: "inside" })
    .blur()
    .toBuffer({ resolveWithObject: true });

  return `data:image/${info.format};base64,${data.toString("base64")}`;
}

async function main() {
  console.log("🎬 Ajout des nouveaux documentaires 13prods...\n");

  // Get category and label
  const category = await prisma.category.findUnique({
    where: { slug: "documentaires" },
  });

  if (!category) {
    throw new Error('Catégorie "documentaires" non trouvée');
  }

  const label = await prisma.label.findFirst({
    where: { slug: "13prods" },
  });

  if (!label) {
    throw new Error('Label "13prods" non trouvé');
  }

  for (const doc of newDocumentaires) {
    console.log(`📄 Traitement de "${doc.titleFr}"...`);

    // Check if work already exists
    const existing = await prisma.work.findUnique({
      where: { slug: doc.slug },
    });

    if (existing) {
      console.log(
        `  ⚠️  Le documentaire "${doc.slug}" existe déjà, passage au suivant\n`,
      );
      continue;
    }

    // Generate blur data URL
    const blurDataUrl = await generateBlurDataUrl(doc.imagePath);

    // Get image metadata
    const imageBuffer = readFileSync(doc.imagePath);
    const metadata = await sharp(imageBuffer).metadata();

    // Create Asset
    const publicPath = doc.imagePath.replace("public", "");
    const asset = await prisma.asset.create({
      data: {
        path: publicPath,
        alt: doc.titleFr,
        width: metadata.width!,
        height: metadata.height!,
        blurDataUrl,
        aspectRatio:
          metadata.width && metadata.height
            ? metadata.width / metadata.height
            : null,
      },
    });

    console.log(`  ✅ Asset créé: ${asset.path}`);

    // Create Work with translations
    const work = await prisma.work.create({
      data: {
        slug: doc.slug,
        categoryId: category.id,
        labelId: label.id,
        coverImageId: asset.id,
        isActive: true,
        translations: {
          create: [
            {
              locale: "fr",
              title: doc.titleFr,
              description: doc.descriptionFr || null,
            },
            {
              locale: "en",
              title: doc.titleEn,
              description: doc.descriptionEn || null,
            },
          ],
        },
      },
    });

    console.log(`  ✅ Documentaire créé: ${doc.titleFr}\n`);
  }

  console.log("✨ Tous les documentaires ont été ajoutés avec succès!");
}

main()
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
