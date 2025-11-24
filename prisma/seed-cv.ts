import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCV() {
  console.log("🌱 Starting CV seed...");

  // Delete existing CV data
  await prisma.cVSocialLink.deleteMany();
  await prisma.cVSkillTranslation.deleteMany();
  await prisma.cVSkill.deleteMany();
  await prisma.cVItemTranslation.deleteMany();
  await prisma.cVItem.deleteMany();
  await prisma.cVSectionTranslation.deleteMany();
  await prisma.cVSection.deleteMany();
  await prisma.cV.deleteMany();

  console.log("🗑️  Cleaned existing CV data");

  // 1. Create the CV
  const cv = await prisma.cV.create({
    data: {
      phone: "06 84 18 18 84",
      email: "caroline.senyk@gmail.com",
      location: "75020 Paris",
      linkedInUrl: "https://linkedin.com/in/caroline-senyk",
      headlineFr: "Gestionnaire de droits musicaux",
      headlineEn: "Music Rights Manager",
      bioFr: `Depuis plusieurs années, j'accompagne des artistes dans l'émergence de leurs projets tant au niveau de la production originale que de la gestion des droits d'auteur et d'interprète. Je recherche aujourd'hui un poste qui me permettra de combiner ma rigueur en gestion du copyright et mes compétences en production musicale, développement dans le secteur du développement artistique.`,
      bioEn: `For several years, I have been supporting artists in developing their projects, both in terms of original production and copyright and performer rights management. I am currently seeking a position that will allow me to combine my rigor in copyright management and my skills in music production and artist development.`,
      layout: "creative",
      accentColor: "#D5FF0A",
      showPhoto: true,
    },
  });

  console.log("✅ Created CV");

  // 2. Create Experiences Section
  const experienceSection = await prisma.cVSection.create({
    data: {
      cvId: cv.id,
      type: "experience",
      icon: "Briefcase",
      color: "#D5FF0A",
      layoutType: "timeline",
      order: 0,
      isActive: true,
      translations: {
        create: [
          { locale: "fr", title: "Expériences Professionnelles" },
          { locale: "en", title: "Professional Experience" },
        ],
      },
    },
  });

  // Experience 1: Directrice Copyright & Administrative
  await prisma.cVItem.create({
    data: {
      sectionId: experienceSection.id,
      startDate: new Date("2021-09-01"),
      isCurrent: true,
      order: 0,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Directrice Copyright & Administrative",
            subtitle: "PARIGO",
            location: "Paris",
            description: `Réception des catalogues via Harvest et dépôt des œuvres locales et étrangères - Vérification des fichiers de répartition par source de diffusion - Relations avec les organismes de gestion collective - Gestion budgétaire des productions musicales - Création et gestion de la facturation (clients et fournisseurs) - Demandes de subventions - Relationnel ACI/Éditeurs - Accompagnement du CEO pour entretiens et recrutements - Transmission de données comptables et suivi du nombre de cabinet d'expert-comptable - Création / envoi / paiement des décomptes de royalties - Gestion des demandes RH (paies, titres restaurants, mutuelle santé, notes de frais) - Suivi Bancier`,
          },
          {
            locale: "en",
            title: "Copyright & Administrative Director",
            subtitle: "PARIGO",
            location: "Paris",
            description: `Catalogue reception via Harvest and deposit of local and foreign works - Verification of distribution files by broadcasting source - Relations with collective management organizations - Budget management of music productions - Creation and management of invoicing (clients and suppliers) - Grant applications - ACI/Publishers relations - CEO support for interviews and recruitment - Transmission of accounting data and monitoring of accounting firm - Creation / sending / payment of royalty statements - HR requests management (payroll, meal vouchers, health insurance, expense reports) - Bank monitoring`,
          },
        ],
      },
    },
  });

  // Experience 2: Responsable Copyright & Production
  await prisma.cVItem.create({
    data: {
      sectionId: experienceSection.id,
      startDate: new Date("2018-09-01"),
      endDate: new Date("2021-08-31"),
      isCurrent: false,
      order: 1,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Responsable Copyright & Production",
            subtitle: "PARIGO",
            location: "Paris",
            description: `Création et gestion du budget de production (supervision enregistrements studio, cachets artistes, mixage, mastering, visuel pochette, clips) - Mise en place des programmings de production artistique - Déclaration et paiement des brevets et clients via Movinmotion - Création des contrats d'enregistrement artiste interprète, de rachat de phonogrammes, diffusion à la SCPP - Dépôt de phonogrammes sur Vericast (Bmat) - Création et suivi de dossiers de subvention - Gestion des contrats d'édition et sous-édition (mise à jour des contrats, dépôt des fichiers sur metadata, dépôt des nouvelles représentations en sous-édition à la SACEM) - Dépôt de toute la sous-édition à la SCPP et Numérica - Tracking des programmes et des publicités via Vericast (Bmat) - Mise en place stratégie avec attachés de presse - Gestion message distribution envoi vinyles promotionnels - Déclarations SDRM`,
          },
          {
            locale: "en",
            title: "Copyright & Production Manager",
            subtitle: "PARIGO",
            location: "Paris",
            description: `Creation and management of production budget (studio recording supervision, artist fees, mixing, mastering, cover art, videos) - Setting up artistic production programming - Declaration and payment of patents and clients via Movinmotion - Creation of artist performer recording contracts, phonogram buyback, distribution to SCPP - Deposit of phonograms on Vericast (Bmat) - Creation and monitoring of grant files - Management of publishing and sub-publishing contracts (contract updates, metadata file deposits, new sub-publishing representations at SACEM) - Deposit of all sub-publishing at SCPP and Numérica - Tracking of programs and advertisements via Vericast (Bmat) - Press relations strategy implementation - Distribution message management, promotional vinyl shipments - SDRM declarations`,
          },
        ],
      },
    },
  });

  // Experience 3: Assistante Copyright & Administration
  await prisma.cVItem.create({
    data: {
      sectionId: experienceSection.id,
      startDate: new Date("2017-08-01"),
      endDate: new Date("2018-08-31"),
      isCurrent: false,
      order: 2,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Assistante Copyright & Administration",
            subtitle: "PARIGO",
            location: "Paris",
            description: `Préparation et archivage des pièces comptables, fiscales et sociales - Préparation et suivi des dossiers de subvention - Gestion des factures fournisseurs/clients et suivi des créances - Préparation et suivi des dépôts d'œuvres/des programmes et des publicités à la SACEM et SCPP - Dépôt et suivi des programmes et des publicités à la SACEM - Administration des contrats de gestion (productions audiovisuelles 13Prods, Via Découvertes Films et Little Big Story)`,
          },
          {
            locale: "en",
            title: "Copyright & Administration Assistant",
            subtitle: "PARIGO",
            location: "Paris",
            description: `Preparation and archiving of accounting, tax and social documents - Preparation and monitoring of grant files - Management of supplier/client invoices and receivables tracking - Preparation and monitoring of work/program and advertisement deposits at SACEM and SCPP - Deposit and monitoring of programs and advertisements at SACEM - Administration of management contracts (audiovisual productions 13Prods, Via Découvertes Films and Little Big Story)`,
          },
        ],
      },
    },
  });

  // Experience 4: Assistante Manager d'Artistes
  await prisma.cVItem.create({
    data: {
      sectionId: experienceSection.id,
      startDate: new Date("2016-01-01"),
      endDate: new Date("2016-12-31"),
      isCurrent: false,
      order: 3,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Assistante Manager d'Artistes",
            subtitle: "GIN AGENCY",
            location: "Paris",
            description: `Gestion et organisation des tournées pour Feder, Cristobal and the Sea et Ginkgoa - Élaboration des plannings - Création du routing - Coordination logistique (transports hébergements, transferts) - Création des feuilles de route - Gestion du merchandising et suivi des ventes - Communication avec les agences de booking - Examen du contenu des contrats artiste - Community management - Relations Presse - Suivi des budgets par artiste, tournée et projet`,
          },
          {
            locale: "en",
            title: "Artist Management Assistant",
            subtitle: "GIN AGENCY",
            location: "Paris",
            description: `Tour management and organization for Feder, Cristobal and the Sea and Ginkgoa - Schedule development - Routing creation - Logistical coordination (transport, accommodation, transfers) - Creation of road sheets - Merchandising management and sales tracking - Communication with booking agencies - Artist contract content review - Community management - Press relations - Budget monitoring per artist, tour and project`,
          },
        ],
      },
    },
  });

  // Experience 5: Assistante Edition Musicale
  await prisma.cVItem.create({
    data: {
      sectionId: experienceSection.id,
      startDate: new Date("2015-01-01"),
      endDate: new Date("2015-12-31"),
      isCurrent: false,
      order: 4,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Assistante Edition Musicale",
            subtitle: "DISTRICT 6 FRANCE PUBLISHING",
            location: "Paris",
            description: `Rédaction des contrats de cession et bulletins de déclaration - Dépôt des œuvres à la SACEM - Gestion de l'exploitation du catalogue - Mise en ligne des supports de communication (site, réseaux sociaux) - Gestion des droits voisins - Tracking des œuvres et publicités non identifiées - Création et suivi de dossiers de subvention - Inscription des artistes aux sociétés de gestion (SACEM, ADAMI, SPEDIDAM)`,
          },
          {
            locale: "en",
            title: "Music Publishing Assistant",
            subtitle: "DISTRICT 6 FRANCE PUBLISHING",
            location: "Paris",
            description: `Drafting of assignment contracts and declaration forms - Deposit of works at SACEM - Catalogue exploitation management - Online communication materials (website, social networks) - Neighboring rights management - Tracking of unidentified works and advertisements - Creation and monitoring of grant files - Artist registration with management societies (SACEM, ADAMI, SPEDIDAM)`,
          },
        ],
      },
    },
  });

  console.log("✅ Created 5 experiences");

  // 3. Create Education Section
  const educationSection = await prisma.cVSection.create({
    data: {
      cvId: cv.id,
      type: "education",
      icon: "GraduationCap",
      color: "#D5FF0A",
      layoutType: "list",
      order: 1,
      isActive: true,
      translations: {
        create: [
          { locale: "fr", title: "Formation" },
          { locale: "en", title: "Education" },
        ],
      },
    },
  });

  // Education 1: Master
  await prisma.cVItem.create({
    data: {
      sectionId: educationSection.id,
      startDate: new Date("2008-01-01"),
      isCurrent: false,
      order: 0,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Master Administration et Gestion des entreprises",
            subtitle: "Efficom",
            location: "Lille",
          },
          {
            locale: "en",
            title: "Master in Business Administration and Management",
            subtitle: "Efficom",
            location: "Lille",
          },
        ],
      },
    },
  });

  // Education 2: Licence
  await prisma.cVItem.create({
    data: {
      sectionId: educationSection.id,
      startDate: new Date("2007-01-01"),
      isCurrent: false,
      order: 1,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Licence AES (Administration Économique et Sociale)",
            subtitle: "Université de Limoges",
            location: "Limoges",
          },
          {
            locale: "en",
            title: "Bachelor in Economic and Social Administration",
            subtitle: "University of Limoges",
            location: "Limoges",
          },
        ],
      },
    },
  });

  console.log("✅ Created education");

  // 4. Create Interests Section
  const interestsSection = await prisma.cVSection.create({
    data: {
      cvId: cv.id,
      type: "custom",
      icon: "Heart",
      color: "#D5FF0A",
      layoutType: "list",
      order: 2,
      isActive: true,
      translations: {
        create: [
          { locale: "fr", title: "Intérêts" },
          { locale: "en", title: "Interests" },
        ],
      },
    },
  });

  await prisma.cVItem.create({
    data: {
      sectionId: interestsSection.id,
      order: 0,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Pilates, Naturopathie",
          },
          {
            locale: "en",
            title: "Pilates, Naturopathy",
          },
        ],
      },
    },
  });

  await prisma.cVItem.create({
    data: {
      sectionId: interestsSection.id,
      order: 1,
      isActive: true,
      translations: {
        create: [
          {
            locale: "fr",
            title: "Bénévolat",
            subtitle: "Humans for Women",
            description: "2019-2022",
          },
          {
            locale: "en",
            title: "Volunteering",
            subtitle: "Humans for Women",
            description: "2019-2022",
          },
        ],
      },
    },
  });

  console.log("✅ Created interests");

  // 5. Create Skills (Technical)
  const technicalSkills = [
    {
      nameFr: "Gestion du copyright",
      nameEn: "Copyright Management",
      level: 5,
    },
    { nameFr: "Gestion de budgets", nameEn: "Budget Management", level: 5 },
    { nameFr: "Production musicale", nameEn: "Music Production", level: 4 },
    { nameFr: "Rédaction de contrats", nameEn: "Contract Drafting", level: 5 },
    {
      nameFr: "Gestion de catalogues",
      nameEn: "Catalogue Management",
      level: 5,
    },
    {
      nameFr: "Dossiers de subvention",
      nameEn: "Grant Applications",
      level: 4,
    },
  ];

  for (const [index, skill] of technicalSkills.entries()) {
    await prisma.cVSkill.create({
      data: {
        cvId: cv.id,
        category: "technical",
        level: skill.level,
        showAsBar: true,
        order: index,
        isActive: true,
        translations: {
          create: [
            { locale: "fr", name: skill.nameFr },
            { locale: "en", name: skill.nameEn },
          ],
        },
      },
    });
  }

  console.log(`✅ Created ${String(technicalSkills.length)} technical skills`);

  // 6. Create Skills (Software)
  const softwareSkills = [
    "iCatalog",
    "iLicensing",
    "Easycuesheet",
    "Ze Publisher",
    "Movinmotion",
    "Vericast (BMAT)",
    "Pack Office",
  ];

  for (const [index, software] of softwareSkills.entries()) {
    await prisma.cVSkill.create({
      data: {
        cvId: cv.id,
        category: "software",
        level: 4,
        showAsBar: false,
        order: index + technicalSkills.length,
        isActive: true,
        translations: {
          create: [
            { locale: "fr", name: software },
            { locale: "en", name: software },
          ],
        },
      },
    });
  }

  console.log(`✅ Created ${String(softwareSkills.length)} software skills`);

  // 7. Create Skills (Languages)
  const languages = [
    { nameFr: "Français", nameEn: "French", level: 5 },
    { nameFr: "Anglais (B2)", nameEn: "English (B2)", level: 3 },
  ];

  for (const [index, lang] of languages.entries()) {
    await prisma.cVSkill.create({
      data: {
        cvId: cv.id,
        category: "language",
        level: lang.level,
        showAsBar: false,
        order: index + technicalSkills.length + softwareSkills.length,
        isActive: true,
        translations: {
          create: [
            { locale: "fr", name: lang.nameFr },
            { locale: "en", name: lang.nameEn },
          ],
        },
      },
    });
  }

  console.log(`✅ Created ${String(languages.length)} languages`);

  // 8. Create Social Links
  await prisma.cVSocialLink.createMany({
    data: [
      {
        cvId: cv.id,
        platform: "email",
        url: "mailto:caroline.senyk@gmail.com",
        label: "Email",
        order: 0,
      },
      {
        cvId: cv.id,
        platform: "phone",
        url: "tel:+33684181884",
        label: "Téléphone",
        order: 1,
      },
      {
        cvId: cv.id,
        platform: "linkedin",
        url: "https://linkedin.com/in/caroline-senyk",
        label: "LinkedIn",
        order: 2,
      },
    ],
  });

  console.log("✅ Created 3 social links");

  console.log("\n🎉 CV seed completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   - CV: 1`);
  console.log(`   - Sections: 3 (Experience, Education, Interests)`);
  console.log(`   - Experience items: 5`);
  console.log(`   - Education items: 2`);
  console.log(`   - Interest items: 2`);
  console.log(`   - Technical skills: ${String(technicalSkills.length)}`);
  console.log(`   - Software skills: ${String(softwareSkills.length)}`);
  console.log(`   - Languages: ${String(languages.length)}`);
  console.log(`   - Social links: 3`);
}

seedCV()
  .catch((e: unknown) => {
    console.error("❌ Error seeding CV:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
