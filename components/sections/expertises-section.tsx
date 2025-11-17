"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { Locale } from "@/lib/i18n-config";
import type { HomeDictionary } from "@/types/dictionary";
import { Button } from "@/components/ui/button";

interface ExpertiseCard {
  id: string;
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  imgHome: string;
  description: string;
}

type ExpertisesSectionCopy = HomeDictionary["expertises"];

interface ExpertisesSectionProps {
  locale: Locale;
  copy: ExpertisesSectionCopy;
}

export function ExpertisesSection({ locale, copy }: ExpertisesSectionProps) {
  const [expertises, setExpertises] = useState<ExpertiseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpertises() {
      try {
        const response = await fetch(`/api/expertises?locale=${locale}&limit=3`);
        if (!response.ok) {
          throw new Error("Failed to fetch expertises");
        }
        const data = await response.json();
        setExpertises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchExpertises();
  }, [locale]);

  if (loading) {
    return (
      <section id="expertises" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/55">{copy.eyebrow}</p>
            <h2 className="text-4xl font-black">{copy.title}</h2>
          </div>
        </div>
        <div className="grid auto-rows-fr gap-6 md:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-[#08080f] p-8 animate-pulse"
            >
              <div className="mb-6 h-48 rounded-lg bg-white/5" />
              <div className="mb-4 h-8 w-3/4 rounded bg-white/5" />
              <div className="h-4 w-full rounded bg-white/5" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="expertises" className="space-y-8">
        <div className="py-12 text-center text-red-400">{copy.error}</div>
      </section>
    );
  }

  return (
    <section id="expertises" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">{copy.eyebrow}</p>
          <h2 className="text-4xl font-black">{copy.title}</h2>
        </div>
        <Button asChild variant="outline" className="inline-flex items-center gap-2 rounded-full">
          <Link href={`/${locale}/expertises`}>
            {copy.viewAll}
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="grid auto-rows-fr gap-6 md:grid-cols-3">
        {expertises.map((expertise, index) => (
          <Link
            key={expertise.id}
            href={expertise.href}
            className="group relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-[#08080f] transition-all hover:scale-[1.02] hover:border-white/30"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${expertise.imgHome})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent" />
            </div>

            <div className="space-y-4 p-8">
              <div className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-wider text-white/70">
                0{index + 1}
              </div>

              <h3 className="text-2xl font-black leading-tight transition-all group-hover:bg-gradient-to-r group-hover:from-lime-300 group-hover:to-fuchsia-400 group-hover:bg-clip-text group-hover:text-transparent">
                {expertise.title}
              </h3>

              <p className="text-sm leading-relaxed text-white/70">{expertise.description}</p>

              <div className="flex items-center gap-2 text-sm font-bold text-white/90 transition-colors group-hover:text-lime-300">
                {copy.cardCta}
                <span className="transform transition-transform group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
