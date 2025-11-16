"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Expertise {
  id: string;
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  imgHome: string;
  description: string;
}

export function ExpertisesSection() {
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpertises() {
      try {
        const response = await fetch('/api/expertises');
        if (!response.ok) {
          throw new Error('Failed to fetch expertises');
        }
        const data = await response.json();
        setExpertises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchExpertises();
  }, []);

  if (loading) {
    return (
      <section id="expertises" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/55">
              Services
            </p>
            <h2 className="text-4xl font-black">Expertises</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3 auto-rows-fr">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-[#08080f] p-8 animate-pulse"
            >
              <div className="h-48 bg-white/5 rounded-lg mb-6" />
              <div className="h-8 bg-white/5 rounded mb-4 w-3/4" />
              <div className="h-4 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="expertises" className="space-y-8">
        <div className="text-center text-red-400 py-12">
          Erreur lors du chargement des expertises
        </div>
      </section>
    );
  }

  return (
    <section id="expertises" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">
            Services
          </p>
          <h2 className="text-4xl font-black">Expertises</h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full"
        >
          <Link href="/fr/expertises">
            Voir toutes les expertises
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 auto-rows-fr">
        {expertises.map((expertise, index) => (
          <Link
            key={expertise.id}
            href={expertise.href}
            className="group relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-[#08080f] transition-all hover:border-white/30 hover:scale-[1.02]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${expertise.imgHome})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent" />
            </div>

            <div className="p-8 space-y-4">
              <div className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-wider text-white/70">
                0{index + 1}
              </div>

              <h3 className="text-2xl font-black leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-lime-300 group-hover:to-fuchsia-400 transition-all">
                {expertise.title}
              </h3>

              <p className="text-sm leading-relaxed text-white/70">
                {expertise.description}
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-white/90 group-hover:text-lime-300 transition-colors">
                En savoir plus
                <span className="transform transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
