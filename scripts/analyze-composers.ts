/**
 * Analyser les doublons de compositeurs
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

const composersPath = path.join(process.cwd(), "seed-data/composers.json");
const composersData = JSON.parse(
  fs.readFileSync(composersPath, "utf-8"),
) as ComposerData[];

console.log("=== ANALYSE DES COMPOSITEURS ===\n");

// 1. Trouver les compositeurs où name === slug (problème de données)
const nameEqualsSlug = composersData.filter((c) => c.name === c.slug);
console.log("1. Compositeurs où name === slug:");
nameEqualsSlug.forEach((c) => {
  console.log(`   - ${c.slug} (id: ${c.id})`);
});
console.log(`   Total: ${nameEqualsSlug.length}\n`);

// 2. Trouver les doublons basés sur une normalisation
const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const groups: Record<string, ComposerData[]> = {};
composersData.forEach((c) => {
  const base = normalize(c.slug);
  if (!groups[base]) groups[base] = [];
  groups[base].push(c);
});

const duplicates = Object.entries(groups).filter(
  ([_, items]) => items.length > 1,
);

console.log("2. Groupes de doublons:");
duplicates.forEach(([base, items]) => {
  console.log(`   Base: ${base}`);
  items.forEach((item) =>
    console.log(`     - ${item.slug} → "${item.name}" (id: ${item.id})`),
  );
  console.log("");
});
console.log(`   Total groupes: ${duplicates.length}\n`);

// 3. Suggestions de suppression
console.log("3. Suggestions de nettoyage:");
const toDelete: number[] = [];

duplicates.forEach(([_, items]) => {
  // Garder celui avec le nom le plus "propre" (avec majuscules, accents, etc.)
  const sorted = [...items].sort((a, b) => {
    // Préférer ceux avec un nom différent du slug
    if (a.name !== a.slug && b.name === b.slug) return -1;
    if (a.name === a.slug && b.name !== b.slug) return 1;
    // Préférer ceux avec des majuscules
    if (a.name !== a.name.toLowerCase() && b.name === b.name.toLowerCase())
      return -1;
    if (a.name === a.name.toLowerCase() && b.name !== b.name.toLowerCase())
      return 1;
    return 0;
  });

  const keep = sorted[0];
  const remove = sorted.slice(1);

  console.log(`   Groupe "${keep.name}":`);
  console.log(`     ✅ GARDER: ${keep.slug} (id: ${keep.id})`);
  remove.forEach((r) => {
    console.log(`     ❌ SUPPRIMER: ${r.slug} (id: ${r.id})`);
    toDelete.push(r.id);
  });
  console.log("");
});

console.log(`\n=== RÉSUMÉ ===`);
console.log(`Total compositeurs: ${composersData.length}`);
console.log(`À supprimer: ${toDelete.length}`);
console.log(`Après nettoyage: ${composersData.length - toDelete.length}`);
console.log(`\nIDs à supprimer: ${toDelete.sort((a, b) => a - b).join(", ")}`);
