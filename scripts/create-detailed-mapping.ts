import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Mapping manuel basé sur l'analyse approfondie
const MANUAL_MAPPING: { [filename: string]: { label: string; confidence: string; reasoning: string } } = {
  // === 13PRODS - Politique & Société ===
  'a-vous-de-juger.jpg': { label: '13prods', confidence: 'high', reasoning: 'Émission politique française' },
  'clearstream-et-moi.jpg': { label: '13prods', confidence: 'high', reasoning: 'Affaire politique française' },
  'cogolin-ville-a-prendre.jpg': { label: '13prods', confidence: 'high', reasoning: 'Politique locale française' },
  'de-gerard-a-monsieur.jpg': { label: '13prods', confidence: 'high', reasoning: 'Politique - Gérard Collomb' },
  'eric-piolle2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Politique - Maire de Grenoble' },
  'gaudin2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Politique - Maire de Marseille' },
  'juppe.jpg': { label: '13prods', confidence: 'high', reasoning: 'Politique - Alain Juppé' },
  'karim-contre-mittal.jpg': { label: '13prods', confidence: 'high', reasoning: 'Luttes sociales françaises' },
  'la-greve-du-siecle.jpg': { label: '13prods', confidence: 'high', reasoning: 'Social - grèves en France' },
  'le-ministere.jpg': { label: '13prods', confidence: 'high', reasoning: 'Institutionnel français' },
  'les-amoureux-de-marianne.jpg': { label: '13prods', confidence: 'high', reasoning: 'République française' },
  'les-oublies-de-la-justice.jpg': { label: '13prods', confidence: 'high', reasoning: 'Justice sociale' },
  'les-ouvrieres-du-made-in-france.jpg': { label: '13prods', confidence: 'high', reasoning: 'Social/économie France' },
  'nous-ne-sommes-rien.jpg': { label: '13prods', confidence: 'high', reasoning: 'Luttes sociales' },
  'votez-jeunesse.jpg': { label: '13prods', confidence: 'high', reasoning: 'Politique/jeunesse' },
  'diam-a-jul-marseille-capitale-rap2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Marseille thématique récurrente 13prods' },
  'marseille-capitale2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Marseille' },
  'ma-cite-mon-village.jpg': { label: '13prods', confidence: 'high', reasoning: 'Quartiers populaires' },

  // === 13PRODS - Histoire & Mémoire ===
  'resistantes-allemandes.jpg': { label: '13prods', confidence: 'high', reasoning: 'WW2 - Résistantes allemandes' },
  'cabrera-un-secret-revele.jpg': { label: '13prods', confidence: 'high', reasoning: 'Histoire' },
  'des-antilles-au-djebel2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Histoire coloniale française' },
  'filles-de-harkis.jpg': { label: '13prods', confidence: 'high', reasoning: 'Histoire Algérie française' },
  'georges-perec-lhomme-qui-ne-voulait-pas-oublier2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Littérature/mémoire française' },
  'goerges-perec2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Georges Perec (même doc)' },
  'gurs-un-silence-assourdissant.jpg': { label: '13prods', confidence: 'high', reasoning: 'Camp de Gurs (France)' },
  'leiiieme-reich-naura-pas-la-bombe.jpg': { label: '13prods', confidence: 'high', reasoning: 'WW2' },
  'leproces-daushwitz-la-fin-du-silence2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Shoah/procès' },
  'les-femmes-du-iiieme-reich.jpg': { label: '13prods', confidence: 'high', reasoning: 'WW2' },
  'les-murs-de-la-honte.jpg': { label: '13prods', confidence: 'high', reasoning: 'Histoire/frontières' },
  'les-resistants-de-mauthausen.jpg': { label: '13prods', confidence: 'high', reasoning: 'WW2/résistance' },
  'marcus-klingberg-un-pur-espion.jpg': { label: '13prods', confidence: 'high', reasoning: 'Espionnage/histoire' },
  'marcus-klingberg-un-pur-espion2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Espionnage (même doc)' },
  'solidarnosc2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Histoire politique européenne' },

  // === 13PRODS - Outre-Mer & Antilles ===
  'au-nom-de-la-mer2.jpg': { label: '13prods', confidence: 'medium', reasoning: 'Mer/environnement OM' },
  'deconfines-en-re.jpg': { label: '13prods', confidence: 'high', reasoning: 'Île de Ré' },
  'guadeloupe-les-soldats-de-la-terre.jpg': { label: '13prods', confidence: 'high', reasoning: 'Antilles françaises' },
  'guyane-underground.jpg': { label: '13prods', confidence: 'high', reasoning: 'Guyane française' },
  'leila-une-vie-a-miquelon2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Saint-Pierre-et-Miquelon' },
  'makatea2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Polynésie française' },
  'martinique-la-reconquete-de-la-terre.jpg': { label: '13prods', confidence: 'high', reasoning: 'Martinique' },
  'mayotte-les-combattantes.jpg': { label: '13prods', confidence: 'high', reasoning: 'Mayotte' },
  'mayotte-lenfance-danger.jpg': { label: '13prods', confidence: 'high', reasoning: 'Mayotte' },
  'miquelon-entre-deux-eaux.jpg': { label: '13prods', confidence: 'high', reasoning: 'Saint-Pierre-et-Miquelon' },
  'outremer100.jpg': { label: '13prods', confidence: 'high', reasoning: 'Outre-mer français' },
  'si-loin-de-la-polynesie.jpg': { label: '13prods', confidence: 'high', reasoning: 'Polynésie française' },

  // === 13PRODS - Société & Vie Quotidienne ===
  'cancre-2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Éducation' },
  'chanter-a-tout-prix.jpg': { label: '13prods', confidence: 'high', reasoning: 'Musique/société' },
  'comment-te-dire-adieu.jpg': { label: '13prods', confidence: 'high', reasoning: 'Fin de vie' },
  'comment-te-dire-adieu2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Fin de vie (variante)' },
  'comment-te-dire-adieu3.jpg': { label: '13prods', confidence: 'high', reasoning: 'Fin de vie (variante)' },
  'comment-te-dire-adieu4.jpg': { label: '13prods', confidence: 'high', reasoning: 'Fin de vie (variante)' },
  'deconnectes.jpg': { label: '13prods', confidence: 'high', reasoning: 'Fracture numérique' },
  'en-jachere.jpg': { label: '13prods', confidence: 'high', reasoning: 'Agriculture/société' },
  'lache-ton-smartphone.jpg': { label: '13prods', confidence: 'high', reasoning: 'Numérique/société' },
  'pas-folle-la-liberte.jpg': { label: '13prods', confidence: 'high', reasoning: 'Psychiatrie/société' },
  'tgros.jpg': { label: '13prods', confidence: 'high', reasoning: 'Société' },
  'une-deuxieme-chance.jpg': { label: '13prods', confidence: 'high', reasoning: 'Réinsertion' },
  'unique-en-mon-genre.jpg': { label: '13prods', confidence: 'high', reasoning: 'Genre/identité' },
  'unique-en-mon-genre2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Genre/identité (variante)' },

  // === 13PRODS - Climat & Environnement ===
  'jean-jouzel-dans-la-bataille-du-siecle.jpg': { label: '13prods', confidence: 'high', reasoning: 'Climat - personnalité française' },
  'la-brousse-une-terre-en-partage.jpg': { label: '13prods', confidence: 'high', reasoning: 'Environnement' },
  'les-poisons-de-poutine.jpg': { label: '13prods', confidence: 'high', reasoning: 'Géopolitique/empoisonnements' },
  'la-double-vie-du-cognac2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Terroir/économie française' },
  'la-double-vie-du-cognac3.jpg': { label: '13prods', confidence: 'high', reasoning: 'Terroir/économie française (variante)' },
  'par-nos-yeux.jpg': { label: '13prods', confidence: 'medium', reasoning: 'Regard/société' },

  // === 13PRODS - Déjà assignés (à déplacer seulement) ===
  'andre-mailfert-lepopee-dun-faussaire-industriel.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'cahier-d-un-retour.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'la-clinique-de-lamour.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'la-rumeur-dorleans2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'le-proces.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD - Procès Auschwitz' },
  'le-temps-daimer2.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'les-enfants-de-huahine-portfolio.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD - Polynésie' },
  'leveil-du-désir.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'martineaubry.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD - Politique' },
  'masque-de-fer.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'mes-parents.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'micmac-a-millau-les-paysans-face-a-la-mondialisation.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'petit-pays-je-taime-beaucoup.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'petit-pays.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'quand-lafrique-sauva-la-france.jpg': { label: '13prods', confidence: 'high', reasoning: 'Déjà assigné en BDD - Histoire' },

  // === VIA-DECOUVERTES-FILMS - Nature & Environnement ===
  'avant-que-la-grande-nacre-meure2.jpg': { label: 'via-decouvertes-films', confidence: 'high', reasoning: 'Nature marine/biodiversité' },
  'calanques.jpg': { label: 'via-decouvertes-films', confidence: 'high', reasoning: 'Environnement/nature' },
  'gorongosa-le-parc-de-reconciliation.jpg': { label: 'via-decouvertes-films', confidence: 'high', reasoning: 'Parc naturel' },
  'operation-biodiv.jpg': { label: 'via-decouvertes-films', confidence: 'high', reasoning: 'Biodiversité' },
  'operation-biodiversite3.jpg': { label: 'via-decouvertes-films', confidence: 'high', reasoning: 'Biodiversité (variante)' },
  'plonger-pour-guerir.jpg': { label: 'via-decouvertes-films', confidence: 'high', reasoning: 'Mer/santé' },
  'se-mettre-au-vert-portfolio.jpg': { label: 'via-decouvertes-films', confidence: 'high', reasoning: 'Environnement' },

  // === POP-FILMS - Culture & Arts ===
  'generation-grand-bleu2.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Cinéma français' },
  'generation-grand-bleu-3.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Cinéma français (variante)' },
  'jamie-lee-curtis2.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Cinéma/actrice' },
  'mangas2portfolio.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Culture pop japonaise' },
  'patrick-edlinger-la-liberte-au-bout-des-doigts.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Sport/culture' },
  'pedroalmodovar.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Cinéma espagnol' },
  'reves-de-princesses2.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Culture/imaginaire' },
  'souvenirs-en-cuisine2.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Gastronomie/culture' },
  'souvenirs-en-cuisine3.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Gastronomie/culture (variante)' },
  'souvenirs-en-cuisine4.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Gastronomie/culture (variante)' },
  'sweet-sweetback2.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Cinéma noir américain' },
  'jules-verne-et-le-defi-du-tour-du-tour-du-monde.jpg': { label: 'pop-films', confidence: 'medium', reasoning: 'Littérature/aventure' },

  // === POP-FILMS - Déjà assignés ===
  'chants-gregoriens-2-0.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Déjà assigné en BDD - Musique' },
  'naissance-dun-heros-noir-au-cinema-sweet-sweetback.jpg': { label: 'pop-films', confidence: 'high', reasoning: 'Déjà assigné en BDD - Cinéma' },

  // === LITTLE-BIG-STORY - International & Enquêtes ===
  'bnp-paribas-dans-les-eaux-troubles-de-la-plus-grande-banque-européenne.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Finance internationale' },
  'la-democratie-du-doller.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Économie internationale' },
  'les-oublies-de-latome2.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Nucléaire international' },
  'sous-la-loi-des-talibans2.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Afghanistan/géopolitique' },

  // === LITTLE-BIG-STORY - Déjà assignés ===
  'la-femme-sans-nom-lhistoire-de-jeanne-et-baudelaire.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'lempire-de-lor-rouge2.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'les-oublies-de-latome.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Déjà assigné en BDD' },
  'taiwan-une-democratie-a-lombre-de-la-chine.jpg': { label: 'little-big-story', confidence: 'high', reasoning: 'Déjà assigné en BDD - Géopolitique' },

  // === CAS NÉCESSITANT RECHERCHE ===
  'disparu-387.jpg': { label: 'unknown', confidence: 'low', reasoning: 'Non matché - nécessite recherche manuelle' },
  'entendez-nous-portfolio.jpg': { label: 'unknown', confidence: 'low', reasoning: 'Non matché - nécessite recherche manuelle' },
  'les-viants-portfolio.jpg': { label: 'unknown', confidence: 'low', reasoning: 'Non matché - nécessite recherche manuelle' },
  'jirai-crier2.jpg': { label: '13prods', confidence: 'medium', reasoning: 'Probablement social/société' },
  'la-femme-sans-nom2.jpg': { label: 'little-big-story', confidence: 'low', reasoning: 'Possiblement doublon - à vérifier' },
};

