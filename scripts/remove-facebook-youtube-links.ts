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
  console.log("🗑️  Removing Facebook and YouTube links from composers...\n");

  // Lire le fichier composers.json
  const composersPath = path.join(process.cwd(), "seed-data/composers.json");
  const composers: Composer[] = JSON.parse(
    fs.readFileSync(composersPath, "utf-8"),
  );

  let totalRemoved = 0;
  const updates: string[] = [];

  for (const composer of composers) {
    const originalLinksCount = composer.links.length;

    // Filtrer les liens pour supprimer Facebook et YouTube
    composer.links = composer.links.filter((link) => {
      const shouldRemove =
        link.platform === "facebook" || link.platform === "youtube";
      if (shouldRemove) {
        totalRemoved++;
        updates.push(`   - ${composer.slug}: ${link.platform} removed`);
      }
      return !shouldRemove;
    });

    // Réorganiser les ordres des liens restants
    composer.links.forEach((link, index) => {
      link.order = index;
    });

    const removedCount = originalLinksCount - composer.links.length;
    if (removedCount > 0) {
      console.log(
        `✅ ${composer.slug}: removed ${removedCount} link(s) (${originalLinksCount} → ${composer.links.length})`,
      );
    }
  }

  // Sauvegarder le fichier mis à jour
  fs.writeFileSync(composersPath, JSON.stringify(composers, null, 2), "utf-8");

  console.log(`\n💾 Updated composers.json:`);
  console.log(`   - Total links removed: ${totalRemoved}`);
  console.log(
    `   - Composers affected: ${updates.length > 0 ? new Set(updates.map((u) => u.split(":")[0])).size : 0}`,
  );

  console.log("\n🎉 Facebook and YouTube links removed successfully!");
}

main().catch(console.error);
