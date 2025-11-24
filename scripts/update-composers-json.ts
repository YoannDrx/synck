#!/usr/bin/env tsx
/* eslint-disable no-console */

import fs from "fs";
import path from "path";

type ComposerLink = {
  platform: string;
  url: string;
  label?: string | null;
  order?: number;
};

type Composer = {
  id: number;
  slug: string;
  name: string;
  image?: string;
  externalUrl?: string;
  links: ComposerLink[];
  order: number;
  isActive: boolean;
};

async function main() {
  console.log("📝 Updating composers.json...\n");

  // Lire le fichier composers.json
  const composersPath = path.join(process.cwd(), "seed-data/composers.json");
  const composers: Composer[] = JSON.parse(
    fs.readFileSync(composersPath, "utf-8"),
  );

  // Lire le rapport d'extraction
  const reportPath = path.join(
    process.cwd(),
    "scripts/bio-extraction-report.json",
  );
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  console.log("📊 Summary from extraction report:");
  console.log(`   - Total biographies: ${report.summary.total}`);
  console.log(`   - With links: ${report.summary.withLinks}`);
  console.log(`   - To delete: ${report.summary.slugsToDelete.join(", ")}`);
  console.log(`   - To create: ${report.summary.slugsToCreate.join(", ")}\n`);

  // 1. Supprimer amaury-messelier et franck-sinnassamy
  const slugsToDelete = ["amaury-messelier", "franck-sinnassamy"];
  let filteredComposers = composers.filter(
    (c) => !slugsToDelete.includes(c.slug),
  );

  console.log(
    `✅ Removed composers: ${slugsToDelete.join(", ")} (${composers.length - filteredComposers.length} deleted)`,
  );

  // 2. Ajouter les nouveaux liens sociaux
  let linksAdded = 0;
  for (const [slug, links] of Object.entries(report.linksToAdd)) {
    const composer = filteredComposers.find((c) => c.slug === slug);

    if (!composer) {
      console.warn(`⚠️  Composer not found: ${slug}`);
      continue;
    }

    // Ajouter les nouveaux liens en évitant les doublons
    for (const newLink of links as Array<{ platform: string; url: string }>) {
      // Vérifier si le lien existe déjà
      const existingLink = composer.links.find((l) => l.url === newLink.url);

      if (!existingLink) {
        composer.links.push({
          platform: newLink.platform,
          url: newLink.url,
          label: null,
          order: composer.links.length,
        });
        linksAdded++;
        console.log(`   + ${slug}: ${newLink.platform} - ${newLink.url}`);
      }
    }
  }

  console.log(`\n✅ Added ${linksAdded} new social links\n`);

  // 3. Créer well-quartet
  const wellQuartetExists = filteredComposers.find(
    (c) => c.slug === "well-quartet",
  );

  if (!wellQuartetExists) {
    const maxId = Math.max(...filteredComposers.map((c) => c.id), 0);
    const maxOrder = Math.max(...filteredComposers.map((c) => c.order), 0);

    const wellQuartetLinks: ComposerLink[] = [];
    if (report.linksToAdd["well-quartet"]) {
      for (const link of report.linksToAdd["well-quartet"]) {
        wellQuartetLinks.push({
          platform: link.platform,
          url: link.url,
          label: null,
          order: wellQuartetLinks.length,
        });
      }
    }

    const wellQuartet: Composer = {
      id: maxId + 1,
      slug: "well-quartet",
      name: "Well Quartet",
      image: undefined,
      externalUrl:
        wellQuartetLinks.find((l) => l.platform === "website")?.url ||
        wellQuartetLinks[0]?.url,
      links: wellQuartetLinks,
      order: maxOrder + 1,
      isActive: true,
    };

    filteredComposers.push(wellQuartet);
    console.log(`✅ Created new composer: well-quartet (id ${wellQuartet.id})`);
    console.log(
      `   Links: ${wellQuartetLinks.map((l) => l.platform).join(", ")}\n`,
    );
  } else {
    console.log("⏭️  well-quartet already exists, skipping creation\n");
  }

  // Trier par ordre
  filteredComposers.sort((a, b) => a.order - b.order);

  // Sauvegarder le fichier mis à jour
  fs.writeFileSync(
    composersPath,
    JSON.stringify(filteredComposers, null, 2),
    "utf-8",
  );

  console.log(`💾 Updated composers.json:`);
  console.log(`   - Before: ${composers.length} composers`);
  console.log(`   - After: ${filteredComposers.length} composers`);
  console.log(
    `   - Deleted: ${composers.length - filteredComposers.length + (wellQuartetExists ? 0 : -1)}`,
  );
  console.log(`   - Created: ${wellQuartetExists ? 0 : 1}`);
  console.log(`   - Links added: ${linksAdded}\n`);

  console.log("🎉 composers.json updated successfully!");
}

main().catch(console.error);
