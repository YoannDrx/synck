"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n-config";
import type { HomeDictionary } from "@/types/dictionary";
import { Button } from "@/components/ui/button";

interface GalleryComposer {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
  externalUrl?: string;
  worksCount: number;
}

type ArtistsCopy = HomeDictionary["artists"];

interface ArtistsSectionProps {
  locale: Locale;
  copy: ArtistsCopy;
}

export function ArtistsSection({ locale, copy }: ArtistsSectionProps) {
  const [composers, setComposers] = useState<GalleryComposer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComposers() {
      try {
        const response = await fetch(`/api/composers?locale=${locale}&limit=6`);
        if (!response.ok) {
          throw new Error("Failed to fetch composers");
        }
        const data = await response.json();
        setComposers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchComposers();
  }, [locale]);

  const renderWorksCount = (count: number) => `${count} ${count > 1 ? copy.worksPlural : copy.worksSingular}`;

  if (loading) {
    return (
      <section id="artists" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/55">{copy.eyebrow}</p>
            <h2 className="text-4xl font-black">{copy.title}</h2>
          </div>
        </div>
        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div
              key={id}
              className="relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] animate-pulse"
            >
              <div className="h-32 rounded-lg bg-white/5" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="artists" className="space-y-8">
        <div className="py-12 text-center text-red-400">{copy.error}</div>
      </section>
    );
  }

  return (
    <section id="artists" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">{copy.eyebrow}</p>
          <h2 className="text-4xl font-black">{copy.title}</h2>
        </div>
        <Button asChild variant="outline" className="inline-flex items-center gap-2 rounded-full">
          <Link href={`/${locale}/artistes`}>
            {copy.viewAll}
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {composers.map((composer) => (
          <Link
            key={composer.id}
            href={`/${locale}/artistes/${composer.slug}`}
            className="group relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]"
          >
            <div className="relative z-10 flex flex-col items-center gap-4">
              {composer.image ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-black/20">
                  <Image
                    src={composer.image}
                    alt={composer.imageAlt || composer.name}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-lime-300/20 to-emerald-400/20">
                  <span className="text-4xl font-black text-white/40">
                    {composer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold uppercase tracking-tight">{composer.name}</h3>
              <div className="text-sm text-white/60">{renderWorksCount(composer.worksCount)}</div>

              {composer.bio && <p className="text-xs text-white/50 line-clamp-2">{composer.bio}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
