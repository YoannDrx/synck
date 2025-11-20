/**
 * Nettoyer les doublons de compositeurs
 */

import fs from "fs";
import path from "path";

type ComposerData = {
  id: number;
  slug: string;
  name: string;
  image?: string;
  externalUrl?: string;
  links?: unknown[];
  order: number;
  isActive: boolean;
};

type WorkData = {
  slug: string;
  composers?: Array<{ slug: string; role?: string }>;
};

const composersPath = path.join(process.cwd(), "seed-data/composers.json");
const worksPath = path.join(process.cwd(), "seed-data/works.json");

const composersData = JSON.parse(
  fs.readFileSync(composersPath, "utf-8"),
) as ComposerData[];
const worksData = JSON.parse(fs.readFileSync(worksPath, "utf-8")) as WorkData[];

console.log("=== NETTOYAGE DES COMPOSITEURS ===\n");

// IDs à supprimer (doublons identifiés)
const duplicatesToRemove = [3, 37, 56, 59];

// Map de remplacement des slugs (ancien → nouveau)
const slugReplacements: Record<string, string> = {
  "9-oclock": "9-o-clock", // Supprimer 9-oclock, garder 9-o-clock
  fstokes: "f-stokes", // Supprimer fstokes, garder f-stokes
  nzeng: "n-zeng", // Supprimer nzeng, garder n-zeng
  "patrice-dambrine-viro-major-records-": "patrice-dambrine-viro-major-records", // Supprimer avec tiret final
};

// 1. Supprimer les doublons de composers.json
console.log("1. Suppression des doublons...");
const cleanedComposers = composersData.filter(
  (c) => !duplicatesToRemove.includes(c.id),
);
console.log(
  `   Avant: ${composersData.length} → Après: ${cleanedComposers.length}\n`,
);

// 2. Mettre à jour les références dans works.json
console.log("2. Mise à jour des références dans works.json...");
let updatedCount = 0;

worksData.forEach((work) => {
  if (!work.composers) return;

  work.composers.forEach((composer) => {
    if (slugReplacements[composer.slug]) {
      console.log(
        `   ${work.slug}: ${composer.slug} → ${slugReplacements[composer.slug]}`,
      );
      composer.slug = slugReplacements[composer.slug];
      updatedCount++;
    }
  });
});

console.log(`   Total références mises à jour: ${updatedCount}\n`);

// 3. Backup des fichiers originaux
console.log("3. Backup des fichiers originaux...");
fs.writeFileSync(
  `${composersPath}.backup`,
  JSON.stringify(composersData, null, 2),
);
fs.writeFileSync(`${worksPath}.backup`, JSON.stringify(worksData, null, 2));
console.log("   ✅ Backup créés (.backup)\n");

// 4. Écrire les fichiers nettoyés
console.log("4. Écriture des fichiers nettoyés...");
fs.writeFileSync(composersPath, JSON.stringify(cleanedComposers, null, 2));
fs.writeFileSync(worksPath, JSON.stringify(worksData, null, 2));
console.log("   ✅ Fichiers mis à jour\n");

console.log("=== NETTOYAGE TERMINÉ ===");
console.log(
  `Compositeurs: ${composersData.length} → ${cleanedComposers.length}`,
);
console.log(`Références works mises à jour: ${updatedCount}`);
console.log(
  `\n💡 Si besoin de restaurer: mv seed-data/*.json.backup seed-data/`,
);
