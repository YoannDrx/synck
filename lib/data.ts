import type { Experiment, Metric, NavSection, Project, StudioRitual, TimelineEntry } from './types'

export const navSections: readonly NavSection[] = [
  { id: 'hero', label: 'Accueil' },
  { id: 'studio', label: 'Studio' },
  { id: 'expertises', label: 'Expertises' },
  { id: 'projects', label: 'Portfolio' },
  { id: 'experiments', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
] as const

export const metrics: Metric[] = [
  { label: 'Catalogue géré', value: '500+', detail: 'œuvres déclarées' },
  { label: 'Expérience', value: '10+ ans', detail: 'gestion de droits' },
  {
    label: 'Collaborations',
    value: '100+',
    detail: 'artistes accompagnés',
  },
]

export const studioRituals: StudioRitual[] = [
  {
    focus: "Droits d'auteur & Édition",
    headline: 'SÉCURISER VOS ŒUVRES',
    copy: "Déclaration SACEM, gestion des contrats de cession et d'édition musicale, suivi des répartitions et identification des œuvres non identifiées (ONI).",
  },
  {
    focus: 'Droits voisins & Production',
    headline: 'VALORISER VOS ENREGISTREMENTS',
    copy: "Gestion SCPP/SPPF, création de codes ISRC, contrats d'artiste-interprète, supervision des budgets de production et déclarations de rémunération équitable.",
  },
  {
    focus: 'Subventions & Financement',
    headline: 'FINANCER VOS PROJETS',
    copy: 'Constitution de dossiers CNM, SACEM, ADAMI, SPPF, SCPP - budgets prévisionnels, conformité aux conventions collectives et suivi administratif complet.',
  },
]

export const timelineEntries: TimelineEntry[] = [
  {
    year: '2021-Présent',
    role: 'Directrice Copyright & Administrative — PARIGO',
    summary:
      "Gestion complète des catalogues d'édition et de production phonographique. Supervision des budgets, déclarations SACEM/SCPP/SPPF, dossiers de subventions CNM.",
    locale: 'Paris',
    tags: ['Édition', 'Production', 'Gestion administrative'],
  },
  {
    year: '2019-2021',
    role: 'Copyright Manager — PARIGO',
    summary:
      "Administration du catalogue éditorial et phonographique. Déclarations d'œuvres, gestion des contrats, suivi des répartitions SACEM et droits voisins.",
    locale: 'Paris',
    tags: ['SACEM', 'SCPP', 'Contrats'],
  },
  {
    year: '2018-2019',
    role: 'Copyright Manager — GIN AGENCY',
    summary:
      "Gestion des droits d'auteur et voisins pour un catalogue de musique à l'image. Déclarations, ISRC, contrats de synchronisation.",
    locale: 'Paris',
    tags: ['Sync', 'Publishing', 'Droits voisins'],
  },
  {
    year: '2016-2018',
    role: 'Copyright Assistant — DISTRICT 6 FRANCE PUBLISHING',
    summary:
      'Assistance à la gestion éditoriale et administrative. Déclarations SACEM, création de contrats, suivi des budgets de production.',
    locale: 'Paris',
    tags: ['Édition', 'SACEM', 'Administration'],
  },
]

export const projectShowcase: Project[] = [
  {
    name: 'Pulse Bloom',
    subtitle: 'Immersive wellness corridors',
    description:
      'Fragments biometric data into bold brutalist panels and injects gradients that react to breathwork.',
    cycle: 'CYCLE 04',
    accent: 'from-emerald-400 via-lime-300 to-yellow-300',
    tags: ['Biofeedback', 'Sound design', 'Spatial UI'],
  },
  {
    name: 'Night Code Broadcast',
    subtitle: 'Live-stream scenography',
    description:
      'A tri-screen ritual made of jittery typography, analog scanners, and tactile MIDI gestures sent across oceans.',
    cycle: 'CYCLE 03',
    accent: 'from-purple-500 via-fuchsia-500 to-red-400',
    tags: ['Broadcast', 'AV', 'Latency'],
  },
  {
    name: 'Soft Garage',
    subtitle: 'Phygital showroom',
    description:
      'Concrete slabs split open to reveal chorusing LEDs and haptic flooring for future mobility reveals.',
    cycle: 'CYCLE 02',
    accent: 'from-slate-300 via-sky-400 to-cyan-200',
    tags: ['Automotive', 'XR', 'Install'],
  },
  {
    name: 'Garden of Fragments',
    subtitle: 'XR exhibition',
    description:
      'Visitors stitch their own avatars while walking through monolithic light pillars stitched with archive footage.',
    cycle: 'CYCLE 01',
    accent: 'from-orange-400 via-amber-300 to-lime-200',
    tags: ['XR', 'Archive', 'Curation'],
  },
]

export const experimentTracks: Experiment[] = [
  {
    title: 'Echo Dust',
    descriptor: 'sound-reactive mesh',
    status: 'LAB 05',
    palette: 'from-sky-500 via-indigo-500 to-blue-400',
  },
  {
    title: 'Velvet Static',
    descriptor: 'tactile streaming deck',
    status: 'LAB 06',
    palette: 'from-pink-500 via-rose-500 to-orange-400',
  },
  {
    title: 'Solar Loom',
    descriptor: 'kinetic typography loom',
    status: 'LAB 07',
    palette: 'from-yellow-400 via-lime-300 to-emerald-400',
  },
  {
    title: 'Glacier Chant',
    descriptor: 'AI-guided choir tool',
    status: 'LAB 08',
    palette: 'from-cyan-200 via-slate-200 to-white',
  },
]

export const pulses: string[] = [
  "Droits d'auteur SACEM",
  'Droits voisins SCPP/SPPF',
  "Contrats d'édition musicale",
  'Codes ISRC',
  'Dossiers CNM',
  'Budgets de production',
  'Rémunération équitable',
  'Conventions collectives',
  'iCatalog / iLicensing',
  'Œuvres non identifiées (ONI)',
]
