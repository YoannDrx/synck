import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type ExpertiseFrontmatter = {
  id: string;
  title: string;
  description: string;
  slug: string;
  imgHome: string;
  img1?: string;
  img2?: string;
  img3?: string;
  img4?: string;
  img5?: string;
  imgFooter?: string;
};

type ExpertiseData = {
  frontmatter: ExpertiseFrontmatter;
  content: string;
  locale: "fr" | "en";
};

// Parse frontmatter and content from markdown
function parseMarkdown(filePath: string): {
  frontmatter: ExpertiseFrontmatter;
  content: string;
} {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Extract frontmatter
  const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  const frontmatterStr = frontmatterMatch[1];
  const frontmatter: Record<string, string> = {};

  // Parse each line of frontmatter
  frontmatterStr.split("\n").forEach((line) => {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      frontmatter[key] = value.replace(/^["']|["']$/g, "");
    }
  });

  // Extract content (everything after frontmatter)
  const content = fileContent.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

  return {
    frontmatter: frontmatter as unknown as ExpertiseFrontmatter,
    content,
  };
}

// Normalize image path to match actual file locations
function normalizeImagePath(imagePath: string): string {
  // Remove leading slash
  let normalized = imagePath.replace(/^\//, "");

  // Replace "images/" with "public/images/projets/expertises/"
  normalized = normalized.replace(
    /^images\//,
    "public/images/projets/expertises/",
  );

  // Fix common path issues
  normalized = normalized
    .replace(/droit-auteur/g, "droits-auteur")
    .replace(/droit-voisin/g, "droits-voisins");

  return normalized;
}

async function main() {
  console.log("🌱 Seeding expertises...\n");

  const expertisesDir = path.join(process.cwd(), "content", "expertises");
  const slugs = [
    "dossier-subvention",
    "droits-auteur",
    "droits-voisins",
    "gestion-administrative-et-editoriale",
    "gestion-distribution",
    "mise-en-page",
    "sous-edition",
  ];

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    console.log(`📝 Processing: ${slug}`);

    // Read French and English versions
    const frPath = path.join(expertisesDir, "fr", `${slug}.md`);
    const enPath = path.join(expertisesDir, "en", `${slug}.md`);

    if (!fs.existsSync(frPath) || !fs.existsSync(enPath)) {
      console.warn(`   ⚠️  Missing files for ${slug}, skipping`);
      continue;
    }

    const frData = parseMarkdown(frPath);
    const enData = parseMarkdown(enPath);

    // Create cover image asset
    let coverImageId: string | undefined;
    if (frData.frontmatter.imgHome) {
      const coverPath = normalizeImagePath(frData.frontmatter.imgHome);
      const coverImage = await prisma.asset.upsert({
        where: { path: coverPath },
        update: {},
        create: {
          path: coverPath,
          alt: frData.frontmatter.title,
        },
      });
      coverImageId = coverImage.id;
    }

    // Create expertise
    const expertise = await prisma.expertise.upsert({
      where: { slug },
      update: {
        order: i,
        isActive: true,
        coverImageId,
      },
      create: {
        slug,
        order: i,
        isActive: true,
        coverImageId,
      },
    });

    // Create translations
    await prisma.expertiseTranslation.upsert({
      where: {
        expertiseId_locale: {
          expertiseId: expertise.id,
          locale: "fr",
        },
      },
      update: {
        title: frData.frontmatter.title,
        subtitle: null,
        description: frData.frontmatter.description,
        content: frData.content,
      },
      create: {
        expertiseId: expertise.id,
        locale: "fr",
        title: frData.frontmatter.title,
        subtitle: null,
        description: frData.frontmatter.description,
        content: frData.content,
      },
    });

    await prisma.expertiseTranslation.upsert({
      where: {
        expertiseId_locale: {
          expertiseId: expertise.id,
          locale: "en",
        },
      },
      update: {
        title: enData.frontmatter.title,
        subtitle: null,
        description: enData.frontmatter.description,
        content: enData.content,
      },
      create: {
        expertiseId: expertise.id,
        locale: "en",
        title: enData.frontmatter.title,
        subtitle: null,
        description: enData.frontmatter.description,
        content: enData.content,
      },
    });

    // Create gallery images and link to expertise
    const imageKeys = [
      "img1",
      "img2",
      "img3",
      "img4",
      "img5",
      "imgFooter",
    ] as const;
    for (const key of imageKeys) {
      const imagePath = frData.frontmatter[key];
      if (imagePath) {
        const normalizedPath = normalizeImagePath(imagePath);

        // Create/update asset
        const asset = await prisma.asset.upsert({
          where: { path: normalizedPath },
          update: {},
          create: {
            path: normalizedPath,
            alt: `${frData.frontmatter.title} - ${key}`,
          },
        });

        // Check if already connected
        const existing = await prisma.expertise.findFirst({
          where: {
            id: expertise.id,
            images: {
              some: { id: asset.id },
            },
          },
        });

        // Connect if not already connected
        if (!existing) {
          await prisma.expertise.update({
            where: { id: expertise.id },
            data: {
              images: {
                connect: { id: asset.id },
              },
            },
          });
        }
      }
    }

    console.log(`   ✅ ${frData.frontmatter.title}`);
  }

  console.log(`\n🎉 Successfully seeded ${slugs.length} expertises!`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
