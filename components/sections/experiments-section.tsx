"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  thumb: string;
  subtitle: string | null;
  description: string | null;
  tags: string[];
}

export function ExperimentsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Palettes de couleurs pour les cartes
  const palettes = [
    "from-sky-500 via-indigo-500 to-blue-400",
    "from-pink-500 via-rose-500 to-orange-400",
    "from-yellow-400 via-lime-300 to-emerald-400",
  ];

  if (loading) {
    return (
      <section
        id="experiments"
        className="rounded-[32px] border-4 border-white/15 bg-[#08080f] p-6 sm:p-10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/55">
              Blog
            </p>
            <h2 className="text-3xl font-black">Articles récents</h2>
          </div>
        </div>

        <div className="mt-8 w-full overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-4 text-white/90 snap-x snap-mandatory">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[320px] snap-start rounded-[24px] border-4 border-white/10 bg-black/40 p-6 animate-pulse"
              >
                <div className="h-48 bg-white/5 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="experiments"
        className="rounded-[32px] border-4 border-white/15 bg-[#08080f] p-6 sm:p-10"
      >
        <div className="text-center text-red-400 py-12">
          Erreur lors du chargement des articles
        </div>
      </section>
    );
  }

  return (
    <section
      id="experiments"
      className="rounded-[32px] border-4 border-white/15 bg-[#08080f] p-6 sm:p-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/55">
            Blog
          </p>
          <h2 className="text-3xl font-black">Articles récents</h2>
        </div>
        <Button
          asChild
          variant="outline"
          className="inline-flex items-center gap-2 rounded-full"
        >
          <Link href="/fr/blog">
            Voir tous les articles
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="mt-8 w-full overflow-hidden">
        <div className="flex gap-6 overflow-x-auto pb-4 text-white/90 snap-x snap-mandatory">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/fr/blog/${post.id}`}
              className="group min-w-[320px] snap-start rounded-[24px] border-4 border-white/10 bg-black/40 p-6 transition-all hover:border-lime-300/50 hover:scale-105"
            >
              <div className="relative mb-4 overflow-hidden rounded-lg aspect-[16/9]">
                {post.thumb && (
                  <img
                    src={post.thumb}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div
                  className={`absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-50 bg-gradient-to-br ${palettes[index % palettes.length]}`}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/60">
                  <span>{post.category}</span>
                  <span>ARTICLE {String(index + 1).padStart(2, '0')}</span>
                </div>

                <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-lime-300 group-hover:to-fuchsia-400 transition-all">
                  {post.title}
                </h3>

                {(post.subtitle || post.description) && (
                  <p className="text-sm text-white/70 line-clamp-2">
                    {post.subtitle || post.description}
                  </p>
                )}

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
