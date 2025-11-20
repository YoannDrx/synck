import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import sharp from "sharp";

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalise un chemin d'image filesystem vers un chemin URL
 */
function normalizeImagePath(imagePath: string | null): string | null {
  if (!imagePath) return null;

  return imagePath
    .replace(/^\/images\/portfolio\//, "/images/projets/")
    .replace(/^\/images\//, "public/images/")
    .toLowerCase();
}

/**
 * Vérifie si un fichier image existe
 */
function imageExists(imagePath: string | null): boolean {
  if (!imagePath) return false;
  const fullPath = path.join(process.cwd(), imagePath);
  return fs.existsSync(fullPath);
}

/**
 * Charge un fichier markdown avec frontmatter
 */
function loadMarkdown(filePath: string): {
  content: string;
  frontmatter: any;
} | null {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(fileContent);
    return { content, frontmatter: data };
  } catch (error) {
    console.error(`❌ Erreur lecture ${filePath}:`, error);
    return null;
  }
}

/**
 * Crée un Asset avec blur placeholder
 */
async function createAsset(imagePath: string): Promise<any> {
  const fullPath = path.join(process.cwd(), imagePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`   ⚠️  Image non trouvée : ${imagePath}`);
    return null;
  }

  try {
    const imageBuffer = fs.readFileSync(fullPath);
    const metadata = await sharp(imageBuffer).metadata();

    // Générer blur placeholder
    const blurBuffer = await sharp(imageBuffer)
      .resize(20, 20, { fit: "inside" })
      .blur(10)
      .toBuffer();
    const base64 = blurBuffer.toString("base64");
    const blurDataUrl = `data:image/jpeg;base64,${base64}`;

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const aspectRatio = width && height ? width / height : null;

    const asset = await prisma.asset.upsert({
      where: { path: imagePath },
      create: {
        path: imagePath,
        width,
        height,
        aspectRatio,
        blurDataUrl,
      },
      update: {
        width,
        height,
        aspectRatio,
        blurDataUrl,
      },
    });

    return asset;
  } catch (error) {
    console.error(`   ❌ Erreur création asset ${imagePath}:`, error);
    return null;
  }
}

// ============================================
// SEED CATEGORIES
// ============================================

async function seedCategories() {
  console.log("\n🏷️  Seeding categories...");

  const categoriesPath = path.join(process.cwd(), "seed-data/categories.json");
  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));

  let created = 0;
  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        color: cat.color,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
        translations: {
          create: [
            { locale: "fr", name: cat.nameFr },
            { locale: "en", name: cat.nameEn },
          ],
        },
      },
      update: {
        color: cat.color,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
        translations: {
          deleteMany: {},
          create: [
            { locale: "fr", name: cat.nameFr },
            { locale: "en", name: cat.nameEn },
          ],
        },
      },
    });
    created++;
  }

  console.log(`✅ Created ${created} categories`);
}

// ============================================
// SEED LABELS
// ============================================

async function seedLabels() {
  console.log("\n🏢 Seeding labels...");

  const labelsPath = path.join(process.cwd(), "seed-data/labels.json");
  const labelsData = JSON.parse(fs.readFileSync(labelsPath, "utf-8"));

  let created = 0;
  for (const label of labelsData) {
    await prisma.label.upsert({
      where: { slug: label.slug },
      create: {
        slug: label.slug,
        website: label.website || null,
        translations: {
          create: [
            { locale: "fr", name: label.name || label.slug, description: label.description },
            { locale: "en", name: label.name || label.slug, description: label.description },
          ],
        },
      },
      update: {
        website: label.website || null,
        translations: {
          deleteMany: {},
          create: [
            { locale: "fr", name: label.name || label.slug, description: label.description },
            { locale: "en", name: label.name || label.slug, description: label.description },
          ],
        },
      },
    });
    created++;
  }

  console.log(`✅ Created ${created} labels`);
}

// ============================================
// SEED COMPOSERS
// ============================================