async function createDetailedMapping() {
  console.log('\n📝 CRÉATION DU MAPPING DÉTAILLÉ\n');
  console.log('='.repeat(80) + '\n');

  const autresDir = '/Users/yoannandrieux/Projets/synck/public/images/portfolio/documentaires/autres';
  const files = fs.readdirSync(autresDir).filter(f => f.endsWith('.jpg'));

  console.log(`📊 ${files.length} fichiers trouvés dans autres/\n`);

  const mapping: any[] = [];
  let notMapped = 0;

  for (const file of files) {
    const manualEntry = MANUAL_MAPPING[file];

    if (manualEntry) {
      // Chercher le work en BDD
      const works = await prisma.work.findMany({
        where: {
          category: { slug: 'documentaire' },
          OR: [
            { slug: { contains: file.replace('.jpg', '').toLowerCase() } },
            { coverImage: { path: { contains: file } } }
          ]
        },
        include: {
          translations: { where: { locale: 'fr' } },
          label: true
        }
      });

      const work = works[0]; // Prendre le premier match

      mapping.push({
        filename: file,
        workId: work?.id || null,
        workSlug: work?.slug || null,
        workTitle: work?.translations[0]?.title || null,
        currentLabel: work?.label?.slug || null,
        suggestedLabel: manualEntry.label,
        confidence: manualEntry.confidence,
        reasoning: manualEntry.reasoning,
        needsLabelUpdate: work && (!work.label || work.label.slug !== manualEntry.label),
        currentPath: `/images/portfolio/documentaires/autres/${file}`,
        targetPath: `/images/portfolio/documentaires/${manualEntry.label}/${file}`
      });

      if (work) {
        console.log(`✅ ${file}`);
        console.log(`   Work: "${work.translations[0]?.title || work.slug}"`);
        console.log(`   ${manualEntry.confidence.toUpperCase()}: ${manualEntry.label} - ${manualEntry.reasoning}\n`);
      } else {
        console.log(`⚠️  ${file}`);
        console.log(`   Pas de work en BDD`);
        console.log(`   ${manualEntry.confidence.toUpperCase()}: ${manualEntry.label} - ${manualEntry.reasoning}\n`);
      }
    } else {
      notMapped++;
      console.log(`❌ ${file} - PAS DANS LE MAPPING MANUEL\n`);

      mapping.push({
        filename: file,
        workId: null,
        workSlug: null,
        workTitle: null,
        currentLabel: null,
        suggestedLabel: 'unknown',
        confidence: 'none',
        reasoning: 'Fichier non prévu dans le mapping',
        needsLabelUpdate: false,
        currentPath: `/images/portfolio/documentaires/autres/${file}`,
        targetPath: null
      });
    }
  }

  // Statistiques
  const byLabel: { [key: string]: number } = {};
  const byConfidence: { [key: string]: number } = {};

  mapping.forEach(m => {
    byLabel[m.suggestedLabel] = (byLabel[m.suggestedLabel] || 0) + 1;
    byConfidence[m.confidence] = (byConfidence[m.confidence] || 0) + 1;
  });

  console.log('='.repeat(80));
  console.log('\n📊 STATISTIQUES:\n');
  console.log('Par label:');
  Object.entries(byLabel).sort((a, b) => b[1] - a[1]).forEach(([label, count]) => {
    console.log(`   ${label}: ${count}`);
  });
  console.log('\nPar confiance:');
  Object.entries(byConfidence).sort((a, b) => b[1] - a[1]).forEach(([conf, count]) => {
    console.log(`   ${conf}: ${count}`);
  });
  console.log(`\n   Fichiers non mappés: ${notMapped}`);

  // Sauvegarder le mapping
  const reportPath = '/Users/yoannandrieux/Projets/synck/scripts/autres-detailed-mapping.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    mapped: files.length - notMapped,
    notMapped,
    byLabel,
    byConfidence,
    mapping
  }, null, 2));

  console.log(`\n✅ Mapping sauvegardé: ${reportPath}\n`);
  console.log('='.repeat(80) + '\n');

  await prisma.$disconnect();
}

createDetailedMapping().catch(console.error);
