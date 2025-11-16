import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { getSortedPostsData } from "@/lib/blogUtils";
import type { Locale } from "@/lib/i18n-config";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const posts = await getSortedPostsData();

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-7xl font-black uppercase tracking-tighter sm:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              B
            </span>
            <span>log</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Articles, actualités et réflexions sur les droits d'auteur et la musique
          </p>
        </div>

        {/* Posts List */}
        <div className="grid gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.id}`}
              className="group border-4 border-white bg-[#050505] transition-transform hover:scale-105"
            >
              {/* Thumbnail if available */}
              {post.thumb && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.thumb}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Category & Date */}
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold uppercase text-fuchsia-600">
                    {post.category}
                  </span>
                  <time className="text-xs text-white/50">{post.date}</time>
                </div>

                {/* Title */}
                <h2 className="mb-3 text-2xl font-bold uppercase leading-tight">
                  {post.title}
                </h2>

                {/* Subtitle */}
                {post.subtitle && (
                  <p className="mb-3 text-base font-medium text-white/80">
                    {post.subtitle}
                  </p>
                )}

                {/* Description */}
                {post.description && (
                  <p className="mb-4 text-sm text-white/70 line-clamp-3">
                    {post.description}
                  </p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="border-2 border-lime-400 px-2 py-1 text-xs font-bold uppercase text-lime-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read more */}
                <div className="inline-block text-sm font-bold uppercase text-lime-400">
                  {dictionary.cta.readMore} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-white/50">
              Aucun article disponible pour le moment
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="border-4 border-white bg-gradient-to-r from-lime-400 to-fuchsia-600 p-12">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">
              Restons connectés
            </h2>
            <p className="mb-6 text-[#050505]/80">
              Une question ou un projet ? Contactez-moi directement
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block border-4 border-[#050505] bg-[#050505] px-8 py-3 font-bold uppercase text-white transition-transform hover:scale-105"
            >
              {dictionary.cta.contact}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
