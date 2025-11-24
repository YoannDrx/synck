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

// Ordre de priorité des plateformes
const PLATFORM_PRIORITY: Record<string, number> = {
  instagram: 0,
  spotify: 1,
  soundcloud: 2,
  // Toutes les autres plateformes auront une priorité >= 3
};

function getPlatformPriority(platform: string): number {
  return PLATFORM_PRIORITY[platform.toLowerCase()] ?? 999;
}

async function main() {
  console.log("🧹 Cleaning up composer links...\n");

  // Lire le fichier composers.json
  const composersPath = path.join(process.cwd(), "seed-data/composers.json");
  const composers: Composer[] = JSON.parse(
    fs.readFileSync(composersPath, "utf-8"),
  );

  let externalUrlRemoved = 0;
  let linksReordered = 0;

  for (const composer of composers) {
    // 1. Supprimer externalUrl
    if (composer.externalUrl) {
      composer.externalUrl = undefined;
      externalUrlRemoved++;
    }

    // 2. Réorganiser les liens par priorité
    if (composer.links.length > 0) {
      const originalOrder = composer.links.map((l) => l.platform).join(", ");

      // Trier les liens selon la priorité
      composer.links.sort((a, b) => {
        const priorityA = getPlatformPriority(a.platform);
        const priorityB = getPlatformPriority(b.platform);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Si même priorité, garder l'ordre alphabétique
        return a.platform.localeCompare(b.platform);
      });

      // Réassigner les ordres
      composer.links.forEach((link, index) => {
        link.order = index;
      });

      const newOrder = composer.links.map((l) => l.platform).join(", ");

      if (originalOrder !== newOrder) {
        linksReordered++;
        console.log(`✅ ${composer.slug}:`);
        console.log(`   Before: [${originalOrder}]`);
        console.log(`   After:  [${newOrder}]`);
      }
    }
  }

  // Sauvegarder le fichier mis à jour
  fs.writeFileSync(composersPath, JSON.stringify(composers, null, 2), "utf-8");

  console.log(`\n💾 Updated composers.json:`);
  console.log(`   - externalUrl removed: ${externalUrlRemoved} composers`);
  console.log(`   - Links reordered: ${linksReordered} composers`);

  console.log(
    "\n🎉 Composer links cleaned up successfully! Order: Instagram → Spotify → SoundCloud → Others",
  );
}

main().catch(console.error);
