import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { getSortedPostsData } from "@/lib/blogUtils";
import { Breadcrumb } from "@/components/breadcrumb";

interface BlogPageProps {
  params: Promise<{
    locale: Locale;
  }>;
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

const formatDate = (value: string) => {
  const parts = value.split(/[/-]/);
  if (parts.length !== 3) {
    return value;
  }
  const [part1, part2, part3] = parts;
  const iso = part3.length === 4 ? `${part3}-${part2}-${part1}` : `${part1}-${part2}-${part3}`;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return value;
  }
};

const parseDateYear = (value: string) => {
  const parts = value.split(/[/-]/);
  if (parts.length !== 3) return undefined;
  const [part1, , part3] = parts;
  return part3.length === 4 ? part3 : part1;
};

const buildQuery = (base: Record<string, string | undefined>, overrides: Record<string, string | undefined>) => {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  Object.entries(merged).forEach(([key, val]) => {
    if (val && val.length > 0) {
      params.set(key, val);
    }
  });
  return params.toString() ? `?${params.toString()}` : "";
};

export default async function BlogPage({ params, searchParams = {} }: BlogPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const posts = await getSortedPostsData(locale);

  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const tag = typeof searchParams.tag === "string" ? searchParams.tag : undefined;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const year = typeof searchParams.year === "string" ? searchParams.year : undefined;
  const currentPageParam = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const currentPage = Number.isNaN(currentPageParam) ? 1 : Math.max(1, currentPageParam);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = category ? post.category === category : true;
    const matchesTag = tag ? post.tags.includes(tag) : true;
    const matchesYear = year ? parseDateYear(post.date) === year : true;
    const searchTarget = `${post.title} ${post.subtitle ?? ""} ${post.description ?? ""}`.toLowerCase();
    const matchesSearch = search ? searchTarget.includes(search.toLowerCase()) : true;
    return matchesCategory && matchesTag && matchesYear && matchesSearch;
  });

  const postsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfLastPost = safePage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const availableCategories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)));
  const availableTags = Array.from(new Set(posts.flatMap((post) => post.tags)));
  const availableYears = Array.from(
    new Set(posts.map((post) => parseDateYear(post.date)).filter(Boolean) as string[]),
  ).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16">
        <Breadcrumb
          items={[
            { label: "Accueil", href: `/${locale}` },
            { label: dictionary.nav.blog },
          ]}
        />

        <div className="mb-12">
          <h1 className="mb-2 text-7xl font-black uppercase tracking-tighter sm:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              B
            </span>
            <span>log</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Articles, actualités et réflexions sur les droits d&apos;auteur et la musique
          </p>
        </div>

        <form className="mb-12 grid gap-4 rounded-3xl border-4 border-white/10 bg-[#0a0a0e] p-6 lg:grid-cols-4" action={`/${locale}/blog`}>
          <div className="flex flex-col">
            <label htmlFor="category" className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category ?? ""}
              className="rounded-xl border border-white/20 bg-[#050505] px-4 py-2 text-sm text-white"
            >
              <option value="">Toutes</option>
              {availableCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="tag" className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
              Tag
            </label>
            <select
              id="tag"
              name="tag"
              defaultValue={tag ?? ""}
              className="rounded-xl border border-white/20 bg-[#050505] px-4 py-2 text-sm text-white"
            >
              <option value="">Tous</option>
              {availableTags.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="year" className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
              Année
            </label>
            <select
              id="year"
              name="year"
              defaultValue={year ?? ""}
              className="rounded-xl border border-white/20 bg-[#050505] px-4 py-2 text-sm text-white"
            >
              <option value="">Toutes</option>
              {availableYears.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="search" className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50">
              Recherche
            </label>
            <input
              id="search"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Mot-clé..."
              className="rounded-xl border border-white/20 bg-[#050505] px-4 py-2 text-sm text-white placeholder:text-white/40"
            />
          </div>

          <div className="lg:col-span-4 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="rounded-full border-2 border-lime-300 px-6 py-2 text-xs font-bold uppercase tracking-wider text-lime-300 transition-all hover:bg-lime-300 hover:text-[#050505]"
            >
              Appliquer les filtres
            </button>
            {(category || tag || year || search) && (
              <Link
                href={`/${locale}/blog`}
                className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-lime-300"
              >
                Réinitialiser
              </Link>
            )}
          </div>
        </form>

        <div className="grid gap-6 lg:grid-cols-2">
          {currentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.slug}`}
              className="group border-4 border-white bg-[#050505] transition-transform hover:scale-105"
            >
              {post.thumb && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.thumb}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold uppercase text-fuchsia-600">{post.category}</span>
                  <time className="text-xs text-white/50">{formatDate(post.date)}</time>
                </div>

                <h2 className="mb-3 text-2xl font-bold uppercase leading-tight">{post.title}</h2>
                {post.subtitle && <p className="mb-3 text-base font-medium text-white/80">{post.subtitle}</p>}
                {post.description && (
                  <p className="mb-4 text-sm text-white/70 line-clamp-3">{post.description}</p>
                )}

                {post.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.tags.map((postTag) => (
                      <span
                        key={postTag}
                        className="border-2 border-lime-400 px-2 py-1 text-xs font-bold uppercase text-lime-400"
                      >
                        {postTag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="inline-block text-sm font-bold uppercase text-lime-400">
                  {dictionary.cta.readMore} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {currentPosts.length === 0 && (
          <div className="py-20 text-center text-xl text-white/50">
            Aucun article disponible pour le moment
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {safePage > 1 && (
              <Link
                href={`/${locale}/blog${buildQuery(
                  { category, tag, search, year },
                  { page: String(safePage - 1) },
                )}`}
                className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-lime-300"
              >
                ← Page précédente
              </Link>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Page {safePage} / {totalPages}
            </span>
            {safePage < totalPages && (
              <Link
                href={`/${locale}/blog${buildQuery(
                  { category, tag, search, year },
                  { page: String(safePage + 1) },
                )}`}
                className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-lime-300"
              >
                Page suivante →
              </Link>
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="border-4 border-white bg-gradient-to-r from-lime-400 to-fuchsia-600 p-12">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">Restons connectés</h2>
            <p className="mb-6 text-[#050505]/80">Une question ou un projet ? Contactez-moi directement</p>
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
