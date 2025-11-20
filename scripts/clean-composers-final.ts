/**
 * Nettoyage final des compositeurs en doublon
 * Supprime les entrées où name === slug qui ont un doublon avec un nom propre
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

console.log("=== NETTOYAGE FINAL DES COMPOSITEURS ===\n");

// Doublons identifiés manuellement (ceux où name === slug)
const duplicatePairs: Record<string, string> = {
  "cdric-hanak": "cedric-hanak", // Garder Cédric Hanak
  drixxx: "drixxxe", // Garder Drixxxé
  "emmanuel-mare": "emmanuel-maree", // Garder Emmanuel Marée
  "frdric-hanak": "frederic-hanak", // Garder Frédéric Hanak
  "sbastien-blanchon": "sebastien-blanchon", // Garder Sébastien Blanchon
  "sbastien-blanchon-nzeng": "sebastien-blanchon-n-zeng", // Garder Sébastien Blanchon / N'ZENG
  schrazade: "scherazade", // Garder Schérazade
};

// Trouver les IDs à supprimer
const idsToRemove: number[] = [];
const slugReplacements: Record<string, string> = duplicatePairs;

console.log("1. Identification des doublons à supprimer:\n");

Object.entries(duplicatePairs).forEach(([badSlug, goodSlug]) => {
  const badComposer = composersData.find((c) => c.slug === badSlug);
  const goodComposer = composersData.find((c) => c.slug === goodSlug);

  if (badComposer && goodComposer) {
    console.log(`   ❌ SUPPRIMER: ${badSlug} (id: ${badComposer.id})`);
    console.log(
      `   ✅ GARDER: ${goodSlug} → "${goodComposer.name}" (id: ${goodComposer.id})\n`,
    );
    idsToRemove.push(badComposer.id);
  } else {
    console.log(`   ⚠️  Paire non trouvée: ${badSlug} / ${goodSlug}\n`);
  }
});

// Supprimer les doublons de composers.json
console.log("\n2. Suppression des doublons...");
const cleanedComposers = composersData.filter(
  (c) => !idsToRemove.includes(c.id),
);
console.log(
  `   Avant: ${composersData.length} → Après: ${cleanedComposers.length}\n`,
);

// Mettre à jour les références dans works.json
console.log("3. Mise à jour des références dans works.json...");
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

// Backup des fichiers originaux
console.log("4. Backup des fichiers originaux...");
fs.writeFileSync(
  `${composersPath}.backup`,
  JSON.stringify(composersData, null, 2),
);
fs.writeFileSync(`${worksPath}.backup`, JSON.stringify(worksData, null, 2));
console.log("   ✅ Backup créés (.backup)\n");

// Écrire les fichiers nettoyés
console.log("5. Écriture des fichiers nettoyés...");
fs.writeFileSync(composersPath, JSON.stringify(cleanedComposers, null, 2));
fs.writeFileSync(worksPath, JSON.stringify(worksData, null, 2));
console.log("   ✅ Fichiers mis à jour\n");

console.log("=== NETTOYAGE TERMINÉ ===");
console.log(
  `Compositeurs: ${composersData.length} → ${cleanedComposers.length}`,
);
console.log(`Références works mises à jour: ${updatedCount}`);
console.log(`IDs supprimés: ${idsToRemove.join(", ")}`);
console.log(
  `\n💡 Si besoin de restaurer: mv seed-data/*.json.backup seed-data/`,
);
