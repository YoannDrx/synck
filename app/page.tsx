"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

const navSections = [
  { id: "hero", label: "Manifesto" },
  { id: "studio", label: "Studio" },
  { id: "projects", label: "Work" },
  { id: "experiments", label: "Playground" },
  { id: "contact", label: "Contact" },
] as const;

const metrics = [
  { label: "Installations", value: "38", detail: "cities + virtual venues" },
  { label: "Latency", value: "< 50ms", detail: "live co-presence" },
  { label: "Collaborations", value: "17", detail: "artists / labs / brands" },
];

const studioRituals = [
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

const timelineEntries = [
  {
    year: "2025",
    role: "Frequency Haus — Metaverse scenographer",
    summary: "Directed a multi-sensory opera with volumetric performers stitched to live motion capture.",
    locale: "Berlin",
    tags: ["Spatial web", "Motion capture"],
  },
  {
    year: "2024",
    role: "Echo Swim — Experiential retail residency",
    summary: "Designed brutalist pods translating biometrics into responsive couture fittings.",
    locale: "Tokyo",
    tags: ["Retail", "Biometrics"],
  },
  {
    year: "2023",
    role: "Solar Bloom — Touring installation",
    summary: "Brought a traveling light organ to 9 cities with choreography driven by crowd resonance.",
    locale: "Global",
    tags: ["Light art", "Kinetic"],
  },
];

const projectShowcase = [
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

const experimentTracks = [
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

const pulses = [
  "Immersive Opera",
  "Phygital Couture",
  "Spatial Branding",
  "Live Broadcast",
  "Speculative Strategy",
  "AI Companions",
  "Light Organs",
];

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(navSections[0].id);
  const [glow, setGlow] = useState({ x: 45, y: 50 });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? (scrollTop / height) * 100 : 0;
      setProgress(ratio);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        threshold: 0.4,
        rootMargin: "-10% 0px -20% 0px",
      },
    );

    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleGlow = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlow({ x, y });
  };

  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <div className="fixed left-0 top-0 z-30 h-1 w-full bg-white/10">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-lime-300 via-fuchsia-400 to-sky-400 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="relative z-10 px-4 pb-20 pt-16 sm:px-8 lg:px-16">
        <div className="mb-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-white/55 lg:hidden">
          {navSections.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`rounded-full border px-4 py-2 transition-all ${
                activeSection === link.id
                  ? "border-lime-300 text-lime-200"
                  : "border-white/20 text-white/60"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px,minmax(0,1fr)] xl:grid-cols-[260px,minmax(0,1fr)]">
          <nav className="sticky top-28 hidden flex-col gap-4 lg:flex">
            <div className="text-xs uppercase tracking-[0.4em] text-white/45">
              Navigate SYNCK
            </div>
            {navSections.map((link, index) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`relative flex items-center gap-3 rounded-2xl border border-white/15 px-5 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.35em] transition-all ${
                  activeSection === link.id
                    ? "border-lime-300 text-white"
                    : "text-white/45"
                }`}
              >
                <span className="text-white/35">{`0${index + 1}`}</span>
                <span>{link.label}</span>
                <span
                  className={`ml-auto h-[2px] w-8 origin-left bg-lime-300 transition ${
                    activeSection === link.id
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0"
                  }`}
                />
              </a>
            ))}
          </nav>

          <div className="space-y-24">
            <section
              id="hero"
              className="relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-[#08080d] px-6 py-12 shadow-[0_25px_80px_rgba(0,0,0,0.6)] sm:px-10"
              onPointerMove={handleGlow}
            >
              <div
                className="absolute inset-0 opacity-80 transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(213,255,10,0.3), transparent 45%), radial-gradient(circle at 90% 10%, rgba(255,75,162,0.25), transparent 45%)`,
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05),transparent_65%)]" />
              <div className="absolute -left-32 top-6 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-[140px]" />
              <div className="absolute bottom-0 right-10 h-40 w-40 rounded-full bg-lime-300/30 blur-[120px]" />

              <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/70">
                    <span className="h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(213,255,10,0.9)]" />
                    <span>Caroline Senyk</span>
                    <span>Portfolio</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm uppercase tracking-[0.6em] text-white/50">
                      Neo-brutalist direction studio
                    </p>
                    <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                      SYNCK
                    </h1>
                    <p className="max-w-2xl text-lg text-white/80">
                      Caroline Senyk crafts militant yet sensual experiences for
                      spaces that refuse to stay still—marrying brutal grids,
                      cinematic light, and tactile code for brands, artists, and
                      clubs orbiting the future.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[0.75rem] font-semibold uppercase tracking-[0.35em]">
                    <a
                      href="#projects"
                      className="rounded-full border-2 border-white bg-white px-6 py-3 text-black transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,255,255,0.25)]"
                    >
                      Dive into work
                    </a>
                    <a
                      href="#contact"
                      className="rounded-full border-2 border-white/40 px-6 py-3 text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Book Caroline
                    </a>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-white/20 bg-black/30 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                          {metric.label}
                        </p>
                        <p className="pt-2 text-3xl font-black text-lime-200">
                          {metric.value}
                        </p>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                          {metric.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative flex flex-col gap-6 rounded-[28px] border-2 border-white/20 bg-white/5 p-6 text-sm backdrop-blur">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
                    <span>Studio Status</span>
                    <span>2025</span>
                  </div>
                  <p className="text-3xl font-semibold text-white">
                    Designing sensory internet rituals and anti-slick live
                    systems.
                  </p>
                  <div className="grid gap-4 text-xs uppercase tracking-[0.4em] text-white/60">
                    <div className="flex justify-between border-b border-dashed border-white/15 pb-3">
                      <span>Focus</span>
                      <span className="text-white">
                        spatial branding / live labs
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-white/15 pb-3">
                      <span>Toolchain</span>
                      <span className="text-white">
                        touchdesigner × unreal × custom controllers
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy</span>
                      <span className="text-lime-200">electric calm</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/40 p-4 text-xs uppercase tracking-[0.5em] text-white/70">
                    Currently developing{" "}
                    <span className="font-bold text-white">SYNCK.OS</span>,
                    Caroline&apos;s operating system for choreographing live and
                    digital crowds in sync.
                  </div>
                </div>
              </div>
            </section>

            <div className="overflow-hidden rounded-full border-2 border-white/20 bg-white/5 py-4">
              <div
                className="flex w-max items-center gap-8 px-6 text-xs font-black uppercase tracking-[0.6em]"
                style={{ animation: "marquee 28s linear infinite" }}
              >
                {[0, 1].map((loop) =>
                  pulses.map((pulse) => (
                    <span key={`${loop}-${pulse}`} className="flex items-center gap-4">
                      <span className="h-2 w-2 rounded-full bg-lime-300" />
                      <span>{pulse}</span>
                    </span>
                  )),
                )}
              </div>
            </div>

            <section
              id="studio"
              className="rounded-[32px] border-4 border-white/15 bg-[#0c0b12]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.6)] sm:p-10"
            >
              <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-6">
                  <div className="text-xs uppercase tracking-[0.5em] text-white/55">
                    Studio Rituals
                  </div>
                  <div className="space-y-5">
                    {studioRituals.map((ritual) => (
                      <div
                        key={ritual.headline}
                        className="rounded-3xl border-2 border-white/15 bg-gradient-to-br from-[#101018] via-[#0a0a12] to-[#050508] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                      >
                        <p className="text-xs uppercase tracking-[0.4em] text-lime-200">
                          {ritual.focus}
                        </p>
                        <p className="py-3 text-2xl font-semibold">
                          {ritual.headline}
                        </p>
                        <p className="text-sm text-white/70">{ritual.copy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border-2 border-white/15 bg-white/5 p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
                    <span>Timeline</span>
                    <span>Selected</span>
                  </div>
                  <div className="mt-6 divide-y divide-white/15">
                    {timelineEntries.map((entry) => (
                      <div
                        key={entry.year}
                        className="flex flex-col gap-3 py-5 text-sm text-white/70"
                      >
                        <div className="flex flex-wrap items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
                          <span>{entry.year}</span>
                          <span>{entry.locale}</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {entry.role}
                        </p>
                        <p>{entry.summary}</p>
                        <div className="flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/20 px-3 py-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section id="projects" className="space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-white/55">
                    Selected Work
                  </p>
                  <h2 className="text-4xl font-black">Commissions & Systems</h2>
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:border-lime-300 hover:text-lime-200"
                >
                  Collaborate
                  <span aria-hidden>↗</span>
                </a>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {projectShowcase.map((project) => (
                  <div
                    key={project.name}
                    className="group relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-2 hover:border-lime-300/70"
                  >
                    <div
                      className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-70 bg-gradient-to-br ${project.accent}`}
                    />
                    <div className="relative z-10 flex h-full flex-col gap-6">
                      <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
                        <span>{project.subtitle}</span>
                        <span>{project.cycle}</span>
                      </div>
                      <h3 className="text-3xl font-bold">{project.name}</h3>
                      <p className="text-sm text-white/75">
                        {project.description}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/70">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/30 px-3 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="experiments"
              className="rounded-[32px] border-4 border-white/15 bg-[#08080f] p-6 sm:p-10"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-white/55">
                    Playground
                  </p>
                  <h2 className="text-3xl font-black">Research Lab</h2>
                </div>
                <p className="max-w-lg text-sm text-white/70">
                  Scroll horizontally to explore ongoing experiments crafted at
                  SYNCK Lab—each tile loops subtle motion and light algorithms
                  on site.
                </p>
              </div>

              <div className="mt-8 flex gap-6 overflow-x-auto pb-4 text-white/90 snap-x snap-mandatory">
                {experimentTracks.map((experiment) => (
                  <div
                    key={experiment.title}
                    className={`relative min-w-[260px] snap-center overflow-hidden rounded-3xl border-2 border-white/25 bg-gradient-to-br ${experiment.palette} p-5 text-black shadow-[0_20px_60px_rgba(0,0,0,0.45)]`}
                  >
                    <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                      <div className="h-full w-full bg-[radial-gradient(circle,_rgba(255,255,255,0.5),_transparent_60%)]" />
                    </div>
                    <div className="relative z-10 flex h-full flex-col gap-4">
                      <div className="text-xs uppercase tracking-[0.4em] text-black/70">
                        {experiment.status}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">
                        {experiment.title}
                      </h3>
                      <p className="text-sm uppercase tracking-[0.4em]">
                        {experiment.descriptor}
                      </p>
                      <div className="mt-auto text-xs uppercase tracking-[0.4em] text-black/70">
                        Scroll to engage
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="contact"
              className="relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-gradient-to-br from-[#151515] via-[#0b0b0f] to-[#1a021d] p-6 sm:p-10"
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute left-10 top-6 h-52 w-52 rounded-full bg-lime-300/30 blur-[120px]"
                  style={{ animation: "glowOrbit 18s ease-in-out infinite" }}
                />
                <div
                  className="absolute right-20 bottom-10 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-[120px]"
                  style={{ animation: "glowOrbit 22s ease-in-out infinite" }}
                />
              </div>

              <div className="relative z-10 grid gap-10 md:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-[0.5em] text-white/55">
                    Contact
                  </p>
                  <h2 className="text-4xl font-black">
                    Let&apos;s sync the impossible.
                  </h2>
                  <p className="max-w-2xl text-sm text-white/75">
                    Caroline is currently accepting commissions for residencies,
                    touring installations, speculative launches, and cinematic
                    live streams. Remote and on-site collaborations available.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.4em]">
                    <a
                      href="mailto:hello@synck.studio"
                      className="rounded-full border-2 border-lime-300 bg-lime-200 px-6 py-3 text-black transition hover:-translate-y-1"
                    >
                      Write to Caroline
                    </a>
                    <a
                      href="#projects"
                      className="rounded-full border-2 border-white/30 px-6 py-3 text-white transition hover:border-fuchsia-400 hover:text-fuchsia-200"
                    >
                      View dossier
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 text-sm">
                  <div className="rounded-2xl border border-white/20 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                      Studio Nodes
                    </p>
                    <p className="text-lg font-semibold text-white">
                      Paris / Montréal / Remote
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                      Upcoming Windows
                    </p>
                    <p className="text-lg font-semibold text-white">
                      Q2 residencies & festival commissions
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                      Signals
                    </p>
                    <p className="text-lg font-semibold text-white">
                      IG: @synck.studio — Signal: synck
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <footer className="flex flex-col gap-4 text-xs uppercase tracking-[0.4em] text-white/50">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <p>SYNCK © {year} — Caroline Senyk keeps the brutal glow alive.</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
