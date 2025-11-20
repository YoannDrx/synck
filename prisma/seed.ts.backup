/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Normalize image paths to match actual file names:
 * - Only normalize the filename, keep folder structure intact
 * - Convert filename to lowercase
 * - Replace .jpeg with .jpg
 * - Handle both /images/portfolio/ and /images/projets/
 */
function normalizeImagePath(
  imagePath: string | undefined | null,
): string | null {
  if (!imagePath) return null;

  // Replace portfolio with projets
  let normalized = imagePath.replace("/images/portfolio/", "/images/projets/");

  // Add public/ prefix if not present
  if (normalized.startsWith("/images/")) {
    normalized = `public${  normalized}`;
  }

  // Parse the path
  const lastSlash = normalized.lastIndexOf("/");
  const directory = normalized.substring(0, lastSlash + 1);
  const filename = normalized.substring(lastSlash + 1);

  // Normalize only the filename
  const normalizedFilename = filename
    .replace(/\.jpeg$/i, ".jpg") // .jpeg → .jpg
    .replace(/\.png$/i, ".jpg") // .png → .jpg
    .toLowerCase(); // Filename to lowercase

  return directory + normalizedFilename;
}

type PortfolioItem = {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  externalLink?: string;
  linkSpotify?: string;
  src: string;
  height?: string;
  releaseDate?: string;
  genre?: string;
  compositeurs?: {
    name: string;
    compoImg?: string;
    links?: string;
  }[];
  images?: {
    w320?: number;
    w575?: number;
    w768?: number;
    w991?: number;
    w1080?: number;
    w1199?: number;
    w1380?: number;
    w1400?: number;
    w1540?: number;
  };
};

const descriptionCache = new Map<string, string>();
const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function getDescriptionFromMarkdown(locale: "fr" | "en", slug: string) {
  const cacheKey = `${locale}:${slug}`;
  if (descriptionCache.has(cacheKey)) {
    return descriptionCache.get(cacheKey) ?? null;
  }

  const descriptionsDir = path.join(
    process.cwd(),
    "content",
    "projets",
    locale,
    "descriptions",
  );
  if (!fs.existsSync(descriptionsDir)) {
    return null;
  }

  const normalizedSlug = normalizeKey(slug);
  const files = fs.readdirSync(descriptionsDir);
  const match = files.find(
    (file) => normalizeKey(path.parse(file).name) === normalizedSlug,
  );

  if (!match) {
    return null;
  }

  const content = fs
    .readFileSync(path.join(descriptionsDir, match), "utf8")
    .trim();
  descriptionCache.set(cacheKey, content);
  return content;
}

// Helper: slugify text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// Helper: calculate aspect ratio from image path (simplified)
function calculateAspectRatio(width?: number, height?: number): number | null {
  if (width && height && height > 0) {
    return width / height;
  }
  return null;
}

async function seedCategories(
  dataFr: PortfolioItem[],
  dataEn: PortfolioItem[],
) {
  console.log("🏷️  Seeding categories...");

  // Extract unique categories from FR data
  const categoriesMapFr = new Map<string, string>();
  dataFr.forEach((item) => {
    if (item.category && !categoriesMapFr.has(item.category)) {
      categoriesMapFr.set(item.category, slugify(item.category));
    }
  });

  // Map FR category name to EN category name
  const categoryTranslationMap = new Map<string, string>();
  dataFr.forEach((itemFr, index) => {
    const itemEn = dataEn[index];
    if (itemFr.category && itemEn?.category) {
      categoryTranslationMap.set(itemFr.category, itemEn.category);
    }
  });

  // Create categories with translations
  let order = 0;
  for (const [nameFr, slug] of categoriesMapFr) {
    const nameEn = categoryTranslationMap.get(nameFr) ?? nameFr;

    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        order: order++,
        isActive: true,
        translations: {
          create: [
            { locale: "fr", name: nameFr },
            { locale: "en", name: nameEn },
          ],
        },
      },
    });
  }

  console.log(`✅ Created ${String(categoriesMapFr.size)} categories`);
}

