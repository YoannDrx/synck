/* eslint-disable no-console */

import { PrismaClient, type Asset } from "@prisma/client";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import sharp from "sharp";

const prisma = new PrismaClient();
const SKIP_SEED_IF_DATA_PRESENT = process.env.SKIP_SEED_IF_DATA_PRESENT === "1";

// ============================================
// TYPES
// ============================================

type MarkdownResult = {
  content: string;
  frontmatter: Record<string, unknown>;
};

type CategoryData = {
  slug: string;
  nameFr: string;
  nameEn: string;
  color: string;
  icon: string;
  order: number;
  isActive: boolean;
};

type LabelData = {
  slug: string;
  name?: string;
  description: string;
  website?: string;
};

type ArtistLinkData = {
  platform: string;
  url: string;
  label?: string;
  order?: number;
};

type ArtistData = {
  slug: string;
  name: string;
  image?: string;
  externalUrl?: string;
  order: number;
  isActive: boolean;
  links?: ArtistLinkData[];
};

type WorkArtistData = {
  slug: string;
  role?: string;
};

type WorkData = {
  slug: string;
  titleFr: string;
  titleEn?: string;
  subtitleFr?: string;
  subtitleEn?: string;
  category: string;
  productionCompanySlug?: string | string[]; // Slug(s) de la société de production (pour les documentaires, peut être un tableau pour les co-productions)
  coverImage: string;
  externalUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  releaseDate?: string;
  genre?: string;
  isActive: boolean;
  order: number;
  artists?: WorkArtistData[];
};

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
function loadMarkdown(filePath: string): MarkdownResult | null {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;

    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(fileContent);
    return { content, frontmatter: data as Record<string, unknown> };
  } catch (error: unknown) {
    console.error(`❌ Erreur lecture ${filePath}:`, error);
    return null;
  }
}

/**
 * Charge les biographies des artistes depuis content/artist-bios
 * Retourne une map par slug avec les versions FR/EN si disponibles
 */
function loadArtistBios(): Map<string, { fr?: string; en?: string }> {
  const biosDir = path.join(process.cwd(), "content/artist-bios");
  const locales: ("fr" | "en")[] = ["fr", "en"];
  const biosMap = new Map<string, { fr?: string; en?: string }>();

  for (const locale of locales) {
    const localeDir = path.join(biosDir, locale);
    if (!fs.existsSync(localeDir)) continue;

    const files = fs
      .readdirSync(localeDir)
      .filter((file) => file.toLowerCase().endsWith(".md"));

    for (const file of files) {
      const slug = file.replace(/\.md$/i, "");
      const filePath = path.join(localeDir, file);
      const content = fs.readFileSync(filePath, "utf-8").trim();

      if (!content) continue;

      const entry = biosMap.get(slug) ?? {};
      entry[locale] = content.replace(/\r\n/g, "\n");
      biosMap.set(slug, entry);
    }
  }

  return biosMap;
}

/**
 * Récupère une valeur string du frontmatter de manière sûre
 */
function getFrontmatterString(
  frontmatter: Record<string, unknown>,
  key: string,
  defaultValue = "",
): string {
  const value = frontmatter[key];
  return typeof value === "string" ? value : defaultValue;
}

/**
 * Crée un Asset avec blur placeholder
 * @param imagePath - Chemin filesystem (ex: "public/images/foo.jpg")
 * Stocke le chemin URL normalisé en base de données (ex: "/images/foo.jpg")
 */
