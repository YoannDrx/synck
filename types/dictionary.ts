import type { NavSection, Metric, StudioRitual, TimelineEntry } from "@/lib/types";

export interface LanguageSwitchDictionary {
  label: string;
  fr: string;
  en: string;
}

export interface HomeHeroDictionary {
  eyebrow: string[];
  role: string;
  description: string;
  ctas: {
    projets: string;
    contact: string;
    downloadCv: string;
  };
  status: {
    title: string;
    year: string;
    headline: string;
    expertiseLabel: string;
    expertiseValue: string;
    organizationsLabel: string;
    organizationsValue: string;
    availabilityLabel: string;
    availabilityValue: string;
    servicesLabel: string;
    servicesValue: string;
  };
}

export interface HomeDictionary {
  navSections: NavSection[];
  hero: HomeHeroDictionary;
  metrics: Metric[];
  pulses: string[];
  studio: {
    eyebrow: string;
    timelineTitle: string;
    timelineStatus: string;
    rituals: StudioRitual[];
    timeline: TimelineEntry[];
  };
  expertises: {
    eyebrow: string;
    title: string;
    viewAll: string;
    cardCta: string;
    error: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    viewAll: string;
    cardWorkLabel: string;
    error: string;
  };
  artists: {
    eyebrow: string;
    title: string;
    viewAll: string;
    worksSingular: string;
    worksPlural: string;
    error: string;
  };
  experiments: {
    eyebrow: string;
    title: string;
    viewAll: string;
    error: string;
  };
  contactSection: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
    infoCards: {
      label: string;
      content: string;
      href?: string;
    }[];
  };
}

export interface BlogDictionary {
  description: string;
  filters: {
    categoryLabel: string;
    tagLabel: string;
    yearLabel: string;
    searchLabel: string;
    searchPlaceholder: string;
    allCategories: string;
    allTags: string;
    allYears: string;
    apply: string;
    reset: string;
  };
  empty: string;
  pagination: {
    pageLabel: string;
    previous: string;
    next: string;
  };
  cta: {
    title: string;
    description: string;
    button: string;
  };
  error: string;
}

export interface BlogDetailDictionary {
  back: string;
  notFoundTitle: string;
  notFoundDescription: string;
}

export interface ExpertisesPageDictionary {
  description: string;
  cardCta: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
  error: string;
}

