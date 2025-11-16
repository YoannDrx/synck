"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GalleryWork {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  coverImage: string;
  coverImageAlt: string;
  composers: string[];
}

export function ProjectsSection() {
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorks() {
      try {
        // Récupérer seulement 4 projets pour la section "Travaux sélectionnés"
        const response = await fetch('/api/portfolio?locale=fr&limit=4');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio');
        }
        const data = await response.json();
        setWorks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchWorks();
  }, []);

  // Gradients pour les cartes (cycle entre plusieurs couleurs)
  const gradients = [
    "from-emerald-400 via-lime-300 to-yellow-300",
    "from-purple-500 via-fuchsia-500 to-red-400",
    "from-slate-300 via-sky-400 to-cyan-200",
    "from-orange-400 via-amber-300 to-lime-200",
  ];

  if (loading) {
    return (
      <section id="projects" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/55">
              Portfolio
            </p>
            <h2 className="text-4xl font-black">Travaux sélectionnés</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 auto-rows-fr">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] animate-pulse"
            >
              <div className="h-64 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="space-y-8">
        <div className="text-center text-red-400 py-12">
          Erreur lors du chargement du portfolio
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">
            Portfolio
          </p>
          <h2 className="text-4xl font-black">Travaux sélectionnés</h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full"
        >
          <Link href="/fr/portfolio">
            Voir tout le portfolio
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 auto-rows-fr">
        {works.map((work, index) => (
          <Link
            key={work.id}
            href={`/fr/portfolio/${work.slug}`}
            className="group relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]"
          >
            <div
              className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-70 bg-gradient-to-br ${gradients[index % gradients.length]}`}
            />
            <div className="relative z-10 flex h-full flex-col gap-6">
              <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
                <span>{work.category}</span>
                <span>WORK {String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={work.coverImage}
                  alt={work.coverImageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <h3 className="text-3xl font-bold">{work.title}</h3>

              {work.subtitle && (
                <p className="text-sm text-white/75">{work.subtitle}</p>
              )}

              {work.composers.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2">
                  {work.composers.map((composer) => (
                    <Badge
                      key={composer}
                      variant="outline"
                      className="text-[0.6rem] uppercase tracking-[0.3em]"
                    >
                      {composer}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
