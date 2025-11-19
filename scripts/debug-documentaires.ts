import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "content/expertises/fr/gestion-administrative-et-editoriale.md",
);

const content = fs.readFileSync(filePath, "utf-8");
const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(content);

if (frontmatterMatch) {
  const frontmatterStr = frontmatterMatch[1];

  const documentairesSection = /documentaires:\s*\n([\s\S]+)$/.exec(
    frontmatterStr,
  );

  if (documentairesSection) {
    const docsStr = documentairesSection[1];
    console.log("Documentaires string (first 500 chars):");
    console.log(docsStr.substring(0, 500));
    console.log("\n---\n");

    const docEntries = docsStr.split(/\n\s*-\s*title:/).filter(Boolean);
    console.log(`Found ${docEntries.length} documentaire entries\n`);

    console.log("First entry (first 300 chars):");
    console.log(docEntries[0].substring(0, 300));
    console.log("\n---\n");

    // Parse first entry
    const entry = docEntries[0];
    const titleMatch = /(.+)/.exec(entry);
    const subtitleMatch = /subtitle:\s*(.+)/.exec(entry);
    const categoryMatch = /category:\s*(.+)/.exec(entry);

    console.log("Parsed first documentaire:");
    console.log(
      `  Title: "${titleMatch ? titleMatch[1].trim() : "NOT FOUND"}"`,
    );
    console.log(
      `  Subtitle: "${subtitleMatch ? subtitleMatch[1].trim() : "NOT FOUND"}"`,
    );
    console.log(
      `  Category: "${categoryMatch ? categoryMatch[1].trim() : "NOT FOUND"}"`,
    );
  } else {
    console.log("No documentaires section found");
  }
}