export interface ExpertiseDetailDictionary {
  labelsTitle: string;
  documentaries: {
    title: string;
    filterAll: string;
    searchPlaceholder: string;
    empty: string;
    noResults: string;
  };
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

export interface ProjetsPageDictionary {
  description: string;
  filterAll: string;
  searchPlaceholder: string;
  loading: string;
  empty: string;
  noResults: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

export interface ProjetDetailDictionary {
  artistsTitle: string;
  infoTitle: string;
  releaseDate: string;
  category: string;
  genre: string;
  label: string;
  isrc: string;
  externalResourcesTitle: string;
  externalResourcesDescription: string;
  externalResourcesButton: string;
  galleryTitle: string;
  spotifyTitle: string;
  previousLabel: string;
  nextLabel: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

export interface ArtistsPageDictionary {
  description: string;
  worksSingular: string;
  worksPlural: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

export interface ArtistDetailDictionary {
  worksTitle: string;
  worksSingular: string;
  worksPlural: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
}

export interface ContactPageDictionary {
  heroDescription: string;
  introTitle: string;
  introDescription: string;
  contactInfoTitle: string;
  emailLabel: string;
  emailValue: string;
  locationLabel: string;
  locationValue: string;
  linkedinLabel: string;
  linkedinCta: string;
  linkedinUrl: string;
  availabilityLabel: string;
  availabilityValue: string;
  servicesTitle: string;
  services: {
    title: string;
    description: string;
  }[];
  consultationTitle: string;
  consultationDescription: string;
}

export interface ContactFormDictionary {
  fields: {
    name: {
      label: string;
      placeholder: string;
    };
    email: {
      label: string;
      placeholder: string;
    };
    subject: {
      label: string;
      placeholder: string;
    };
    message: {
      label: string;
      placeholder: string;
    };
  };
  submit: {
    idle: string;
    loading: string;
  };
  success: string;
  error: string;
}

export interface LayoutMenuDictionary {
  open: string;
  close: string;
}

export interface LayoutDictionary {
  navigationTitle: string;
  language: LanguageSwitchDictionary;
  footer: string;
  menu: LayoutMenuDictionary;
}

export interface AuthDictionary {
  login: {
    title: string;
    description: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    submitting: string;
    error: string;
    invalidCredentials: string;
    accountDisabled: string;
  };
  invitation: {
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    submitButton: string;
    submitting: string;
    success: string;
    errorInvalid: string;
    errorExpired: string;
    errorPasswordMismatch: string;
  };
}

export interface AdminDictionary {
  nav: {
    dashboard: string;
    albums: string;
    composers: string;
    expertises: string;
    categories: string;
    labels: string;
    invitations: string;
    logout: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    stats: {
      totalWorks: string;
      totalComposers: string;
      totalExpertises: string;
      activeCategories: string;
    };
    recentChanges: string;
    quickActions: {
      title: string;
      newWork: string;
      newComposer: string;
      newExpertise: string;
      inviteAdmin: string;
    };
  };
  common: {
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    deleting: string;
    edit: string;
    create: string;
    creating: string;
    search: string;
    filter: string;
    reset: string;
    active: string;
    inactive: string;
    actions: string;
    confirmDelete: string;
    deleteSuccess: string;
    saveSuccess: string;
    error: string;
    required: string;
    uploadImage: string;
    uploadingImage: string;
    changeImage: string;
    removeImage: string;
  };
  projects: {
    title: string;
    createNew: string;
    editTitle: string;
    fields: {
      titleLabel: string;
      descriptionLabel: string;
      categoryLabel: string;
      labelLabel: string;
      year: string;
      duration: string;
      genre: string;
      isrc: string;
      spotifyUrl: string;
      coverImage: string;
      gallery: string;
      contributors: string;
      addContributor: string;
      contributorRole: string;
    };
    filters: {
      category: string;
      label: string;
      year: string;
      status: string;
    };
  };
  composers: {
    title: string;
    createNew: string;
    editTitle: string;
    fields: {
      nameLabel: string;
      bioLabel: string;
      imageLabel: string;
      externalUrl: string;
    };
  };
  expertises: {
    title: string;
    createNew: string;
    editTitle: string;
    fields: {
      titleLabel: string;
      subtitleLabel: string;
      descriptionLabel: string;
      contentLabel: string;
      coverImage: string;
    };
  };
  invitations: {
    title: string;
    sendNew: string;
    emailLabel: string;
    emailPlaceholder: string;
    roleLabel: string;
    sendButton: string;
    sending: string;
    sent: string;
    pending: string;
    accepted: string;
    expired: string;
    expiresAt: string;
    status: string;
  };
}

export interface Dictionary {
  nav: {
    home: string;
    expertises: string;
    projets: string;
    blog: string;
    contact: string;
    artists: string;
  };
  cta: {
    viewMore: string;
    readMore: string;
    contact: string;
    viewProject: string;
    viewAll: string;
  };
  layout: LayoutDictionary;
  contactForm: ContactFormDictionary;
  home: HomeDictionary;
  blog: BlogDictionary;
  blogDetail: BlogDetailDictionary;
  expertisesPage: ExpertisesPageDictionary;
  expertiseDetail: ExpertiseDetailDictionary;
  projetsPage: ProjetsPageDictionary;
  projetDetail: ProjetDetailDictionary;
  artistsPage: ArtistsPageDictionary;
  artistDetail: ArtistDetailDictionary;
  contactPage: ContactPageDictionary;
  auth: AuthDictionary;
  admin: AdminDictionary;
}