async function seedComposers() {
  console.log("\n🎵 Seeding composers...");

  const composersPath = path.join(process.cwd(), "seed-data/composers.json");
  const composersData = JSON.parse(fs.readFileSync(composersPath, "utf-8"));

  let created = 0;
  for (const comp of composersData) {
    // Créer l'image si elle existe
    let imageAsset = null;
    if (comp.image && imageExists(comp.image)) {
      imageAsset = await createAsset(comp.image);
    }

    // Créer le compositeur
    const composer = await prisma.composer.upsert({
      where: { slug: comp.slug },
      create: {
        slug: comp.slug,
        externalUrl: comp.externalUrl,
        order: comp.order,
        isActive: comp.isActive,
        imageId: imageAsset?.id || null,
        translations: {
          create: [
            { locale: "fr", name: comp.name },
            { locale: "en", name: comp.name },
          ],
        },
      },
      update: {
        externalUrl: comp.externalUrl,
        order: comp.order,
        isActive: comp.isActive,
        imageId: imageAsset?.id || null,
        translations: {
          deleteMany: {},
          create: [
            { locale: "fr", name: comp.name },
            { locale: "en", name: comp.name },
          ],
        },
      },
    });

    // Créer les liens multiples si présents
    if (comp.links && Array.isArray(comp.links) && comp.links.length > 0) {
      // Supprimer les anciens liens
      await prisma.composerLink.deleteMany({
        where: { composerId: composer.id },
      });

      // Créer les nouveaux liens
      for (const link of comp.links) {
        await prisma.composerLink.create({
          data: {
            composerId: composer.id,
            platform: link.platform || "other",
            url: link.url,
            label: link.label || null,
            order: link.order || 0,
          },
        });
      }
    }

    created++;
  }

  console.log(`✅ Created ${created} composers`);
}

// ============================================
// SEED WORKS
// ============================================

async function seedWorks() {
  console.log("\n🎨 Seeding works...");

  const worksPath = path.join(process.cwd(), "seed-data/works.json");
  const worksData = JSON.parse(fs.readFileSync(worksPath, "utf-8"));

  // Filtrer uniquement les works avec des images valides
  const validWorks = worksData.filter((work: any) => work.coverImageExists);

  console.log(
    `   Filtering: ${validWorks.length}/${worksData.length} works with valid images`,
  );

  // Récupérer toutes les catégories et labels
  const categories = await prisma.category.findMany();
  const labels = await prisma.label.findMany();
  const composers = await prisma.composer.findMany();

  const categoriesMap = new Map(categories.map((c) => [c.slug, c]));
  const labelsMap = new Map(labels.map((l) => [l.slug, l]));
  const composersMap = new Map(composers.map((c) => [c.slug, c]));

  let created = 0;
  let skipped = 0;

  for (const work of validWorks) {
    try {
      // Trouver la catégorie
      const categorySlug = work.category
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const category = categoriesMap.get(categorySlug);
      if (!category) {
        console.warn(`   ⚠️  Category not found for ${work.slug}: ${categorySlug}`);
        skipped++;
        continue;
      }

      // Créer le cover image asset
      const coverImageAsset = await createAsset(work.coverImage);
      if (!coverImageAsset) {
        console.warn(`   ⚠️  Failed to create cover image for ${work.slug}`);
        skipped++;
        continue;
      }

      // Trouver le label
      const label = work.labelSlug ? labelsMap.get(work.labelSlug) : null;

      // Charger les descriptions markdown
      const descFrPath = `seed-data/descriptions/fr/${work.slug}.md`;
      const descEnPath = `seed-data/descriptions/en/${work.slug}.md`;
      const descFr = loadMarkdown(descFrPath);
      const descEn = loadMarkdown(descEnPath);

      // Créer le work
      const createdWork = await prisma.work.upsert({
        where: { slug: work.slug },
        create: {
          slug: work.slug,
          categoryId: category.id,
          labelId: label?.id || null,
          coverImageId: coverImageAsset.id,
          externalUrl: work.externalUrl,
          isActive: work.isActive,
          order: work.order,
          translations: {
            create: [
              {
                locale: "fr",
                title: work.titleFr,
                subtitle: work.subtitleFr || null,
                description: descFr?.content || null,
              },
              {
                locale: "en",
                title: work.titleEn || work.titleFr,
                subtitle: work.subtitleEn || work.subtitleFr || null,
                description: descEn?.content || descFr?.content || null,
              },
            ],
          },
        },
        update: {
          categoryId: category.id,
          labelId: label?.id || null,
          coverImageId: coverImageAsset.id,
          externalUrl: work.externalUrl,
          isActive: work.isActive,
          order: work.order,
          translations: {
            deleteMany: {},
            create: [
              {
                locale: "fr",
                title: work.titleFr,
                subtitle: work.subtitleFr || null,
                description: descFr?.content || null,
              },
              {
                locale: "en",
                title: work.titleEn || work.titleFr,
                subtitle: work.subtitleEn || work.subtitleFr || null,
                description: descEn?.content || descFr?.content || null,
              },
            ],
          },
        },
      });

      // Créer les contributions (relations Work ↔ Composer)
      if (work.composers && Array.isArray(work.composers)) {
        // Supprimer les anciennes contributions
        await prisma.contribution.deleteMany({
          where: { workId: createdWork.id },
        });

        // Créer les nouvelles
        for (let i = 0; i < work.composers.length; i++) {
          const comp = work.composers[i];
          const composer = composersMap.get(comp.slug);

          if (composer) {
            await prisma.contribution.create({
              data: {
                workId: createdWork.id,
                composerId: composer.id,
                role: comp.role || "composer",
                order: i,
              },
            });
          }
        }
      }

      created++;
      if (created % 50 === 0) {
        console.log(`   Progress: ${created}/${validWorks.length} works created...`);
      }
    } catch (error) {
      console.error(`   ❌ Error creating work ${work.slug}:`, error);
      skipped++;
    }
  }

  console.log(`✅ Created ${created} works (${skipped} skipped)`);
}