async function createAsset(imagePath: string): Promise<Asset | null> {
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

    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const aspectRatio = width && height ? width / height : null;

    // Convertir le chemin filesystem en chemin URL pour Next.js
    // "public/images/foo.jpg" → "/images/foo.jpg"
    let urlPath = imagePath;
    if (imagePath.startsWith("public/")) {
      urlPath = `/${imagePath.substring("public/".length)}`;
    } else if (!imagePath.startsWith("/")) {
      urlPath = `/${imagePath}`;
    }

    const asset = await prisma.asset.upsert({
      where: { path: urlPath },
      create: {
        path: urlPath,
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
  } catch (error: unknown) {
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
  const categoriesData = JSON.parse(
    fs.readFileSync(categoriesPath, "utf-8"),
  ) as CategoryData[];

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

  console.log(`✅ Created ${String(created)} categories`);
}

// ============================================
// SEED LABELS
// ============================================

async function seedLabels() {
  console.log("\n🏢 Seeding labels...");

  const labelsPath = path.join(process.cwd(), "seed-data/labels.json");
  const labelsData = JSON.parse(
    fs.readFileSync(labelsPath, "utf-8"),
  ) as LabelData[];

  let created = 0;
  for (const label of labelsData) {
    await prisma.label.upsert({
      where: { slug: label.slug },
      create: {
        slug: label.slug,
        website: label.website ?? null,
        translations: {
          create: [
            {
              locale: "fr",
              name: label.name ?? label.slug,
              description: label.description,
            },
            {
              locale: "en",
              name: label.name ?? label.slug,
              description: label.description,
            },
          ],
        },
      },
      update: {
        website: label.website ?? null,
        translations: {
          deleteMany: {},
          create: [
            {
              locale: "fr",
              name: label.name ?? label.slug,
              description: label.description,
            },
            {
              locale: "en",
              name: label.name ?? label.slug,
              description: label.description,
            },
          ],
        },
      },
    });
    created++;
  }

  console.log(`✅ Created ${String(created)} labels`);
}

// ============================================
// SEED ARTISTS
// ============================================

async function seedArtists() {
  console.log("\n🎵 Seeding artists...");

  const artistsPath = path.join(process.cwd(), "seed-data/artists.json");
  const artistsData = JSON.parse(
    fs.readFileSync(artistsPath, "utf-8"),
  ) as ArtistData[];

  // Charger les biographies (optionnelles)
  const artistBios = loadArtistBios();

  let created = 0;
  for (const art of artistsData) {
    const bios = artistBios.get(art.slug);
    const bioFr = bios?.fr ?? bios?.en ?? null;
    const bioEn = bios?.en ?? bios?.fr ?? null;

    // Créer l'image si elle existe
    let imageAsset: Asset | null = null;
    if (art.image && imageExists(art.image)) {
      imageAsset = await createAsset(art.image);
    }

    // Créer l'artiste
    const artist = await prisma.artist.upsert({
      where: { slug: art.slug },
      create: {
        slug: art.slug,
        externalUrl: art.externalUrl,
        order: art.order,
        isActive: art.isActive,
        imageId: imageAsset?.id ?? null,
        translations: {
          create: [
            { locale: "fr", name: art.name, bio: bioFr },
            { locale: "en", name: art.name, bio: bioEn },
          ],
        },
      },
      update: {
        externalUrl: art.externalUrl,
        order: art.order,
        isActive: art.isActive,
        imageId: imageAsset?.id ?? null,
        translations: {
          deleteMany: {},
          create: [
            { locale: "fr", name: art.name, bio: bioFr },
            { locale: "en", name: art.name, bio: bioEn },
          ],
        },
      },
    });

    // Créer les liens multiples si présents
    if (art.links && Array.isArray(art.links) && art.links.length > 0) {
      // Supprimer les anciens liens
      await prisma.artistLink.deleteMany({
        where: { artistId: artist.id },
      });

      // Créer les nouveaux liens
      for (const link of art.links) {
        await prisma.artistLink.create({
          data: {
            artistId: artist.id,
            platform: link.platform ?? "other",
            url: link.url,
            label: link.label ?? null,
            order: link.order ?? 0,
          },
        });
      }
    }

    created++;
  }

  console.log(`✅ Created ${String(created)} artists`);
}

// ============================================
// SEED WORKS
// ============================================

async function seedWorks() {
  console.log("\n🎨 Seeding works...");

  const worksPath = path.join(process.cwd(), "seed-data/works.json");
  const worksData = JSON.parse(
    fs.readFileSync(worksPath, "utf-8"),
  ) as WorkData[];

  // Filtrer les works avec images valides, mais garder les synchros et documentaires même sans image
  const validWorks = worksData.filter((work) => {
    const category = work.category?.toLowerCase();
    // Toujours inclure les synchros et documentaires, même sans image
    if (category === "synchro" || category === "documentaire") {
      return true;
    }
    // Pour les autres catégories, vérifier que l'image existe vraiment
    return work.coverImage && imageExists(work.coverImage);
  });

  console.log(
    `   Filtering: ${String(validWorks.length)}/${String(worksData.length)} works with valid images`,
  );

  // Récupérer toutes les catégories et labels
  const categories = await prisma.category.findMany();
  const labels = await prisma.label.findMany();
  const artists = await prisma.artist.findMany();

  const categoriesMap = new Map(categories.map((c) => [c.slug, c]));
  const labelsMap = new Map(labels.map((l) => [l.slug, l]));
  const artistsMap = new Map(artists.map((a) => [a.slug, a]));

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
        console.warn(
          `   ⚠️  Category not found for ${work.slug}: ${categorySlug}`,
        );
        skipped++;
        continue;
      }

      // Créer le cover image asset si un chemin est fourni
      let coverImageAsset: Asset | null = null;
      if (work.coverImage) {
        coverImageAsset = await createAsset(work.coverImage);
        // Si la création a échoué et ce n'est ni une synchro ni un documentaire, on skip
        const category = work.category?.toLowerCase();
        if (
          !coverImageAsset &&
          category !== "synchro" &&
          category !== "documentaire"
        ) {
          console.warn(`   ⚠️  Failed to create cover image for ${work.slug}`);
          skipped++;
          continue;
        }
      }

      // Trouver le label (société de production pour les documentaires)
      // Si c'est un tableau, prendre le premier élément
      const firstProductionCompany = Array.isArray(work.productionCompanySlug)
        ? work.productionCompanySlug[0]
        : work.productionCompanySlug;
      const label = firstProductionCompany
        ? labelsMap.get(firstProductionCompany)
        : null;

      // Préparer le tableau des sociétés de production pour les documentaires
      const productionCompanySlugs = work.productionCompanySlug
        ? Array.isArray(work.productionCompanySlug)
          ? work.productionCompanySlug
          : [work.productionCompanySlug]
        : null;

      // Charger les descriptions markdown
      const descFrPath = `seed-data/descriptions/fr/${work.slug}.md`;
      const descEnPath = `seed-data/descriptions/en/${work.slug}.md`;
      const descFr = loadMarkdown(descFrPath);
      const descEn = loadMarkdown(descEnPath);

      // Extraire l'année de la date de sortie (format DD/MM/YYYY)
      let year: number | null = null;
      if (work.releaseDate) {
        const parts = work.releaseDate.split("/");
        if (parts.length === 3) {
          year = parseInt(parts[2], 10);
        }
      }

      // Créer le work
      const createdWork = await prisma.work.upsert({
        where: { slug: work.slug },
        create: {
          slug: work.slug,
          categoryId: category.id,
          labelId: label?.id ?? null,
          coverImageId: coverImageAsset?.id ?? null,
          externalUrl: work.externalUrl ?? null,
          youtubeUrl: work.youtubeUrl ?? null,
          spotifyUrl: work.spotifyUrl ?? null,
          releaseDate: work.releaseDate ?? null,
          genre: work.genre ?? null,
          year,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          productionCompanySlugs: productionCompanySlugs as any,
          isActive: work.isActive,
          order: work.order,
          translations: {
            create: [
              {
                locale: "fr",
                title: work.titleFr,
                subtitle: work.subtitleFr ?? null,
                description: descFr?.content ?? null,
              },
              {
                locale: "en",
                title: work.titleEn ?? work.titleFr,
                subtitle: work.subtitleEn ?? work.subtitleFr ?? null,
                description: descEn?.content ?? descFr?.content ?? null,
              },
            ],
          },
        },
        update: {
          categoryId: category.id,
          labelId: label?.id ?? null,
          coverImageId: coverImageAsset?.id ?? null,
          externalUrl: work.externalUrl ?? null,
          youtubeUrl: work.youtubeUrl ?? null,
          spotifyUrl: work.spotifyUrl ?? null,
          releaseDate: work.releaseDate ?? null,
          genre: work.genre ?? null,
          year,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          productionCompanySlugs: productionCompanySlugs as any,
          isActive: work.isActive,
          order: work.order,
          translations: {
            deleteMany: {},
            create: [
              {
                locale: "fr",
                title: work.titleFr,
                subtitle: work.subtitleFr ?? null,
                description: descFr?.content ?? null,
              },
              {
                locale: "en",
                title: work.titleEn ?? work.titleFr,
                subtitle: work.subtitleEn ?? work.subtitleFr ?? null,
                description: descEn?.content ?? descFr?.content ?? null,
              },
            ],
          },
        },
      });

      // Créer les contributions (relations Work ↔ Artist)
      if (work.artists && Array.isArray(work.artists)) {
        // Supprimer les anciennes contributions
        await prisma.contribution.deleteMany({
          where: { workId: createdWork.id },
        });

        // Créer les nouvelles
        for (let i = 0; i < work.artists.length; i++) {
          const art = work.artists[i];
          const artist = art ? artistsMap.get(art.slug) : undefined;

          if (artist) {
            await prisma.contribution.create({
              data: {
                workId: createdWork.id,
                artistId: artist.id,
                role: art.role ?? "artist",
                order: i,
              },
            });
          }
        }
      }

      created++;
      if (created % 50 === 0) {
        console.log(
          `   Progress: ${String(created)}/${String(validWorks.length)} works created...`,
        );
      }
    } catch (error: unknown) {
      console.error(`   ❌ Error creating work ${work.slug}:`, error);
      skipped++;
    }
  }

  console.log(
    `✅ Created ${String(created)} works (${String(skipped)} skipped)`,
  );
}

