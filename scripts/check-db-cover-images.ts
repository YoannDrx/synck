import { PrismaClient } from "@prisma/client";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Check Database Cover Images\n");
  console.log("=".repeat(60));

  // Récupérer tous les works avec leur coverImage
  const works = await prisma.work.findMany({
    select: {
      id: true,
      slug: true,
      translations: {
        select: {
          locale: true,
          title: true,
        },
      },
      coverImage: {
        select: {
          id: true,
          path: true,
        },
      },
    },
    orderBy: {
      slug: "asc",
    },
  });

  console.log(`Found ${works.length} works\n`);

  let withCover = 0;
  let withoutCover = 0;
  const coverPaths: string[] = [];

  for (const work of works) {
    const frTranslation = work.translations.find((t) => t.locale === "fr");
    const enTranslation = work.translations.find((t) => t.locale === "en");
    const title = frTranslation?.title || enTranslation?.title || work.slug;

    if (work.coverImage) {
      withCover++;
      coverPaths.push(work.coverImage.path);

      const filename = path.basename(work.coverImage.path);
      const hasSuffix =
        /-\d+\.jpg$/.test(filename) || /\d+\.jpg$/.test(filename);

      console.log(`${hasSuffix ? "📌" : "✅"} ${title}`);
      console.log(`   Cover: ${work.coverImage.path}`);

      if (hasSuffix) {
        console.log(`   ⚠️  Has suffix`);
      }
    } else {
      withoutCover++;
      console.log(`❌ ${title}`);
      console.log(`   No cover image`);
    }

    console.log();
  }

  console.log("=".repeat(60));
  console.log("📊 SUMMARY\n");
  console.log(`Total works:              ${works.length}`);
  console.log(`With cover image:         ${withCover}`);
  console.log(`Without cover image:      ${withoutCover}`);
  console.log("=".repeat(60));

  await prisma.$disconnect();
}

main();
