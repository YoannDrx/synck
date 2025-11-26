"use client";

import { useEffect, useState } from "react";

import type { HomeDictionary, LayoutDictionary } from "@/types/dictionary";
import type { Locale } from "@/lib/i18n-config";
import { ProgressBar } from "@/components/layout/progress-bar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { StudioSection } from "@/components/sections/studio-section";
import { ExpertisesSection } from "@/components/sections/expertises-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ArtistsSection } from "@/components/sections/artists-section";
import { ContactSection } from "@/components/sections/contact-section";
import { InfiniteMarquee } from "@/components/infinite-marquee";

type HomePageProps = {
  locale: Locale;
  layout: LayoutDictionary;
  home: HomeDictionary;
};

export function HomePage({ locale, layout, home }: HomePageProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? (scrollTop / height) * 100 : 0;
      setProgress(ratio);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <ProgressBar progress={progress} />

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-10 sm:pt-16 sm:px-8 lg:px-16 overflow-visible">
        <div className="space-y-18 min-w-0">
          <HeroSection metrics={home.metrics} hero={home.hero} />

          <InfiniteMarquee items={home.pulses} />

          <StudioSection
            rituals={home.studio.rituals}
            timeline={home.studio.timeline}
            eyebrow={home.studio.eyebrow}
            timelineTitle={home.studio.timelineTitle}
            timelineStatus={home.studio.timelineStatus}
          />

          <ExpertisesSection locale={locale} copy={home.expertises} />

          <ProjectsSection locale={locale} copy={home.projects} />

          <ArtistsSection locale={locale} copy={home.artists} />

          <ContactSection copy={home.contactSection} />

          <Footer text={layout.footer} />
        </div>
      </main>
    </div>
  );
}
