#!/usr/bin/env tsx
/* eslint-disable no-console */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const biosDir = "/Users/yoannandrieux/Downloads/BIOGRAPHIES ARTISTES 2";
const outputDirFr = path.join(process.cwd(), "content/composer-bios/fr");
const outputDirEn = path.join(process.cwd(), "content/composer-bios/en");

// Mapping des patterns de fichiers manquants vers slugs
const MISSING_FILES: Array<{ pattern: RegExp; slug: string; name: string }> = [
  { pattern: /^A.*wa\.txt$/, slug: "aiwa", name: "Aïwa" },
  { pattern: /^Drixx.*\.txt$/, slug: "drixxxe", name: "Drixxxé" },
  {
    pattern: /^Jean-Pierre.*nager\.txt$/,
    slug: "jean-pierre-menager",
    name: "Jean-Pierre Ménager",
  },
  {
    pattern: /^S.*bastien.*Blanchon\.txt$/,
    slug: "sebastien-blanchon",
    name: "Sébastien Blanchon",
  },
];

function detectPlatform(url: string): string {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("soundcloud.com")) return "soundcloud";
  if (url.includes("bandcamp.com")) return "bandcamp";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("youtube.com")) return "youtube";
  return "website";
}

function extractBio(filePath: string, slug: string, name: string) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extraire le lien (première ligne)
  const lines = content.split("\n");
  const firstLine = lines[0]?.trim() || "";
  const linkMatch =
    firstLine.match(/https?:\/\/[^\s]+/) || content.match(/https?:\/\/[^\s]+/);
  const link = linkMatch ? linkMatch[0].trim() : "";
  const platform = link ? detectPlatform(link) : "";

  // Séparer bio FR et EN
  const parts = content.split(/Anglais\s*:/i);
  let bioFr = parts[0] || "";
  let bioEn = parts[1] || "";

  // Nettoyer bioFr : enlever la première ligne (nom + lien)
  bioFr = bioFr.split("\n").slice(1).join("\n").trim();

  // Nettoyer bioEn
  bioEn = bioEn.trim();

  // Si pas de bio EN, utiliser la bio FR
  if (!bioEn) {
    bioEn = bioFr;
  }

  // Créer les fichiers .md
  const frPath = path.join(outputDirFr, `${slug}.md`);
  const enPath = path.join(outputDirEn, `${slug}.md`);

  fs.writeFileSync(frPath, bioFr, "utf-8");
  fs.writeFileSync(enPath, bioEn, "utf-8");

  console.log(`✅ Created bio files for: ${name} (${slug})`);
  console.log(`   FR: ${frPath}`);
  console.log(`   EN: ${enPath}`);
  if (link) {
    console.log(`   Link: ${link} (${platform})`);
  }
  console.log("");

  return { slug, link, platform };
}

async function main() {
  console.log("📁 Extracting missing biographies...\n");

  // Lister tous les fichiers
  const allFiles = fs.readdirSync(biosDir).filter((f) => f.endsWith(".txt"));

  const extracted: Array<{ slug: string; link: string; platform: string }> = [];

  for (const missing of MISSING_FILES) {
    const matchingFile = allFiles.find((f) => missing.pattern.test(f));

    if (matchingFile) {
      const filePath = path.join(biosDir, matchingFile);
      const result = extractBio(filePath, missing.slug, missing.name);
      extracted.push(result);
    } else {
      console.warn(`⚠️  No file found matching pattern: ${missing.pattern}`);
    }
  }

  console.log(
    `\n🎉 Extracted ${extracted.length}/4 missing biographies successfully!`,
  );

  // Mettre à jour le rapport
  const reportPath = path.join(
    process.cwd(),
    "scripts/bio-extraction-report.json",
  );

  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

    // Ajouter les liens manquants
    for (const item of extracted) {
      if (item.link) {
        if (!report.linksToAdd[item.slug]) {
          report.linksToAdd[item.slug] = [];
        }
        report.linksToAdd[item.slug].push({
          platform: item.platform,
          url: item.link,
        });
      }
    }

    report.summary.total += extracted.length;
    report.summary.withLinks = Object.keys(report.linksToAdd).length;

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
    console.log(`📄 Report updated: ${reportPath}`);
  }
}

main().catch(console.error);
