"use client";

import type { PointerEvent } from "react";
import { useState } from "react";
import { MetricCard } from "@/components/cards/metric-card";
import { Button } from "@/components/ui/button";

interface Metric {
  label: string;
  value: string;
  detail: string;
}

interface HeroSectionProps {
  metrics: Metric[];
}

export function HeroSection({ metrics }: HeroSectionProps) {
  const [glow, setGlow] = useState({ x: 45, y: 50 });

  const handleGlow = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setGlow({ x, y });
  };

  return (
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
              Caroline Senyk crafts militant yet sensual experiences for spaces
              that refuse to stay still—marrying brutal grids, cinematic light,
              and tactile code for brands, artists, and clubs orbiting the
              future.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[0.75rem] font-semibold uppercase tracking-[0.35em]">
            <Button asChild size="lg" className="rounded-full">
              <a href="#projects">Dive into work</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href="#contact">Book Caroline</a>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>

        <div className="relative flex flex-col gap-6 rounded-[28px] border-2 border-white/20 bg-white/5 p-6 text-sm backdrop-blur">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
            <span>Studio Status</span>
            <span>2025</span>
          </div>
          <p className="text-3xl font-semibold text-white">
            Designing sensory internet rituals and anti-slick live systems.
          </p>
          <div className="grid gap-4 text-xs uppercase tracking-[0.4em] text-white/60">
            <div className="flex justify-between border-b border-dashed border-white/15 pb-3">
              <span>Focus</span>
              <span className="text-white">spatial branding / live labs</span>
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
            <span className="font-bold text-white">SYNCK.OS</span>, Caroline&apos;s
            operating system for choreographing live and digital crowds in sync.
          </div>
        </div>
      </div>
    </section>
  );
}
