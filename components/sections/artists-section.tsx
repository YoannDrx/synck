"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export function ArtistsSection() {
  const [composers, setComposers] = useState<GalleryComposer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComposers() {
      try {
        // Récupérer seulement 6 artistes pour la section "Artistes du moment"
        const response = await fetch('/api/composers?locale=fr&limit=6');
        if (!response.ok) {
          throw new Error('Failed to fetch composers');
        }
        const data = await response.json();
        setComposers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchComposers();
  }, []);

  if (loading) {
    return (
      <section id="artists" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/55">
              Artistes
            </p>
            <h2 className="text-4xl font-black">Artistes du moment</h2>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] animate-pulse"
            >
              <div className="h-32 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="artists" className="space-y-8">
        <div className="text-center text-red-400 py-12">
          Erreur lors du chargement des artistes
        </div>
      </section>
    );
  }

  return (
    <section id="artists" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">
            Artistes
          </p>
          <h2 className="text-4xl font-black">Artistes du moment</h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full"
        >
          <Link href="/fr/artistes">
            Voir tous les artistes
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {composers.map((composer) => (
          <Link
            key={composer.id}
            href={`/fr/artistes/${composer.slug}`}
            className="group relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]"
          >
            <div
              className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-70 bg-gradient-to-br from-emerald-400 via-lime-300 to-yellow-300"
            />
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              {/* Artist Image */}
              {composer.image ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-black/20">
                  <img
                    src={composer.image}
                    alt={composer.imageAlt || composer.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-lime-300/20 to-emerald-400/20 flex items-center justify-center">
                  <span className="text-4xl font-black text-white/40">
                    {composer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Artist Name */}
              <h3 className="text-xl font-bold uppercase tracking-tight">
                {composer.name}
              </h3>

              {/* Works Count */}
              <div className="text-sm text-white/60">
                {composer.worksCount} {composer.worksCount > 1 ? 'projets' : 'projet'}
              </div>

              {/* Bio Preview */}
              {composer.bio && (
                <p className="text-xs text-white/50 line-clamp-2">
                  {composer.bio}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
