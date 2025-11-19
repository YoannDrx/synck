import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("🗑️  Suppression des doublons...\n");

  // IDs à supprimer (doublons sans image ou avec slugs moins bons)
  const idsToDelete = [
    // Mes parents ces héros ordinaires (sans image)
    "cmi4hg92r0016sk3nndqgh19z",
    // Martine Aubry (sera re-seeded avec image)
    "cmi4hgcb10025sk3nq99syk4l",
    // Cahier d'un retour (sans image)
    "cmi4hgew6002zsk3naip25y2x",
    // La clinique de l'amour (sans image)
    "cmi4hgh4h003osk3ncnwvmr1o",
    // De Gérard à Monsieur Collomb (sans image, sera re-seeded)
    "cmi1vguqd00yoskej9dng0iv6",
    // L'éveil du désir (sans image)
    "cmi1vgwkc00ziskej2d91a14d",
    // NY Parigo clip (sans image, doublon avec vinyle)
    "cmi1vgzz70111skejqbhbndlf",
    // Videoclub clip (sans image, doublon avec album et vinyle)
    "cmi1vh187011lskej61lcgq6l",
    // Une dernière fois clip (sans image, doublon avec vinyle)
    "cmi1vh0xk011gskejm3o8a442",
  ];

  console.log(`📋 ${idsToDelete.length} doublons à supprimer\n`);

  for (const id of idsToDelete) {
    try {
      const work = await prisma.work.findUnique({
        where: { id },
        select: {
          slug: true,
          translations: {
            where: { locale: "fr" },
            select: { title: true },
          },
        },
      });

      if (work) {
        await prisma.work.delete({ where: { id } });
        console.log(
          `✅ Supprimé: ${work.translations[0]?.title || work.slug} (${id})`,
        );
      }
    } catch (error) {
      console.log(`❌ Erreur lors de la suppression de ${id}:`, error);
    }
  }

  console.log("\n✨ Nettoyage terminé!");

  await prisma.$disconnect();
}

main().catch(console.error);
