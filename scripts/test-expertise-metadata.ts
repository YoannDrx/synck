import { getExpertise } from "@/lib/prismaExpertiseUtils";

async function main() {
  console.log("🔍 Test expertise metadata...\n");

  // Test gestion-admin (should have documentaires and image links)
  const gestionAdmin = await getExpertise(
    "gestion-administrative-et-editoriale",
    "fr",
  );

  if (gestionAdmin) {
    console.log("📁 Gestion Administrative:");
    console.log(`   img2Link: ${gestionAdmin.img2Link || "❌"}`);
    console.log(`   img3Link: ${gestionAdmin.img3Link || "❌"}`);
    console.log(
      `   Documentaires: ${gestionAdmin.documentaires?.length || 0} items`,
    );
    if (gestionAdmin.documentaires && gestionAdmin.documentaires.length > 0) {
      console.log(`   First doc: ${gestionAdmin.documentaires[0].title}`);
    }
  }

  // Test sous-edition (should have labels)
  const sousEdition = await getExpertise("sous-edition", "fr");

  if (sousEdition) {
    console.log("\n🏷️  Sous-Édition:");
    console.log(`   Labels: ${sousEdition.labels?.length || 0} items`);
    if (sousEdition.labels && sousEdition.labels.length > 0) {
      console.log(`   First label: ${sousEdition.labels[0].name}`);
      console.log(`   First label src: ${sousEdition.labels[0].src}`);
    }
  }

  console.log("\n✅ Test completed!");
}

main().catch(console.error);
