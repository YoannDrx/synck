import fs from "fs";
import path from "path";

console.log("🎵 Génération de composers.json...\n");

// Lire les fichiers sources
const metadataFrPath = path.join(
  process.cwd(),
  "content/projets/fr/metadata.json",
);
const composerLinksPath = path.join(
  process.cwd(),
  "content/composer-links.json",
);

const metadataFr = JSON.parse(fs.readFileSync(metadataFrPath, "utf-8"));
const composerLinksData = JSON.parse(
  fs.readFileSync(composerLinksPath, "utf-8"),
);

// Créer un Map pour tous les compositeurs
const composersMap = new Map<
  string,
  {
    name: string;
    image: string | null;
    externalUrl: string | null;
    links: any[];
  }
>();

// Extraire les compositeurs depuis metadata.json
metadataFr.forEach((work: any) => {
  if (work.compositeurs && Array.isArray(work.compositeurs)) {
    work.compositeurs.forEach((comp: any) => {
      if (!comp.name) return;

      const slug = comp.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Retirer accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (!composersMap.has(slug)) {
        // Normaliser le chemin de l'image
        let imagePath = null;
        if (comp.compoImg) {
          imagePath = comp.compoImg
            .replace(/^\/images\//, "public/images/")
            .toLowerCase()
            .replace(/\.(jpeg|png)$/i, ".jpg");
        }

        // Extraire l'externalUrl depuis links (si string)
        let externalUrl = null;
        if (typeof comp.links === "string" && comp.links.startsWith("http")) {
          externalUrl = comp.links;
        }

        composersMap.set(slug, {
          name: comp.name,
          image: imagePath,
          externalUrl,
          links: [],
        });
      }
    });
  }
});

// Fusionner avec composer-links.json (priorité sur les liens)
composerLinksData.forEach((composerLink: any) => {
  const slug = composerLink.slug || composerLink.name.toLowerCase();
  const existing = composersMap.get(slug);

  if (existing) {
    // Mettre à jour avec les liens multiples
    existing.externalUrl = composerLink.externalUrl || existing.externalUrl;
    existing.links = composerLink.links || [];
  } else {
    // Nouveau compositeur (uniquement dans composer-links.json)
    let imagePath = null;
    if (slug) {
      imagePath = `public/images/projets/photoscompo/${slug}.jpg`;
    }

    composersMap.set(slug, {
      name: composerLink.name,
      image: imagePath,
      externalUrl: composerLink.externalUrl || null,
      links: composerLink.links || [],
    });
  }
});

// Convertir en array
const composers = Array.from(composersMap.entries()).map(
  ([slug, data], index) => ({
    id: index + 1,
    slug,
    name: data.name,
    image: data.image,
    externalUrl: data.externalUrl,
    links: data.links,
    order: index,
    isActive: true,
  }),
);

// Trier par nom
composers.sort((a, b) => a.name.localeCompare(b.name));

// Ré-indexer order après tri
composers.forEach((comp, index) => {
  comp.id = index + 1;
  comp.order = index;
});

// Sauvegarder
const outputPath = path.join(process.cwd(), "seed-data/composers.json");
fs.writeFileSync(outputPath, JSON.stringify(composers, null, 2));

console.log(`✅ ${composers.length} compositeurs générés\n`);
console.log(`📊 Statistiques :`);
const withLinks = composers.filter((c) => c.links && c.links.length > 0).length;
const withImages = composers.filter((c) => c.image).length;
const withExternalUrl = composers.filter((c) => c.externalUrl).length;

console.log(`   • Avec liens multiples : ${withLinks}`);
console.log(`   • Avec image          : ${withImages}`);
console.log(`   • Avec URL externe    : ${withExternalUrl}`);
console.log(`\n📁 Sauvegardé dans : seed-data/composers.json`);

// Afficher les 5 premiers pour vérification
console.log(`\n🔍 Aperçu (5 premiers) :`);
composers.slice(0, 5).forEach((comp) => {
  console.log(`\n   ${comp.name} (${comp.slug})`);
  if (comp.image) console.log(`      Image: ${comp.image}`);
  if (comp.externalUrl) console.log(`      URL: ${comp.externalUrl}`);
  if (comp.links.length > 0)
    console.log(`      Liens: ${comp.links.length} plateformes`);
});
