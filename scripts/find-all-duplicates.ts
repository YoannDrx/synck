/**
 * Trouver TOUS les doublons de compositeurs (incluant variations avec/sans accents)
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

console.log("=== ANALYSE COMPLÈTE DES DOUBLONS ===\n");

// Normaliser pour détecter les doublons (même avec variations d'accents, espaces, etc.)
const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, ""); // Remove all non-alphanumeric

// Grouper par nom normalisé ET par slug normalisé
const byNormalizedName: Record<string, ComposerData[]> = {};
const byNormalizedSlug: Record<string, ComposerData[]> = {};

composersData.forEach((c) => {
  const normName = normalize(c.name);
  const normSlug = normalize(c.slug);

  if (!byNormalizedName[normName]) byNormalizedName[normName] = [];
  byNormalizedName[normName].push(c);

  if (!byNormalizedSlug[normSlug]) byNormalizedSlug[normSlug] = [];
  byNormalizedSlug[normSlug].push(c);
});

// Trouver les doublons
const nameDuplicates = Object.entries(byNormalizedName).filter(
  ([_, items]) => items.length > 1,
);
const slugDuplicates = Object.entries(byNormalizedSlug).filter(
  ([_, items]) => items.length > 1,
);

// Combiner et dédupliquer
const allDuplicateIds = new Set<number>();
const duplicateGroups: ComposerData[][] = [];

[...nameDuplicates, ...slugDuplicates].forEach(([_, items]) => {
  const groupIds = items.map((i) => i.id).sort();
  const groupKey = groupIds.join(",");

  // Vérifier si ce groupe n'existe pas déjà
  const exists = duplicateGroups.some((group) => {
    const existingIds = group
      .map((g) => g.id)
      .sort()
      .join(",");
    return existingIds === groupKey;
  });

  if (!exists) {
    duplicateGroups.push(items);
    items.forEach((item) => allDuplicateIds.add(item.id));
  }
});

console.log("=== TOUS LES GROUPES DE DOUBLONS ===\n");
duplicateGroups.forEach((group, index) => {
  console.log(`Groupe ${index + 1}:`);
  group.forEach((item) => {
    const displayName =
      item.name === item.slug
        ? `"${item.name}" ⚠️ (name=slug)`
        : `"${item.name}"`;
    console.log(`  - slug: ${item.slug} → ${displayName} (id: ${item.id})`);
  });
  console.log("");
});

// Suggestions de nettoyage
console.log("\n=== SUGGESTIONS DE NETTOYAGE ===\n");
const toKeep: number[] = [];
const toRemove: number[] = [];

duplicateGroups.forEach((group) => {
  // Trier pour garder le meilleur
  const sorted = [...group].sort((a, b) => {
    // 1. Préférer name !== slug
    if (a.name !== a.slug && b.name === b.slug) return -1;
    if (a.name === a.slug && b.name !== b.slug) return 1;

    // 2. Préférer avec majuscules dans le nom
    const aHasUpper = a.name !== a.name.toLowerCase();
    const bHasUpper = b.name !== b.name.toLowerCase();
    if (aHasUpper && !bHasUpper) return -1;
    if (!aHasUpper && bHasUpper) return 1;

    // 3. Préférer avec accents
    const aHasAccents = /[àâäçéèêëïîôùûüÿæœ]/i.test(a.name);
    const bHasAccents = /[àâäçéèêëïîôùûüÿæœ]/i.test(b.name);
    if (aHasAccents && !bHasAccents) return -1;
    if (!aHasAccents && bHasAccents) return 1;

    return 0;
  });

  const keep = sorted[0];
  const remove = sorted.slice(1);

  console.log(`Groupe "${keep.name}":`);
  console.log(`  ✅ GARDER: ${keep.slug} (id: ${keep.id})`);
  toKeep.push(keep.id);

  remove.forEach((r) => {
    console.log(`  ❌ SUPPRIMER: ${r.slug} (id: ${r.id})`);
    toRemove.push(r.id);
  });
  console.log("");
});

console.log("=== RÉSUMÉ ===");
console.log(`Total compositeurs: ${composersData.length}`);
console.log(`Groupes de doublons: ${duplicateGroups.length}`);
console.log(`À supprimer: ${toRemove.length}`);
console.log(`Après nettoyage: ${composersData.length - toRemove.length}`);
console.log(
  `\nIDs à supprimer: [${toRemove.sort((a, b) => a - b).join(", ")}]`,
);

// Créer la map de remplacement des slugs
console.log("\n=== MAP DE REMPLACEMENT (pour works.json) ===\n");
const slugReplacements: Record<string, string> = {};
duplicateGroups.forEach((group) => {
  const sorted = [...group].sort((a, b) => {
    if (a.name !== a.slug && b.name === b.slug) return -1;
    if (a.name === a.slug && b.name !== b.slug) return 1;
    const aHasUpper = a.name !== a.name.toLowerCase();
    const bHasUpper = b.name !== b.name.toLowerCase();
    if (aHasUpper && !bHasUpper) return -1;
    if (!aHasUpper && bHasUpper) return 1;
    return 0;
  });

  const keep = sorted[0];
  const remove = sorted.slice(1);

  remove.forEach((r) => {
    slugReplacements[r.slug] = keep.slug;
  });
});

console.log(JSON.stringify(slugReplacements, null, 2));
