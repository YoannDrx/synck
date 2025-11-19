import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "content/expertises/fr/sous-edition.md",
);
const content = fs.readFileSync(filePath, "utf-8");
const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(content);

if (frontmatterMatch) {
  const frontmatterStr = frontmatterMatch[1];
  console.log("Frontmatter length:", frontmatterStr.length);
  console.log("\nLooking for labels...");

  // Try different regex patterns
  const labelsMatch1 = /labels:\s*\n([\s\S]*?)(?=\n\w+:|---$)/.exec(
    frontmatterStr,
  );
  console.log("Pattern 1 match:", labelsMatch1 ? "YES" : "NO");

  const labelsMatch2 = /labels:\s*\n([\s\S]*?)(?=\n---$)/.exec(frontmatterStr);
  console.log("Pattern 2 match:", labelsMatch2 ? "YES" : "NO");

  if (labelsMatch2) {
    console.log("\nLabels content (first 200 chars):");
    console.log(labelsMatch2[1].substring(0, 200));
  }
}
