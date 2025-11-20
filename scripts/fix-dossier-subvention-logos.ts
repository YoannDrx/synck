/**
 * Corriger les chemins des logos dans dossier-subvention.md
 * Remplacer les URLs Google par des chemins locaux
 */

import fs from "fs";
import path from "path";

const files = [
  "seed-data/expertises/fr/dossier-subvention.md",
  "seed-data/expertises/en/dossier-subvention.md",
  "content/expertises/fr/dossier-subvention.md",
  "content/expertises/en/dossier-subvention.md",
];

// Mapping des URLs Google vers chemins locaux
const replacements: Record<string, string> = {
  // SACEM - remplacer l'URL Google par le logo local
  "https://lh7-us.googleusercontent.com/R__L0TXssREfQ7SlUl4M2YaOjlTs5sBsiHCdGeH47iQXXxZwULhcrmb0ROzPDB3LPiSA88KGgSuIBrgHCZIkctcdQBamj3_WS2iv_QglSzx_I8tbxXusY-gSebr3lBflD0q1uQGeX80pXzm8ggq7iQ":
    "/images/partner/logo-sacem.png",

  // ADAMI - remplacer l'URL Google par le logo local
  "https://lh7-us.googleusercontent.com/tCDj6Xka3kkSpLaJiiOEX0uPyCM5WemyAiAw9fFhifk2aN_nsZ7ihb-9zCBwhdXVNwCp7VtXoB2ScGJ4HcGG4StW3I2AkCxksv9TopidOv3Mns9x6xQhJjClmos_K2agE7-AEpe5ib7N7f6VcbLYjQ":
    "/images/partner/logo-adami.png",

  // SPPF - remplacer l'URL Google par le logo local
  "https://lh7-us.googleusercontent.com/gB-1rhCl66cvRnOm1zWLewnJ_8RMNlq4Qf-PCLkgcjhs8aB1moPTtBqmMI5oz6IQlHje0M9l4sBAHbWbOGhBw8Ch4jTWNwArQr4_ofp55QEpSZwdDXQrCNV6bNI_baN9Nyo4BOb-ea-paiwAQIKUgw":
    "/images/partner/logo-sppf.png",

  // SCPP - remplacer l'URL Google par le logo local
  "https://lh7-us.googleusercontent.com/LsolrpP6_985q9ohnIGt4J-stGZBhFDKaJ-HzwvOz7FG3jMJbHLFeEMrXliQIvn4mHAInEJU_V9knl1lW1IQ6kdGowXkBLgQMp8_HihGuZ1cv_V0YUCWfd_nu86dLoRTmsHbr-Hdmfgzmaz9u7wQlA":
    "/images/partner/logo-scpp.png",
};

console.log("🔧 Correction des logos dans dossier-subvention.md...\n");

files.forEach((file) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  Fichier non trouvé: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf-8");
  let correctionCount = 0;

  Object.entries(replacements).forEach(([oldUrl, newPath]) => {
    if (content.includes(oldUrl)) {
      content = content.replace(new RegExp(oldUrl, "g"), newPath);
      correctionCount++;
    }
  });

  fs.writeFileSync(filePath, content);
  console.log(`   ✅ ${file}: ${correctionCount} corrections`);
});

console.log("\n✨ Corrections terminées !");
console.log(
  "   Tous les logos (SACEM, ADAMI, SPPF, SCPP) utilisent maintenant des chemins locaux.",
);
