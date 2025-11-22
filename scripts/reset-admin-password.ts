import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function resetAdminPassword() {
  try {
    console.log("\n🔑 Réinitialisation du mot de passe admin...\n");

    const email = "admin@synck.fr";
    const password = "admin123456";

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Utilisateur ${email} non trouvé\n`);
      return;
    }

    // Hash le mot de passe avec bcrypt (BetterAuth utilise bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`📝 Hash généré: ${hashedPassword.substring(0, 20)}...\n`);

    // Mettre à jour ou créer le compte
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          password: hashedPassword,
        },
      });
      console.log(`✅ Mot de passe mis à jour pour ${email}`);
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: user.id,
          password: hashedPassword,
        },
      });
      console.log(`✅ Compte credential créé pour ${email}`);
    }

    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