// ============================================
// SEED EXPERTISES
// ============================================

async function seedExpertises() {
  console.log("\n🎓 Seeding expertises...");

  const expertisesDir = "seed-data/expertises";
  const expertisesFr = fs.readdirSync(
    path.join(process.cwd(), expertisesDir, "fr"),
  );

  let created = 0;

  for (const filename of expertisesFr) {
    if (!filename.endsWith(".md")) continue;

    const slug = filename.replace(".md", "");

    // Charger FR et EN
    const expertiseFr = loadMarkdown(`${expertisesDir}/fr/${filename}`);
    const expertiseEn = loadMarkdown(`${expertisesDir}/en/${filename}`);

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
    const imageAssets: string[] = [];
    const frontmatter = expertiseFr.frontmatter;

    let coverImageId: string | undefined;

    for (const key of Object.keys(frontmatter)) {
      if (key.startsWith("img")) {
        const imgValue = frontmatter[key];
        const imgPath = normalizeImagePath(
          typeof imgValue === "string" ? imgValue : null,
        );
        if (imgPath && imageExists(imgPath)) {
          const asset = await createAsset(imgPath);
          if (asset) {
            // imgHome devient le coverImage
            if (key === "imgHome") {
              coverImageId = asset.id;
            } else {
              imageAssets.push(asset.id);
            }
          }
        }
      }
    }

    // Créer l'expertise avec les images connectées
    const titleFr = getFrontmatterString(frontmatter, "title", slug);
    const descriptionFr = getFrontmatterString(frontmatter, "description");
    const titleEn = expertiseEn
      ? getFrontmatterString(expertiseEn.frontmatter, "title", titleFr)
      : titleFr;
    const descriptionEn = expertiseEn
      ? getFrontmatterString(
          expertiseEn.frontmatter,
          "description",
          descriptionFr,
        )
      : descriptionFr;
    const orderId = parseInt(getFrontmatterString(frontmatter, "id", "0")) || 0;

    await prisma.expertise.upsert({
      where: { slug },
      create: {
        slug,
        order: orderId,
        isActive: true,
        coverImageId,
        images: {
          connect: imageAssets.map((id) => ({ id })),
        },
        translations: {
          create: [
            {
              locale: "fr",
              title: titleFr,
              description: descriptionFr,
              content: contentFr.join("\n<!-- section:end -->\n"),
            },
            {
              locale: "en",
              title: titleEn,
              description: descriptionEn,
              content: contentEn.join("\n<!-- section:end -->\n"),
            },
          ],
        },
      },
      update: {
        order: orderId,
        isActive: true,
        coverImageId,
        images: {
          set: imageAssets.map((id) => ({ id })),
        },
        translations: {
          deleteMany: {},
          create: [
            {
              locale: "fr",
              title: titleFr,
              description: descriptionFr,
              content: contentFr.join("\n<!-- section:end -->\n"),
            },
            {
              locale: "en",
              title: titleEn,
              description: descriptionEn,
              content: contentEn.join("\n<!-- section:end -->\n"),
            },
          ],
        },
      },
    });

    created++;
  }

  console.log(`✅ Created ${String(created)} expertises`);
}

