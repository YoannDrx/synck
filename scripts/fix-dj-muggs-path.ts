import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing DJ Muggs path...\n");

  // Update the path
  const result = await prisma.asset.updateMany({
    where: {
      path: "/images/projets/evenements/dj-muggs.jpg",
    },
    data: {
      path: "/images/projets/photosCompo/dj-muggs.jpg",
    },
  });

  console.log(`✅ Updated ${result.count} asset(s)`);

  await prisma.$disconnect();
}

main();
