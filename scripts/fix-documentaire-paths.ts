/**
 * Corriger automatiquement les chemins des images de documentaires
 */

import fs from "fs";
import path from "path";

// Mapping manuel des corrections connues
const pathCorrections: Record<string, string> = {
  // 13prods
  "/images/projets/documentaires/13prods/cancre-2.jpg":
    "/images/projets/documentaires/13prods/cancre.jpg",
  "/images/projets/documentaires/13prods/clearstream-et-moi.jpg":
    "/images/projets/documentaires/13prods/clearstream.jpg",
  "/images/projets/documentaires/13prods/deconfines-en-re.jpg":
    "/images/projets/documentaires/13prods/deconfines.jpg",
  "/images/projets/documentaires/13prods/en-jachere.jpg":
    "/images/projets/documentaires/13prods/enjachere.jpg",
  "/images/projets/documentaires/13prods/georges-perec-lhomme-qui-ne-voulait-pas-oublier2.jpg":
    "/images/projets/documentaires/13prods/goerges-perec.jpg",
  "/images/projets/documentaires/13prods/cabrera-un-secret-revele.jpg":
    "/images/projets/documentaires/13prods/cabrera-un-secret.jpg",
  "/images/projets/documentaires/13prods/andre-mailfert-lepopee-dun-faussaire-industriel.jpg":
    "/images/projets/documentaires/13prods/andre-mailfert.jpg",
  "/images/projets/documentaires/13prods/entendez-nous-expertise.jpg":
    "/images/projets/documentaires/13prods/entendez-nous-violence-intrafamiliales-en-polynesie.jpg",
  "/images/projets/documentaires/13prods/marcus-klingberg-un-pur-espion.jpg":
    "/images/projets/documentaires/13prods/marcus-klingberg-un-pur-espion2.jpg",
  "/images/projets/documentaires/13prods/la-greve-du-siecle.jpg":
    "/images/projets/documentaires/13prods/la-greve-du-siecle-1.jpg",
  "/images/projets/documentaires/13prods/resistantes-allemandes.jpg":
    "/images/projets/documentaires/13prods/les-resistantes-alllemandes.jpg",
  "/images/projets/documentaires/13prods/operation-biodiversite.jpg":
    "/images/projets/documentaires/13prods/operation-biodiv.jpg",
  "/images/projets/documentaires/13prods/tgros.jpg":
    "/images/projets/documentaires/13prods/t-gros.jpg",
  "/images/projets/documentaires/13prods/les-femmes-du-iiieme-reich.jpg":
    "/images/projets/documentaires/13prods/les-femmes-du-troisieme-reich.jpg",
  "/images/projets/documentaires/13prods/martinique-la-reconquete-de-la-terre.jpg":
    "/images/projets/documentaires/13prods/martinique-la-reconquete.jpg",
  "/images/projets/documentaires/13prods/petit-pays-je-taime-beaucoup.jpg":
    "/images/projets/documentaires/13prods/petit-pays.jpg",
  "/images/projets/documentaires/13prods/martineaubry.jpg":
    "/images/projets/documentaires/13prods/martine-aubry.jpg",
  "/images/projets/documentaires/13prods/micmac-a-millau-les-paysans-face-a-la-mondialisation.jpg":
    "/images/projets/documentaires/13prods/micmac.jpg",
  "/images/projets/documentaires/13prods/quand-lafrique-sauva-la-france.jpg":
    "/images/projets/documentaires/13prods/quand-lafrique-sauva.jpg",
  "/images/projets/documentaires/13prods/au-nom-de-la-mer2.jpg":
    "/images/projets/documentaires/13prods/au-nom-de-la-mer.jpg",
  "/images/projets/documentaires/13prods/leila-une-vie-a-miquelon2.jpg":
    "/images/projets/documentaires/13prods/leila-une-vie-a-miquelon.jpg",
  "/images/projets/documentaires/13prods/les-enfants-de-huahine-en-occitanie-expertise.jpg":
    "/images/projets/documentaires/13prods/les-enfants-de-huahine.jpg",
  "/images/projets/documentaires/13prods/mangas-une-revolution-francaise-expertise.jpg":
    "/images/projets/documentaires/13prods/mangas.jpg",

  // BNP (mauvais dossier)
  "/images/projets/documentaires/bnp-paribas-dans-les-eaux-troubles-de-la-plus-grande-banque-europeenne.jpg":
    "/images/projets/documentaires/little-big-story/bnp-paribas.jpg",

  // Little Big Story
  "/images/projets/documentaires/little-big-story/la-femme-sans-nom-lhistoire-de-jeanne-et-baudelaire.jpg":
    "/images/projets/documentaires/little-big-story/la-femme-sans-nom.jpg",

  // Pop Films
  "/images/projets/documentaires/pop-films/edlinger.jpg":
    "/images/projets/documentaires/pop-films/patrick-edlinger.jpg",
  "/images/projets/documentaires/pop-films/sweet-sweetback.jpg":
    "/images/projets/documentaires/pop-films/sweet-sweet-back.jpg",
  "/images/projets/documentaires/pop-films/jules-verne.jpg":
    "/images/projets/documentaires/pop-films/jules-verne-80-jours.jpg",
};

const mdFiles = [
  "seed-data/expertises/fr/gestion-administrative-et-editoriale.md",
  "seed-data/expertises/en/gestion-administrative-et-editoriale.md",
];

console.log("🔧 Correction des chemins d'images documentaires...\n");

mdFiles.forEach((mdFile) => {
  const filePath = path.join(process.cwd(), mdFile);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Fichier non trouvé: ${mdFile}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let correctionCount = 0;

  Object.entries(pathCorrections).forEach(([oldPath, newPath]) => {
    if (content.includes(oldPath)) {
      content = content.replace(new RegExp(oldPath, "g"), newPath);
      correctionCount++;
    }
  });

  fs.writeFileSync(filePath, content);
  console.log(`   ✅ ${mdFile}: ${correctionCount} corrections`);
});

console.log("\n✨ Corrections terminées !");
