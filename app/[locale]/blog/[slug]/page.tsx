import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import { getPostData, getSortedPostsData } from "@/lib/blogUtils";
import { getDictionary } from "@/lib/dictionaries";
import { Breadcrumb } from "@/components/breadcrumb";

type BlogDetailParams = {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const locales: Locale[] = ["fr", "en"];
  const params: { locale: Locale; slug: string }[] = [];

  for (const locale of locales) {
    const posts = await getSortedPostsData(locale);
    posts.forEach((post) => params.push({ locale, slug: post.slug }));
  }

  return params;
}

export async function generateMetadata({ params }: BlogDetailParams): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const post = await getPostData(slug, locale);
    return {
      title: post.title,
      description: post.subtitle || post.description || post.title,
      openGraph: {
        title: post.title,
        description: post.subtitle || post.description || post.title,
        images: post.thumb ? [{ url: post.thumb }] : undefined,
      },
    };
  } catch {
    return {
      title: "Article introuvable",
      description: "Le contenu demandé n'existe pas ou a été déplacé.",
    };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailParams) {
  const { locale, slug } = await params;
  const dictionary = await getDictionary(locale);

  let post;
  try {
    post = await getPostData(slug, locale);
  } catch {
    notFound();
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1200px] mx-auto px-4 pb-20 pt-16 sm:px-8 lg:px-16">
        <Breadcrumb
          items={[
            { label: "Accueil", href: `/${locale}` },
            { label: dictionary.nav.blog, href: `/${locale}/blog` },
            { label: post.title },
          ]}
        />

        <article className="mt-10">
          <header className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-lime-300">{post.category}</p>
            <h1 className="mb-4 text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.subtitle && <p className="text-lg text-white/80">{post.subtitle}</p>}
            <p className="mt-4 text-sm text-white/40">{post.date}</p>
          </header>

          {post.thumb && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-[32px] border-4 border-white/10">
              <Image
                src={post.thumb}
                alt={post.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.contentHtml ?? "" }}
          />
        </article>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${locale}/blog`}
            className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-lime-300"
          >
            ← Retour au blog
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="rounded-full border-2 border-lime-300 px-6 py-2 text-xs font-bold uppercase tracking-wider text-lime-300 transition-all hover:bg-lime-300 hover:text-[#050505]"
          >
            {dictionary.cta.contact}
          </Link>
        </div>
      </main>
    </div>
  );
}
