import { PrismaClient } from "@prisma/client";

// Utiliser DIRECT_URL pour la prod (connexion directe, pas pooling)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    },
  },
});

async function checkAdminProd() {
  try {
    console.log("\n🔍 Vérification des utilisateurs en base PRODUCTION...");
    console.log("====================================================\n");

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log("❌ Aucun utilisateur trouvé en base de production\n");
      console.log("💡 Pour créer un utilisateur admin, lance :");
      console.log("   pnpm tsx scripts/create-admin.ts\n");
    } else {
      console.log(`✅ ${users.length} utilisateur(s) trouvé(s) :\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Nom: ${user.name ?? "Non défini"}`);
        console.log(`   - Rôle: ${user.role}`);
        console.log(`   - Actif: ${user.isActive ? "Oui" : "Non"}`);
        console.log(
          `   - Créé le: ${user.createdAt.toLocaleDateString("fr-FR")}\n`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification :", error);
    console.log(
      "\n💡 Assure-toi que DIRECT_URL ou DATABASE_URL pointe vers la prod\n",
    );
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminProd();
