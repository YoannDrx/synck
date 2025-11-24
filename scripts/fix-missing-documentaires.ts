#!/usr/bin/env tsx
/* eslint-disable no-console */

import fs from "fs";
import path from "path";

type Work = {
  slug: string;
  titleFr: string;
  titleEn?: string;
  category: string;
  releaseDate?: string;
  year?: number;
  coverImage?: string;
  isActive: boolean;
  order: number;
  [key: string]: unknown;
};

async function main() {
  console.log("🔧 Fixing missing documentaires...\n");

  const worksPath = path.join(process.cwd(), "seed-data/works.json");
  const works: Work[] = JSON.parse(fs.readFileSync(worksPath, "utf-8"));

  // 1. Modifier Fritz Haber → Fritz l'éléphant
  console.log("1️⃣ Updating Fritz Haber → Fritz l'éléphant...");
  const fritzWork = works.find(
    (w) => w.slug === "la-tragique-histoire-de-fritz-haber",
  );
  if (fritzWork) {
    fritzWork.slug = "la-tragique-histoire-de-fritz-l-elephant";
    fritzWork.titleFr = "La tragique histoire de Fritz l'éléphant";
    fritzWork.titleEn = "The tragic story of Fritz the elephant";
    fritzWork.releaseDate = "20/09/2024";
    fritzWork.year = 2024;
    console.log("   ✅ Fritz updated");
  } else {
    console.log("   ⚠️  Fritz Haber not found in JSON");
  }

  // 2. Mettre à jour Madame Massu
  console.log("\n2️⃣ Updating Les enfants de Madame Massu...");
  const massuWork = works.find((w) => w.slug === "les-enfants-de-madame-massu");
  if (massuWork) {
    massuWork.releaseDate = "20/03/2025";
    massuWork.year = 2025;
    console.log("   ✅ Madame Massu date updated");
  } else {
    console.log("   ⚠️  Madame Massu not found in JSON");
  }

  // 3. Créer les 3 nouveaux documentaires
  console.log("\n3️⃣ Creating 3 new documentaires...");

  const maxOrder = Math.max(...works.map((w) => w.order), 0);
  const newDocs: Work[] = [
    {
      slug: "lens-1998-un-champion-en-nord",
      titleFr: "Lens 1998, un champion en Nord",
      titleEn: "Lens 1998, a champion in the North",
      category: "Documentaire",
      releaseDate: "21/12/2023",
      year: 2023,
      coverImage: "",
      isActive: true,
      order: maxOrder + 1,
    },
    {
      slug: "nous-gens-de-la-terre-mayotte",
      titleFr: "Nous, gens de la terre - Mayotte",
      titleEn: "We, people of the land - Mayotte",
      category: "Documentaire",
      releaseDate: "28/02/2019",
      year: 2019,
      coverImage: "",
      isActive: true,
      order: maxOrder + 2,
    },
    {
      slug: "l-aventure-des-manuscrits",
      titleFr: "L'aventure des manuscrits",
      titleEn: "The adventure of manuscripts",
      category: "Documentaire",
      releaseDate: "29/08/2021",
      year: 2021,
      coverImage: "",
      isActive: true,
      order: maxOrder + 3,
    },
  ];

  for (const doc of newDocs) {
    const exists = works.find((w) => w.slug === doc.slug);
    if (!exists) {
      works.push(doc);
      console.log(`   ✅ Created: ${doc.slug}`);
    } else {
      console.log(`   ⏭️  Already exists: ${doc.slug}`);
    }
  }

  // Sauvegarder
  fs.writeFileSync(worksPath, JSON.stringify(works, null, 2), "utf-8");

  console.log(`\n💾 Updated works.json:`);
  console.log(`   - Fritz Haber → Fritz l'éléphant`);
  console.log(`   - Madame Massu date updated`);
  console.log(`   - 3 new documentaires created`);
  console.log(`   - Total works: ${works.length}`);

  console.log("\n🎉 All fixes applied successfully!");
}

main().catch(console.error);
