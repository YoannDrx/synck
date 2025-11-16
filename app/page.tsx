"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/layout/progress-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavigationBar } from "@/components/layout/navigation-bar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { StudioSection } from "@/components/sections/studio-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperimentsSection } from "@/components/sections/experiments-section";
import { ContactSection } from "@/components/sections/contact-section";
import { MarqueeText } from "@/components/marquee-text";
import { navSections, metrics, studioRituals, timelineEntries, projectShowcase, experimentTracks, pulses } from "@/lib/data";

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(navSections[0].id);

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

    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <ProgressBar progress={progress} />

      {/* Main container with max-width and centering */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16 overflow-visible">
        <MobileNav sections={navSections} activeSection={activeSection} />

        <div className="grid gap-10 lg:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr]">
          <NavigationBar sections={navSections} activeSection={activeSection} />

          <div className="space-y-24 min-w-0">
            <HeroSection metrics={metrics} />

            <MarqueeText items={pulses} />

            <StudioSection rituals={studioRituals} timeline={timelineEntries} />

            <ProjectsSection projects={projectShowcase} />

            <ExperimentsSection experiments={experimentTracks} />

            <ContactSection />

            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
