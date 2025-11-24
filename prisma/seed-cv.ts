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

  const theme = {
    primary: "#D5FF0A",
    secondary: "#9EF01A",
    header: "#0B0C12",
    sidebar: "#F4F5F7",
    surface: "#FFFFFF",
    text: "#0D0E11",
    muted: "#60626A",
    border: "#E2E4EA",
    badge: "#0F1118",
  };

  const photoAsset = await prisma.asset.upsert({
    where: {
      path: "/uploads/1763895080486-f67266ab-06cf-4957-a198-12af535eac0f-caro-avatar.jpeg",
    },
    update: {},
    create: {
      path: "/uploads/1763895080486-f67266ab-06cf-4957-a198-12af535eac0f-caro-avatar.jpeg",
      alt: "Portrait de Caroline Senyk",
      width: 800,
      height: 800,
      aspectRatio: 1,
    },
  });

  // 1. Create the CV
  const cv = await prisma.cV.create({
    data: {
      photoAssetId: photoAsset.id,
      phone: "06 84 18 18 84",
      email: "caroline.senyk@gmail.com",
      location: "75020 Paris",
      linkedInUrl: "https://linkedin.com/in/caroline-senyk",
      headlineFr: "Gestionnaire de droits musicaux",
      headlineEn: "Music Rights Manager",
      bioFr: `Gestionnaire de droits musicaux, j'accompagne les artistes dans l'émergence de leurs projets, du dépôt des œuvres à la production originale. Je cherche aujourd'hui un poste qui mêle rigueur juridique, pilotage de production et développement artistique.`,
      bioEn: `Music rights manager supporting artists from registrations to original production. I am looking for a role that blends copyright rigor with production leadership and artist development.`,
      layout: "creative",
      accentColor: theme.primary,
      showPhoto: true,
      theme,
    },
  });

  console.log("✅ Created CV");

  // 2. Create Experiences Section
  const experienceSection = await prisma.cVSection.create({
    data: {
      cvId: cv.id,
      type: "experience",
      icon: "Briefcase",
      color: theme.primary,
      placement: "main",
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
            description:
              "Dépôts Harvest France/International et contrôle des fichiers de répartition; relations directes avec les organismes de gestion collective. Budget, facturation clients/fournisseurs, calculs de royalties et coordination comptable. Pilotage RH (paie, titres-resto, mutuelle) et support CEO pour recrutements et rendez-vous clefs.",
          },
          {
            locale: "en",
            title: "Copyright & Administrative Director",
            subtitle: "PARIGO",
            location: "Paris",
            description:
              "Harvest deposits for domestic and international catalogs; audit of distribution files and liaison with CMOs. Budget ownership, client/supplier invoicing, royalty statements and accounting coordination. HR coordination (payroll, meal vouchers, health insurance) and CEO support for recruiting and key meetings.",
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
            description:
              "Construction des budgets de production (studio, cachets, mix/master, visuels, clips) et programmation artistique. Déclarations légales, dépôts SCPP/SDRM/Vericast et suivi subventions. Gestion contrats d’édition/sous-édition, metadata et coordination attaché·es de presse et envois promo.",
          },
          {
            locale: "en",
            title: "Copyright & Production Manager",
            subtitle: "PARIGO",
            location: "Paris",
            description:
              "Built production budgets (studio, artist fees, mix/master, artwork, video) and artistic schedules. Legal filings, SCPP/SDRM/Vericast deposits and grant monitoring. Managed publishing and sub-publishing contracts, metadata, press coordination and promotional shipments.",
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
            description:
              "Préparation et archivage comptable/fiscal, suivi factures et créances. Montage de dossiers de subvention et dépôts d’œuvres/programmes publicitaires SACEM/SCPP. Administration des contrats de gestion (13Prods, Via Découvertes Films, Little Big Story).",
          },
          {
            locale: "en",
            title: "Copyright & Administration Assistant",
            subtitle: "PARIGO",
            location: "Paris",
            description:
              "Prepared and filed accounting/tax documents, managed invoices and receivables. Built grant files and handled SACEM/SCPP deposits for works and advertising programs. Administered management contracts (13Prods, Via Découvertes Films, Little Big Story).",
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
            description:
              "Organisation des tournées pour Feder, Cristobal and the Sea et Ginkgoa : plannings, routing, logistique transports/hébergement. Création des feuilles de route, merchandising et suivi ventes, coordination booking. Relecture contrats, community management, relations presse et suivi budgétaire par tournée.",
          },
          {
            locale: "en",
            title: "Artist Management Assistant",
            subtitle: "GIN AGENCY",
            location: "Paris",
            description:
              "Tour management for Feder, Cristobal and the Sea and Ginkgoa: schedules, routing and travel/accommodation logistics. Built road books, handled merchandising and sales tracking, liaised with booking agencies. Reviewed artist contracts, managed communities and press, and tracked tour budgets.",
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
            description:
              "Rédaction des contrats de cession et dépôts SACEM. Gestion de l’exploitation catalogue et des droits voisins. Mise en ligne des supports de communication, suivi des œuvres/publicités non identifiées et création de dossiers de subvention. Inscription des artistes aux sociétés de gestion (SACEM, ADAMI, SPEDIDAM).",
          },
          {
            locale: "en",
            title: "Music Publishing Assistant",
            subtitle: "DISTRICT 6 FRANCE PUBLISHING",
            location: "Paris",
            description:
              "Drafted assignment contracts and handled SACEM deposits. Managed catalogue exploitation and neighboring rights. Published communication assets, tracked unidentified works/ads, prepared grant files and registered artists with CMOs (SACEM, ADAMI, SPEDIDAM).",
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
      color: theme.secondary,
      placement: "sidebar",
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
      color: theme.secondary,
      placement: "sidebar",
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
