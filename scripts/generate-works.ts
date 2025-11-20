import fs from "fs";
import path from "path";

console.log("🎨 Génération de works.json...\n");

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

// Créer un Map pour associer slug → work FR+EN
const worksMap = new Map<string, any>();

// Fonction pour normaliser les catégories vers les slugs canon iques
function normalizeCategoryToSlug(category: string | null): string | null {
  if (!category) return null;

  const normalized = category.toLowerCase().trim();

  // Mapping de normalisation
  const mapping: Record<string, string> = {
    // Documentaire (toutes variantes)
    "documentaire": "documentaire",
    "documentaires": "documentaire",
    "documentary": "documentaire",
    "documentaries": "documentaire",
    // Synchro
    "synchros": "synchro",
    "synchro": "synchro",
    "synchronisation": "synchro",
    "sync": "synchro",
    // Clip
    "clips": "clip",
    "clip": "clip",
    "clip musical": "clip",
    "music video": "clip",
    // Vinyle
    "vinyle": "vinyle",
    "vinyl": "vinyle",
    // Album
    "album de librairie musicale": "album-de-librairie-musicale",
    "music library album": "album-de-librairie-musicale",
  };

  return mapping[normalized] || null;
}

// Fonction pour normaliser les chemins d'images
function normalizeImagePath(imagePath: string | null): string | null {
  if (!imagePath) return null;

  let normalized = imagePath
    .replace(/^\/images\/portfolio\//, "/images/projets/")
    .replace(/^\/images\//, "public/images/")
    .toLowerCase();

  // Normaliser l'extension vers .jpg (sauf pour .gif)
  if (!normalized.endsWith(".gif")) {
    normalized = normalized.replace(/\.(jpeg|png)$/i, ".jpg");
  }

  return normalized;
}

// Fonction pour vérifier l'existence d'une image
function imageExists(imagePath: string | null): boolean {
  if (!imagePath) return false;
  const fullPath = path.join(process.cwd(), imagePath);
  return fs.existsSync(fullPath);
}

// Fonction pour détecter le label depuis le chemin de l'image
function detectLabelFromPath(imagePath: string | null): string | null {
  if (!imagePath) return null;

  if (imagePath.includes("/documentaires/13prods/")) return "13prods";
  if (imagePath.includes("/documentaires/little-big-story/"))
    return "little-big-story";
  if (imagePath.includes("/documentaires/pop-films/")) return "pop-films";
  if (imagePath.includes("/documentaires/via-decouvertes-films/"))
    return "via-decouvertes-films";

  return null;
}

// Fonction pour normaliser les slugs compositeurs
function normalizeComposerSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Traiter les works FR
metadataFr.forEach((workFr: any) => {
  const slug = workFr.slug;
  if (!slug) return;

  const coverImage = normalizeImagePath(workFr.src);
  const labelSlug = detectLabelFromPath(coverImage);

  // Normaliser les compositeurs
  const composers = (workFr.compositeurs || []).map((comp: any) => {
    const composerSlug = normalizeComposerSlug(comp.name);
    return {
      slug: composerSlug,
      name: comp.name,
      role: "composer", // Par défaut
    };
  });

  worksMap.set(slug, {
    slug,
    titleFr: workFr.title || "",
    titleEn: "",
    subtitleFr: workFr.subtitle || "",
    subtitleEn: "",
    descriptionFr: "", // Sera chargé depuis les fichiers .md
    descriptionEn: "",
    category: normalizeCategoryToSlug(workFr.category) || "",
    coverImage,
    coverImageExists: imageExists(coverImage),
    releaseDate: workFr.releaseDate || null,
    genre: workFr.genre || null,
    duration: null,
    isrc: null,
    externalUrl: workFr.externalLink || workFr.linkSpotify || null,
    spotifyUrl: workFr.linkSpotify || null,
    labelSlug,
    composers,
    isActive: true,
    order: workFr.id || 0,
  });
});

// Compléter avec les works EN
metadataEn.forEach((workEn: any) => {
  const slug = workEn.slug;
  const existing = worksMap.get(slug);

  if (existing) {
    existing.titleEn = workEn.title || "";
    existing.subtitleEn = workEn.subtitle || "";
  } else {
    // Work uniquement en EN (rare mais possible)
    const coverImage = normalizeImagePath(workEn.src);
    const labelSlug = detectLabelFromPath(coverImage);

    const composers = (workEn.compositeurs || []).map((comp: any) => {
      const composerSlug = normalizeComposerSlug(comp.name);
      return {
        slug: composerSlug,
        name: comp.name,
        role: "composer",
      };
    });

    worksMap.set(slug, {
      slug,
      titleFr: "",
      titleEn: workEn.title || "",
      subtitleFr: "",
      subtitleEn: workEn.subtitle || "",
      descriptionFr: "",
      descriptionEn: "",
      category: normalizeCategoryToSlug(workEn.category) || "",
      coverImage,
      coverImageExists: imageExists(coverImage),
      releaseDate: workEn.releaseDate || null,
      genre: workEn.genre || null,
      duration: null,
      isrc: null,
      externalUrl: workEn.externalLink || workEn.linkSpotify || null,
      spotifyUrl: workEn.linkSpotify || null,
      labelSlug,
      composers,
      isActive: true,
      order: workEn.id || 0,
    });
  }
});

// Convertir en array
const works = Array.from(worksMap.values());

// Trier par order
works.sort((a, b) => a.order - b.order);

// Statistiques
const totalWorks = works.length;
const withCoverImage = works.filter((w) => w.coverImageExists).length;
const missingImages = works.filter((w) => !w.coverImageExists);
const withLabel = works.filter((w) => w.labelSlug).length;
const withComposers = works.filter((w) => w.composers.length > 0).length;

console.log(`✅ ${totalWorks} works générés\n`);
console.log(`📊 Statistiques :`);
console.log(`   • Avec image cover valide  : ${withCoverImage}/${totalWorks}`);
console.log(`   • Avec label               : ${withLabel}`);
console.log(`   • Avec compositeurs        : ${withComposers}`);
console.log(`   • Images manquantes        : ${missingImages.length}\n`);

if (missingImages.length > 0) {
  console.log(`⚠️  Works avec images manquantes :`);
  missingImages.slice(0, 10).forEach((work) => {
    console.log(`   • ${work.slug}`);
    console.log(`      Image: ${work.coverImage || "N/A"}`);
  });
  if (missingImages.length > 10) {
    console.log(`   ... et ${missingImages.length - 10} autres\n`);
  }
}

// Sauvegarder
const outputPath = path.join(process.cwd(), "seed-data/works.json");
fs.writeFileSync(outputPath, JSON.stringify(works, null, 2));

console.log(`\n📁 Sauvegardé dans : seed-data/works.json`);

// Répartition par catégorie
const categoriesCount = works.reduce((acc: any, work) => {
  const cat = work.category || "Autre";
  acc[cat] = (acc[cat] || 0) + 1;
  return acc;
}, {});

console.log(`\n📂 Répartition par catégorie :`);
Object.entries(categoriesCount)
  .sort(([, a]: any, [, b]: any) => b - a)
  .forEach(([cat, count]) => {
    console.log(`   • ${cat.padEnd(40)} : ${count}`);
  });

// Répartition par label
const labelsCount = works.reduce((acc: any, work) => {
  const label = work.labelSlug || "Sans label";
  acc[label] = (acc[label] || 0) + 1;
  return acc;
}, {});

console.log(`\n🏢 Répartition par label :`);
Object.entries(labelsCount)
  .sort(([, a]: any, [, b]: any) => b - a)
  .forEach(([label, count]) => {
    console.log(`   • ${label.padEnd(25)} : ${count}`);
  });
