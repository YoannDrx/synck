import type {
  NavSection,
  Metric,
  StudioRitual,
  TimelineEntry,
  Project,
  Experiment,
} from "./types";

export const navSections: readonly NavSection[] = [
  { id: "hero", label: "Manifesto" },
  { id: "studio", label: "Studio" },
  { id: "projects", label: "Work" },
  { id: "experiments", label: "Playground" },
  { id: "contact", label: "Contact" },
] as const;

export const metrics: Metric[] = [
  { label: "Installations", value: "38", detail: "cities + virtual venues" },
  { label: "Latency", value: "< 50ms", detail: "live co-presence" },
  {
    label: "Collaborations",
    value: "17",
    detail: "artists / labs / brands",
  },
];

export const studioRituals: StudioRitual[] = [
  {
    focus: "Creative Direction",
    headline: "SYNTHESIZE CHAOS",
    copy: "Brutalist grid systems meet couture motion to build rituals for the phygital stage.",
  },
  {
    focus: "Spatial Systems",
    headline: "ORCHESTRATE CO-PRESENCE",
    copy: "Adaptive rooms respond to pulse data, breathing light and sonic cues into every surface.",
  },
  {
    focus: "Immersive Tech",
    headline: "PROTOTYPE WITH FEEDBACK",
    copy: "Every build ships with touchable prototypes, tactile controllers, and cinematic docs.",
  },
];

export const timelineEntries: TimelineEntry[] = [
  {
    year: "2025",
    role: "Frequency Haus — Metaverse scenographer",
    summary:
      "Directed a multi-sensory opera with volumetric performers stitched to live motion capture.",
    locale: "Berlin",
    tags: ["Spatial web", "Motion capture"],
  },
  {
    year: "2024",
    role: "Echo Swim — Experiential retail residency",
    summary:
      "Designed brutalist pods translating biometrics into responsive couture fittings.",
    locale: "Tokyo",
    tags: ["Retail", "Biometrics"],
  },
  {
    year: "2023",
    role: "Solar Bloom — Touring installation",
    summary:
      "Brought a traveling light organ to 9 cities with choreography driven by crowd resonance.",
    locale: "Global",
    tags: ["Light art", "Kinetic"],
  },
];

export const projectShowcase: Project[] = [
  {
    name: "Pulse Bloom",
    subtitle: "Immersive wellness corridors",
    description:
      "Fragments biometric data into bold brutalist panels and injects gradients that react to breathwork.",
    cycle: "CYCLE 04",
    accent: "from-emerald-400 via-lime-300 to-yellow-300",
    tags: ["Biofeedback", "Sound design", "Spatial UI"],
  },
  {
    name: "Night Code Broadcast",
    subtitle: "Live-stream scenography",
    description:
      "A tri-screen ritual made of jittery typography, analog scanners, and tactile MIDI gestures sent across oceans.",
    cycle: "CYCLE 03",
    accent: "from-purple-500 via-fuchsia-500 to-red-400",
    tags: ["Broadcast", "AV", "Latency"],
  },
  {
    name: "Soft Garage",
    subtitle: "Phygital showroom",
    description:
      "Concrete slabs split open to reveal chorusing LEDs and haptic flooring for future mobility reveals.",
    cycle: "CYCLE 02",
    accent: "from-slate-300 via-sky-400 to-cyan-200",
    tags: ["Automotive", "XR", "Install"],
  },
  {
    name: "Garden of Fragments",
    subtitle: "XR exhibition",
    description:
      "Visitors stitch their own avatars while walking through monolithic light pillars stitched with archive footage.",
    cycle: "CYCLE 01",
    accent: "from-orange-400 via-amber-300 to-lime-200",
    tags: ["XR", "Archive", "Curation"],
  },
];

export const experimentTracks: Experiment[] = [
  {
    title: "Echo Dust",
    descriptor: "sound-reactive mesh",
    status: "LAB 05",
    palette: "from-sky-500 via-indigo-500 to-blue-400",
  },
  {
    title: "Velvet Static",
    descriptor: "tactile streaming deck",
    status: "LAB 06",
    palette: "from-pink-500 via-rose-500 to-orange-400",
  },
  {
    title: "Solar Loom",
    descriptor: "kinetic typography loom",
    status: "LAB 07",
    palette: "from-yellow-400 via-lime-300 to-emerald-400",
  },
  {
    title: "Glacier Chant",
    descriptor: "AI-guided choir tool",
    status: "LAB 08",
    palette: "from-cyan-200 via-slate-200 to-white",
  },
];

export const pulses: string[] = [
  "Immersive Opera",
  "Phygital Couture",
  "Spatial Branding",
  "Live Broadcast",
  "Speculative Strategy",
  "AI Companions",
  "Light Organs",
];
