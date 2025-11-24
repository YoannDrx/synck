#!/usr/bin/env tsx
/* eslint-disable no-console */

import fs from "fs";
import path from "path";

type Work = {
  slug: string;
  titleFr: string;
  titleEn?: string;
  category: string;
  releaseDate?: string;
  [key: string]: unknown;
};

function convertDateFormat(isoDate: string): string {
  // Convert YYYY-MM-DD to DD/MM/YYYY
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

async function main() {
  console.log("📅 Updating documentaire release dates...\n");

  // Read CSV file
  const csvPath = path.join(process.cwd(), "scripts/documentaires-dates.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").slice(1); // Skip header

  // Parse CSV into map: slug -> date
  const datesMap = new Map<string, string>();
  for (const line of lines) {
    if (!line.trim()) continue;

    // Parse CSV line (handle quoted fields)
    const match = line.match(/^([^,]+),/);
    if (!match) continue;

    const slug = match[1].trim();
    const parts = line.split(",");
    if (parts.length < 3) continue;

    const isoDate = parts[2].trim();
    if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) continue;

    const formattedDate = convertDateFormat(isoDate);
    datesMap.set(slug, formattedDate);
  }

  console.log(`📊 Found ${datesMap.size} dates in CSV\n`);

  // Read works.json
  const worksPath = path.join(process.cwd(), "seed-data/works.json");
  const works: Work[] = JSON.parse(fs.readFileSync(worksPath, "utf-8"));

  // Update dates
  let updated = 0;
  let notFound = 0;
  const notFoundList: string[] = [];

  for (const [slug, date] of datesMap.entries()) {
    const work = works.find((w) => w.slug === slug);

    if (work) {
      const oldDate = work.releaseDate;
      work.releaseDate = date;

      // Extract year from date for the year field
      const year = parseInt(date.split("/")[2], 10);
      (work as Work & { year?: number }).year = year;

      updated++;
      console.log(`✅ ${slug}: ${oldDate || "no date"} → ${date} (${year})`);
    } else {
      notFound++;
      notFoundList.push(slug);
    }
  }

  // Save updated works.json
  fs.writeFileSync(worksPath, JSON.stringify(works, null, 2), "utf-8");

  console.log(`\n💾 Updated works.json:`);
  console.log(`   - Dates updated: ${updated}`);
  console.log(`   - Not found in JSON: ${notFound}`);

  if (notFoundList.length > 0) {
    console.log(`\n⚠️  Works not found in JSON (${notFoundList.length}):`);
    notFoundList.slice(0, 20).forEach((slug) => console.log(`   - ${slug}`));
    if (notFoundList.length > 20) {
      console.log(`   ... and ${notFoundList.length - 20} more`);
    }
  }

  console.log("\n🎉 Documentaire dates updated successfully!");
}

main().catch(console.error);