async function seedComposers(dataFr: PortfolioItem[]) {
  console.log("🎵 Seeding composers...");

  // Extract all unique composers (deduplicate by name)
  const composersMap = new Map<
    string,
    { name: string; image?: string; links?: string }
  >();

  dataFr.forEach((item) => {
    if (item.compositeurs && Array.isArray(item.compositeurs)) {
      item.compositeurs.forEach((comp) => {
        if (comp.name && !composersMap.has(comp.name)) {
          composersMap.set(comp.name, {
            name: comp.name,
            image: comp.compoImg,
            links: comp.links,
          });
        }
      });
    }
  });

  console.log(`Found ${String(composersMap.size)} unique composers`);

  // Create composers
  let order = 0;
  for (const [name, data] of composersMap) {
    const slug = slugify(name);

    // Create asset for composer image if exists
    let imageId: string | undefined;
    const normalizedImagePath = normalizeImagePath(data.image);
    if (normalizedImagePath) {
      const asset = await prisma.asset.upsert({
        where: { path: normalizedImagePath },
        update: {},
        create: {
          path: normalizedImagePath,
          alt: `Photo de ${name}`,
        },
      });
      imageId = asset.id;
    }

    // Extract external URL (handle both string and object formats)
    let externalUrl: string | null = null;
    if (data.links) {
      if (typeof data.links === "string") {
        externalUrl = data.links;
      } else if (typeof data.links === "object" && data.links !== null) {
        // If it's an object, try to get the first URL value
        const urlValues = Object.values(data.links).filter(
          (v): v is string => typeof v === "string",
        );
        externalUrl = urlValues.length > 0 ? urlValues[0] : null;
      }
    }

    await prisma.composer.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        imageId,
        externalUrl, // Add external URL (YouTube, SoundCloud, etc.)
        order: order++,
        isActive: true,
        translations: {
          create: [
            { locale: "fr", name },
            { locale: "en", name }, // Same name for both locales (composers' names don't change)
          ],
        },
      },
    });
  }

  console.log(`✅ Created ${String(composersMap.size)} composers`);
}

async function seedWorks(dataFr: PortfolioItem[], dataEn: PortfolioItem[]) {
  console.log("🎨 Seeding works...");

  for (let i = 0; i < dataFr.length; i++) {
    const itemFr = dataFr[i];
    const itemEn = dataEn[i];

    if (!itemFr || !itemEn) continue;

    // Find category
    const categorySlug = slugify(itemFr.category ?? "other");
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      console.warn(`⚠️  Category not found for slug: ${categorySlug}`);
      continue;
    }

    // Create cover image asset
    let coverImageId: string | undefined;
    const normalizedCoverPath = normalizeImagePath(itemFr.src);
    if (normalizedCoverPath) {
      const asset = await prisma.asset.upsert({
        where: { path: normalizedCoverPath },
        update: {},
        create: {
          path: normalizedCoverPath,
          alt: itemFr.title,
          // Use first available width/height from images object
          width: itemFr.images?.w1080 ?? itemFr.images?.w768 ?? undefined,
          height: itemFr.height ? parseInt(itemFr.height, 10) : undefined,
          aspectRatio:
            calculateAspectRatio(
              itemFr.images?.w1080 ?? itemFr.images?.w768,
              itemFr.height ? parseInt(itemFr.height, 10) : undefined,
            ) ?? undefined,
        },
      });
      coverImageId = asset.id;
    }

    // Parse year from releaseDate (format: DD/MM/YYYY)
    let year: number | undefined;
    if (itemFr.releaseDate) {
      const parts = itemFr.releaseDate.split("/");
      if (parts.length === 3) {
        year = parseInt(parts[2], 10);
      }
    }

    const descriptionFr =
      getDescriptionFromMarkdown("fr", itemFr.slug) ??
      itemFr.subtitle ??
      undefined;
    const descriptionEn =
      getDescriptionFromMarkdown("en", itemEn.slug) ??
      itemEn.subtitle ??
      undefined;

    // Create work
    const work = await prisma.work.upsert({
      where: { slug: itemFr.slug },
      update: {
        externalUrl: itemFr.externalLink ?? null, // Update external URL for existing works
      },
      create: {
        slug: itemFr.slug,
        categoryId: category.id,
        coverImageId,
        year,
        spotifyUrl: itemFr.linkSpotify ?? null, // Add Spotify URL
        externalUrl: itemFr.externalLink ?? null, // Add external URL (YouTube, etc.)
        releaseDate: itemFr.releaseDate ?? null, // Add release date
        genre: itemFr.genre ?? null, // Add genre
        order: itemFr.id,
        isActive: true,
        isFeatured: false,
        translations: {
          create: [
            {
              locale: "fr",
              title: itemFr.title,
              description: descriptionFr,
            },
            {
              locale: "en",
              title: itemEn.title,
              description: descriptionEn,
            },
          ],
        },
      },
    });

    // Create contributions (Work ↔ Composers)
    if (itemFr.compositeurs && Array.isArray(itemFr.compositeurs)) {
      for (let j = 0; j < itemFr.compositeurs.length; j++) {
        const comp = itemFr.compositeurs[j];
        const composerSlug = slugify(comp.name);
        const composer = await prisma.composer.findUnique({
          where: { slug: composerSlug },
        });

        if (composer) {
          await prisma.contribution.upsert({
            where: {
              workId_composerId: {
                workId: work.id,
                composerId: composer.id,
              },
            },
            update: {},
            create: {
              workId: work.id,
              composerId: composer.id,
              role: "composer",
              order: j,
            },
          });
        }
      }
    }

    console.log(`✅ Created work: ${itemFr.title}`);
  }

  console.log(`✅ Created ${String(dataFr.length)} works`);
}

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

