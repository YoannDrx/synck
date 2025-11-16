"use client";

import { useEffect, useState } from "react";

import type { HomeDictionary, LayoutDictionary } from "@/types/dictionary";
import type { Locale } from "@/lib/i18n-config";
import { ProgressBar } from "@/components/layout/progress-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavigationBar } from "@/components/layout/navigation-bar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { StudioSection } from "@/components/sections/studio-section";
import { ExpertisesSection } from "@/components/sections/expertises-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ArtistsSection } from "@/components/sections/artists-section";
import { ExperimentsSection } from "@/components/sections/experiments-section";
import { ContactSection } from "@/components/sections/contact-section";
import { MarqueeText } from "@/components/marquee-text";

interface HomePageProps {
  locale: Locale;
  layout: LayoutDictionary;
  home: HomeDictionary;
}

export function HomePage({ locale, layout, home }: HomePageProps) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(home.navSections[0]?.id ?? "hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
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
      }
    );

    home.navSections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [home.navSections]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <ProgressBar progress={progress} />

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16 overflow-visible">
        <MobileNav sections={home.navSections} activeSection={activeSection} />

        <div className="grid gap-10 lg:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr]">
          <NavigationBar
            sections={home.navSections}
            activeSection={activeSection}
            title={layout.navigationTitle}
          />

          <div className="space-y-24 min-w-0">
            <HeroSection metrics={home.metrics} hero={home.hero} />

            <MarqueeText items={home.pulses} />

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

            <ExperimentsSection locale={locale} copy={home.experiments} />

            <ContactSection copy={home.contactSection} />

            <Footer text={layout.footer} />
          </div>
        </div>
      </main>
    </div>
  );
}
