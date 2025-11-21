import fs from "fs";
import path from "path";

console.log("🏷️  Génération de categories.json...\n");

// Lire les metadata FR et EN
const metadataFrPath = path.join(
  process.cwd(),
  "content/projets/fr/metadata.json",
);
const metadataEnPath = path.join(
  process.cwd(),
  "content/projets/en/metadata.json",
);

const metadataFr = JSON.parse(fs.readFileSync(metadataFrPath, "utf-8"));
const metadataEn = JSON.parse(fs.readFileSync(metadataEnPath, "utf-8"));

// Créer un Map pour associer slug → {nameFr, nameEn}
const categoriesMap = new Map<string, { nameFr: string; nameEn: string }>();

// Extraire les catégories FR
metadataFr.forEach((work: any) => {
  if (work.category) {
    const slug = work.category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Retirer accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!categoriesMap.has(slug)) {
      categoriesMap.set(slug, { nameFr: work.category, nameEn: "" });
    }
  }
});

// Compléter avec les catégories EN
metadataEn.forEach((work: any) => {
  if (work.category) {
    const slug = work.category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = categoriesMap.get(slug);
    if (existing) {
      existing.nameEn = work.category;
    } else {
      categoriesMap.set(slug, { nameFr: "", nameEn: work.category });
    }
  }
});

// Convertir le Map en array d'objets
const categories = Array.from(categoriesMap.entries()).map(
  ([slug, names], index) => ({
    id: index + 1,
    slug,
    nameFr: names.nameFr,
    nameEn: names.nameEn,
    color: getColorForCategory(slug),
    icon: getIconForCategory(slug),
    order: index,
    isActive: true,
  }),
);

// Trier par order
categories.sort((a, b) => a.order - b.order);

// Sauvegarder
const outputPath = path.join(process.cwd(), "seed-data/categories.json");
fs.writeFileSync(outputPath, JSON.stringify(categories, null, 2));

console.log(`✅ ${categories.length} catégories générées :\n`);
categories.forEach((cat) => {
  console.log(
    `   • ${cat.slug.padEnd(30)} → FR: ${cat.nameFr.padEnd(35)} | EN: ${cat.nameEn}`,
  );
});
console.log(`\n📁 Sauvegardé dans : seed-data/categories.json`);

// Helper functions pour les couleurs et icônes
function getColorForCategory(slug: string): string {
  const colors: Record<string, string> = {
    "album-de-librairie-musicale": "#d5ff0a", // Lime yellow
    "clip-musical": "#ff4a9c", // Pink
    documentaire: "#4a90ff", // Blue
    synchronisation: "#ff8c4a", // Orange
    vinyle: "#9c4aff", // Purple
    evenement: "#4aff9c", // Green
  };
  return colors[slug] || "#d5ff0a";
}

function getIconForCategory(slug: string): string {
  const icons: Record<string, string> = {
    "album-de-librairie-musicale": "disc",
    "clip-musical": "video",
    documentaire: "film",
    synchronisation: "radio",
    vinyle: "disc-3",
    evenement: "sparkles",
  };
  return icons[slug] || "music";
}