// Parse frontmatter and content from markdown
function parseExpertiseMarkdown(filePath: string): {
  frontmatter: ExpertiseFrontmatter;
  content: string;
} {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Extract frontmatter
  const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(fileContent);
  if (!frontmatterMatch) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  const frontmatterStr = frontmatterMatch[1];
  const frontmatter: Record<string, string> = {};

  // Parse each line of frontmatter
  frontmatterStr.split("\n").forEach((line) => {
    const match = /^(\w+):\s*(.*)$/.exec(line);
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

// Normalize expertise image path
function normalizeExpertiseImagePath(imagePath: string): string {
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
    .replace(/droit-voisin/g, "droits-voisins")
    .replace(/\/subvention\//g, "/dossier-subvention/")
    .replace(/\/gestion-admin\//g, "/gestion-administrative-et-editoriale/")
    .replace(/\/gestion-distrib\//g, "/gestion-distribution/")
    .replace(/\/soused\//g, "/sous-edition/");

  return normalized;
}

async function seedExpertises() {
  console.log("\n🎓 Seeding expertises...");

  const expertisesDir = path.join(process.cwd(), "content", "expertises");

  // Check if directory exists
  if (!fs.existsSync(expertisesDir)) {
    console.log("⚠️  Expertises directory not found, skipping");
    return;
  }

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

    // Read French and English versions
    const frPath = path.join(expertisesDir, "fr", `${slug}.md`);
    const enPath = path.join(expertisesDir, "en", `${slug}.md`);

    if (!fs.existsSync(frPath) || !fs.existsSync(enPath)) {
      console.warn(`   ⚠️  Missing files for ${slug}, skipping`);
      continue;
    }

    const frData = parseExpertiseMarkdown(frPath);
    const enData = parseExpertiseMarkdown(enPath);

    // Create cover image asset
    let coverImageId: string | undefined;
    if (frData.frontmatter.imgHome) {
      const coverPath = normalizeExpertiseImagePath(frData.frontmatter.imgHome);
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
        const normalizedPath = normalizeExpertiseImagePath(imagePath);

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

  console.log(`✅ Created ${String(slugs.length)} expertises`);
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Load JSON data
  const dataFrPath = path.join(
    process.cwd(),
    "content/projets/fr/metadata.json",
  );
  const dataEnPath = path.join(
    process.cwd(),
    "content/projets/en/metadata.json",
  );

  const dataFr = JSON.parse(
    fs.readFileSync(dataFrPath, "utf-8"),
  ) as PortfolioItem[];
  const dataEn = JSON.parse(
    fs.readFileSync(dataEnPath, "utf-8"),
  ) as PortfolioItem[];

  console.log(`📦 Loaded ${String(dataFr.length)} portfolio items (FR)`);
  console.log(`📦 Loaded ${String(dataEn.length)} portfolio items (EN)\n`);

  // Seed in order
  await seedCategories(dataFr, dataEn);
  await seedComposers(dataFr);
  await seedWorks(dataFr, dataEn);

  // Seed expertises
  await seedExpertises();

  // Seed admin user
  await seedAdminUser();

  console.log("\n🎉 Database seeding completed!");
}

async function seedAdminUser() {
  console.log("\n👤 Seeding admin user...");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@synck.fr";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
    return;
  }

  // Hash password using bcrypt (Better Auth uses bcrypt with 10 rounds)
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Caroline Senyk",
      role: "ADMIN",
      isActive: true,
      emailVerified: true,
    },
  });

  // Create Account entry with password
  await prisma.account.create({
    data: {
      userId: admin.id,
      accountId: admin.id,
      providerId: "credential",
      password: passwordHash,
    },
  });

  console.log(`✅ Admin user created: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   ⚠️  IMPORTANT: Change this password after first login!`);
}

main()
  .catch((e: unknown) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