// ============================================
// SEED ADMIN USER
// ============================================

async function seedAdminUser() {
  console.log("\n👤 Seeding admin user...");

  const { auth } = await import("../lib/auth");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@synck.fr";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { accounts: true },
  });

  if (existingUser) {
    console.log("   Utilisateur existant, suppression pour recréation...");
    await prisma.account.deleteMany({
      where: { userId: existingUser.id },
    });
    await prisma.session.deleteMany({
      where: { userId: existingUser.id },
    });
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
  }

  // Créer l'utilisateur via Better-Auth API (hash le mot de passe correctement)
  const result = await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: "Admin",
    },
  });

  // Mettre à jour le rôle et le statut
  await prisma.user.update({
    where: { id: result.user.id },
    data: {
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
    },
  });

  console.log(`✅ Admin user created: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("   ⚠️  IMPORTANT: Change this password after first login!");
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log("🌱 Starting database seed...\n");

  try {
    if (SKIP_SEED_IF_DATA_PRESENT) {
      const [categoriesCount, worksCount, expertisesCount] = await Promise.all([
        prisma.category.count(),
        prisma.work.count(),
        prisma.expertise.count(),
      ]);

      if (categoriesCount > 0 && worksCount > 0 && expertisesCount > 0) {
        console.log(
          "⏭️  SKIP_SEED_IF_DATA_PRESENT=1 et données déjà présentes, seed ignoré.",
        );
        return;
      }
    }

    await seedCategories();
    await seedLabels();
    await seedArtists();
    await seedWorks();
    await seedExpertises();
    await seedAdminUser();

    console.log("\n🎉 Database seeding completed!");
  } catch (error: unknown) {
    console.error("\n❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
