import { PrismaClient } from "@prisma/client";
import * as readline from "readline";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log("\n👤 Création d'un utilisateur admin");
    console.log("===================================\n");

    const email = await question("Email de l'admin : ");
    const password = await question("Mot de passe (min. 8 caractères) : ");
    const name = await question("Nom (optionnel) : ");

    if (!email || !password) {
      console.log("\n❌ Email et mot de passe sont requis\n");
      return;
    }

    if (password.length < 8) {
      console.log("\n❌ Le mot de passe doit contenir au moins 8 caractères\n");
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`\n⚠️  Un utilisateur avec l'email ${email} existe déjà`);
      const confirm = await question(
        "Voulez-vous mettre à jour le mot de passe ? (o/N) : ",
      );

      if (confirm.toLowerCase() !== "o" && confirm.toLowerCase() !== "oui") {
        console.log("\n❌ Opération annulée\n");
        return;
      }

      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.account.updateMany({
        where: {
          userId: existingUser.id,
          providerId: "credential",
        },
        data: {
          password: hashedPassword,
        },
      });

      console.log(`\n✅ Mot de passe mis à jour pour ${email}\n`);
      return;
    }

    // Créer un nouvel utilisateur admin
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || "Admin",
        emailVerified: true,
        role: "ADMIN",
        isActive: true,
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: hashedPassword,
      },
    });

    console.log(`\n✅ Utilisateur admin créé avec succès !`);
    console.log(`   Email : ${email}`);
    console.log(`   Nom : ${user.name}\n`);
  } catch (error) {
    console.error("\n❌ Erreur lors de la création :", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
