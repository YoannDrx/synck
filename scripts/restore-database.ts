import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface BackupData {
  timestamp: string;
  version: string;
  data: {
    users?: any[];
    categories?: any[];
    labels?: any[];
    composers?: any[];
    expertises?: any[];
    works?: any[];
    assets?: any[];
    composerLinks?: any[];
    contributions?: any[];
    sessions?: any[];
    accounts?: any[];
    verifications?: any[];
    categoryTranslations?: any[];
    labelTranslations?: any[];
    composerTranslations?: any[];
    expertiseTranslations?: any[];
    workTranslations?: any[];
  };
}

async function clearDatabase() {
  console.log("🗑️  Nettoyage de la base de données...");

  // Ordre important : supprimer d'abord les tables avec foreign keys
  await prisma.$executeRaw`TRUNCATE TABLE "WorkTranslation" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ExpertiseTranslation" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "ComposerTranslation" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "LabelTranslation" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "CategoryTranslation" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Contribution" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Work" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Expertise" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Composer" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Label" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Category" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Asset" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Session" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Verification" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Account" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;

  console.log("✅ Base de données nettoyée");
}

async function restoreData(backupPath: string) {
  console.log(`📂 Lecture de la sauvegarde: ${backupPath}`);

  const backupContent = fs.readFileSync(backupPath, "utf-8");
  const backup: BackupData = JSON.parse(backupContent);

  console.log(
    `📅 Sauvegarde du ${new Date(backup.timestamp).toLocaleString("fr-FR")}`,
  );
  console.log(`📦 Version: ${backup.version}`);

  // Nettoyer la base de données
  await clearDatabase();

  console.log("\n📥 Restauration des données...\n");

  // Ordre de restauration (respecter les foreign keys)

  // 1. Users
  if (backup.data.users && backup.data.users.length > 0) {
    console.log(
      `👤 Restauration de ${backup.data.users.length} utilisateurs...`,
    );
    for (const user of backup.data.users) {
      const { accounts, sessions, ...userData } = user;
      await prisma.user.create({
        data: {
          ...userData,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
          lastLoginAt: userData.lastLoginAt
            ? new Date(userData.lastLoginAt)
            : null,
        },
      });

      // Accounts
      if (accounts && accounts.length > 0) {
        for (const account of accounts) {
          await prisma.account.create({
            data: {
              ...account,
              createdAt: new Date(account.createdAt),
              updatedAt: new Date(account.updatedAt),
              expiresAt: account.expiresAt ? new Date(account.expiresAt) : null,
            },
          });
        }
      }

      // Sessions
      if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          await prisma.session.create({
            data: {
              ...session,
              createdAt: new Date(session.createdAt),
              updatedAt: new Date(session.updatedAt),
              expiresAt: new Date(session.expiresAt),
            },
          });
        }
      }
    }
    console.log("✅ Utilisateurs restaurés");
  }

  // 2. Assets
  if (backup.data.assets && backup.data.assets.length > 0) {
    console.log(`🖼️  Restauration de ${backup.data.assets.length} assets...`);
    for (const asset of backup.data.assets) {
      await prisma.asset.create({
        data: {
          ...asset,
          createdAt: new Date(asset.createdAt),
          updatedAt: new Date(asset.updatedAt),
        },
      });
    }
    console.log("✅ Assets restaurés");
  }

  // 3. Categories
  if (backup.data.categories && backup.data.categories.length > 0) {
    console.log(
      `📁 Restauration de ${backup.data.categories.length} catégories...`,
    );
    for (const category of backup.data.categories) {
      const { translations, ...categoryData } = category;
      await prisma.category.create({
        data: {
          ...categoryData,
          createdAt: new Date(categoryData.createdAt),
          updatedAt: new Date(categoryData.updatedAt),
        },
      });

      // Translations
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          await prisma.categoryTranslation.create({
            data: translation,
          });
        }
      }
    }
    console.log("✅ Catégories restaurées");
  }

  // 4. Labels
  if (backup.data.labels && backup.data.labels.length > 0) {
    console.log(`🏷️  Restauration de ${backup.data.labels.length} labels...`);
    for (const label of backup.data.labels) {
      const { translations, ...labelData } = label;
      await prisma.label.create({
        data: {
          ...labelData,
          createdAt: new Date(labelData.createdAt),
          updatedAt: new Date(labelData.updatedAt),
        },
      });

      // Translations
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          await prisma.labelTranslation.create({
            data: translation,
          });
        }
      }
    }
    console.log("✅ Labels restaurés");
  }

  // 5. Composers
  if (backup.data.composers && backup.data.composers.length > 0) {
    console.log(
      `🎵 Restauration de ${backup.data.composers.length} compositeurs...`,
    );
    for (const composer of backup.data.composers) {
      const { translations, contributions, ...composerData } = composer;
      await prisma.composer.create({
        data: {
          ...composerData,
          createdAt: new Date(composerData.createdAt),
          updatedAt: new Date(composerData.updatedAt),
        },
      });

      // Translations
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          await prisma.composerTranslation.create({
            data: translation,
          });
        }
      }
    }
    console.log("✅ Compositeurs restaurés");
  }

  // 6. Expertises
  if (backup.data.expertises && backup.data.expertises.length > 0) {
    console.log(
      `📄 Restauration de ${backup.data.expertises.length} expertises...`,
    );
    for (const expertise of backup.data.expertises) {
      const { translations, ...expertiseData } = expertise;
      await prisma.expertise.create({
        data: {
          ...expertiseData,
          createdAt: new Date(expertiseData.createdAt),
          updatedAt: new Date(expertiseData.updatedAt),
        },
      });

      // Translations
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          await prisma.expertiseTranslation.create({
            data: translation,
          });
        }
      }
    }
    console.log("✅ Expertises restaurées");
  }

  // 7. Works
  if (backup.data.works && backup.data.works.length > 0) {
    console.log(`🎬 Restauration de ${backup.data.works.length} works...`);
    for (const work of backup.data.works) {
      const { translations, contributions, images, ...workData } = work;
      await prisma.work.create({
        data: {
          ...workData,
          createdAt: new Date(workData.createdAt),
          updatedAt: new Date(workData.updatedAt),
        },
      });

      // Translations
      if (translations && translations.length > 0) {
        for (const translation of translations) {
          await prisma.workTranslation.create({
            data: translation,
          });
        }
      }

      // Contributions (relations Work ↔ Composer)
      if (contributions && contributions.length > 0) {
        for (const contribution of contributions) {
          await prisma.contribution.create({
            data: contribution,
          });
        }
      }
    }
    console.log("✅ Works restaurés");
  }

  console.log("\n✅ Restauration terminée avec succès!");
}

async function main() {
  try {
    // Par défaut, utiliser la sauvegarde la plus récente
    const backupPath =
      process.argv[2] ||
      path.join(
        process.cwd(),
        "backups",
        "synck_backup_2025-11-18T11-51-45.json",
      );

    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Fichier de sauvegarde introuvable: ${backupPath}`);
      process.exit(1);
    }

    await restoreData(backupPath);
  } catch (error) {
    console.error("❌ Erreur lors de la restauration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