// ============================================
// SEED EXPERTISES
// ============================================

async function seedExpertises() {
  console.log("\n🎓 Seeding expertises...");

  const expertisesDir = path.join(process.cwd(), "seed-data/expertises");
  const expertisesFr = fs.readdirSync(path.join(expertisesDir, "fr"));

  let created = 0;

  for (const filename of expertisesFr) {
    if (!filename.endsWith(".md")) continue;

    const slug = filename.replace(".md", "");

    // Charger FR et EN
    const expertiseFr = loadMarkdown(
      path.join(expertisesDir, "fr", filename),
    );
    const expertiseEn = loadMarkdown(
      path.join(expertisesDir, "en", filename),
    );

    if (!expertiseFr) {
      console.warn(`   ⚠️  Skipping ${slug} - FR file not found`);
      continue;
    }

    // Diviser le contenu en sections (séparées par <!-- section:end -->)
    const contentFr = expertiseFr.content.split("<!-- section:end -->");
    const contentEn = expertiseEn
      ? expertiseEn.content.split("<!-- section:end -->")
      : contentFr;

    // Créer les assets pour les images
    const images: any[] = [];
    const frontmatter = expertiseFr.frontmatter;

    for (const key of Object.keys(frontmatter)) {
      if (key.startsWith("img")) {
        const imgPath = normalizeImagePath(frontmatter[key]);
        if (imgPath && imageExists(imgPath)) {
          const asset = await createAsset(imgPath);
          if (asset) {
            images.push({
              key,
              assetId: asset.id,
              order: parseInt(key.replace(/\D/g, "")) || 0,
            });
          }
        }
      }
    }

    // Créer l'expertise
    const expertise = await prisma.expertise.upsert({
      where: { slug },
      create: {
        slug,
        order: parseInt(frontmatter.id) || 0,
        isActive: true,
        translations: {
          create: [
            {
              locale: "fr",
              title: frontmatter.title || slug,
              description: frontmatter.description || "",
              content: contentFr.join("\n<!-- section:end -->\n"),
            },
            {
              locale: "en",
              title: expertiseEn?.frontmatter?.title || frontmatter.title || slug,
              description:
                expertiseEn?.frontmatter?.description ||
                frontmatter.description ||
                "",
              content: contentEn.join("\n<!-- section:end -->\n"),
            },
          ],
        },
      },
      update: {
        order: parseInt(frontmatter.id) || 0,
        isActive: true,
        translations: {
          deleteMany: {},
          create: [
            {
              locale: "fr",
              title: frontmatter.title || slug,
              description: frontmatter.description || "",
              content: contentFr.join("\n<!-- section:end -->\n"),
            },
            {
              locale: "en",
              title: expertiseEn?.frontmatter?.title || frontmatter.title || slug,
              description:
                expertiseEn?.frontmatter?.description ||
                frontmatter.description ||
                "",
              content: contentEn.join("\n<!-- section:end -->\n"),
            },
          ],
        },
      },
    });

    // Associer les images
    for (const img of images) {
      await prisma.expertiseImage.upsert({
        where: {
          expertiseId_key: {
            expertiseId: expertise.id,
            key: img.key,
          },
        },
        create: {
          expertiseId: expertise.id,
          assetId: img.assetId,
          key: img.key,
          order: img.order,
        },
        update: {
          assetId: img.assetId,
          order: img.order,
        },
      });
    }

    created++;
  }

  console.log(`✅ Created ${created} expertises`);
}

// ============================================
// SEED ADMIN USER
// ============================================

async function seedAdminUser() {
  console.log("\n👤 Seeding admin user...");

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash("admin123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@synck.fr" },
    create: {
      email: "admin@synck.fr",
      name: "Admin",
      password: hashedPassword,
      emailVerified: new Date(),
    },
    update: {
      password: hashedPassword,
    },
  });

  console.log("✅ Admin user created: admin@synck.fr");
  console.log("   Password: admin123456");
  console.log("   ⚠️  IMPORTANT: Change this password after first login!");
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log("🌱 Starting database seed...\n");

  try {
    await seedCategories();
    await seedLabels();
    await seedComposers();
    await seedWorks();
    await seedExpertises();
    await seedAdminUser();

    console.log("\n🎉 Database seeding completed!");
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
