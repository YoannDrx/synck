import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Debug expertise images...\n");

  const expertise = await prisma.expertise.findFirst({
    where: { slug: "droits-auteur" },
    include: {
      translations: { where: { locale: "fr" } },
      coverImage: true,
      images: { orderBy: { path: "asc" } },
    },
  });

  if (!expertise) {
    console.log("❌ Expertise not found");
    return;
  }

  console.log("Expertise:", expertise.slug);
  console.log("Cover image:", expertise.coverImage?.path);
  console.log("\nGallery images:");
  expertise.images.forEach((img, i) => {
    console.log(`  [${i}] ${img.path}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
