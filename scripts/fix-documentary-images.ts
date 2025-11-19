import fs from "fs";
import path from "path";

// Mapping des fichiers qui doivent être copiés
const filesToCopy = [
  // Les oubliés de l'atome
  {
    from: "public/images/projets/documentaires/little-big-story/les-oublies-de-latome.jpg",
    to: "public/images/projets/documentaires/les-oublies-de-latome.jpg",
  },
  {
    from: "public/images/projets/documentaires/little-big-story/les-oublies-de-latome2.jpg",
    to: "public/images/projets/documentaires/les-oublies-de-latome2.jpg",
  },
  // Mes parents ces héros
  {
    from: "public/images/projets/documentaires/13prods/mes-parents.jpg",
    to: "public/images/projets/documentaires/mes-parents.jpg",
  },
  // Martine Aubry
  {
    from: "public/images/projets/documentaires/13prods/martineaubry.jpg",
    to: "public/images/projets/documentaires/martineaubry.jpg",
  },
  // Cahier d'un retour
  {
    from: "public/images/projets/documentaires/13prods/cahier-d-un-retour.jpg",
    to: "public/images/projets/documentaires/cahier-d_un-retour.jpg",
  },
  // La clinique de l'amour
  {
    from: "public/images/projets/documentaires/13prods/la-clinique-de-lamour.jpg",
    to: "public/images/projets/documentaires/la-clinique-de-lamour.jpg",
  },
  // Souvenirs en cuisine
  {
    from: "public/images/projets/documentaires/pop-films/souvenirs-en-cuisine2.jpg",
    to: "public/images/projets/documentaires/souvenirs-en-cuisine2.jpg",
  },
  {
    from: "public/images/projets/documentaires/pop-films/souvenirs-en-cuisine3.jpg",
    to: "public/images/projets/documentaires/souvenirs-en-cuisine3.jpg",
  },
  {
    from: "public/images/projets/documentaires/pop-films/souvenirs-en-cuisine4.jpg",
    to: "public/images/projets/documentaires/souvenirs-en-cuisine4.jpg",
  },
  // De Gérard à Monsieur Collomb
  {
    from: "public/images/projets/documentaires/13prods/de-gerard-a-monsieur.jpg",
    to: "public/images/projets/documentaires/de-gerard-a-monsieur.jpg",
  },
  // L'éveil du désir
  {
    from: "public/images/projets/documentaires/13prods/leveil-du-desir-2.jpg",
    to: "public/images/projets/documentaires/leveil-du-desir.jpg",
  },
];

async function main() {
  console.log("🔧 Correction des chemins d'images des documentaires...\n");

  let copied = 0;
  let skipped = 0;

  for (const { from, to } of filesToCopy) {
    const fromPath = path.join(process.cwd(), from);
    const toPath = path.join(process.cwd(), to);

    if (!fs.existsSync(fromPath)) {
      console.log(`⚠️  Fichier source introuvable: ${from}`);
      skipped++;
      continue;
    }

    // Créer le dossier de destination si nécessaire
    const toDir = path.dirname(toPath);
    if (!fs.existsSync(toDir)) {
      fs.mkdirSync(toDir, { recursive: true });
    }

    // Copier le fichier
    fs.copyFileSync(fromPath, toPath);
    console.log(`✅ Copié: ${path.basename(to)}`);
    copied++;
  }

  console.log(`\n🎉 Terminé! ${copied} fichiers copiés, ${skipped} ignorés.`);
}

main().catch(console.error);
