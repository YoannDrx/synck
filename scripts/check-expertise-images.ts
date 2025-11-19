import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

async function main() {
  const expertises = await prisma.expertise.findMany({
    where: { isActive: true },
    include: {
      coverImage: true,
      translations: {
        where: { locale: "fr" },
      },
    },
    orderBy: { order: "asc" },
  });

  console.log("📋 Expertises et leurs images:\n");

  for (const exp of expertises) {
    const title = exp.translations[0]?.title || exp.slug;
    const imgPath = exp.coverImage?.path || "PAS D'IMAGE";

    console.log(`✓ ${title}`);
    console.log(`  Chemin DB: ${imgPath}`);

    if (exp.coverImage?.path) {
      const fullPath = path.join(process.cwd(), exp.coverImage.path);
      const exists = fs.existsSync(fullPath);
      console.log(`  Existe: ${exists ? "✅" : "❌"}`);
      if (!exists) {
        console.log(`  Fichier attendu: ${fullPath}`);
      }
    }
    console.log();
  }

  await prisma.$disconnect();
}

main().catch(console.error);
