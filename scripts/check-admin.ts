import { prisma } from "../lib/prisma";

async function checkAdmin() {
  try {
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

    console.log("\n📊 Utilisateurs en base de données :");
    console.log("=====================================\n");

    if (users.length === 0) {
      console.log("❌ Aucun utilisateur trouvé en base de données\n");
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
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
