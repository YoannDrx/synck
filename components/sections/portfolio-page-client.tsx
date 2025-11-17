"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Breadcrumb } from "@/components/breadcrumb";
import type { PortfolioPageDictionary } from "@/types/dictionary";
import type { Locale } from "@/lib/i18n-config";

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

interface Category {
  id: string;
  slug: string;
  name: string;
  color: string | null;
}

interface PortfolioPageClientProps {
  locale: Locale;
  nav: {
    home: string;
    portfolio: string;
  };
  copy: PortfolioPageDictionary;
  viewProjectLabel: string;
}

export function PortfolioPageClient({ locale, nav, copy, viewProjectLabel }: PortfolioPageClientProps) {
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [worksRes, categoriesRes] = await Promise.all([
          fetch(`/api/portfolio?locale=${locale}`),
          fetch(`/api/categories?locale=${locale}`),
        ]);

        if (worksRes.ok) {
          setWorks(await worksRes.json());
        }
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [locale]);

  const filteredWorks = selectedCategory === "all" ? works : works.filter((work) => work.category === selectedCategory);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#050505] text-white">
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
          <div className="absolute inset-0 noise-layer" />
        </div>
        <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-20 pt-16 sm:px-8 lg:px-16">
          <div className="flex min-h-[60vh] items-center justify-center text-xl text-white/50">
            {copy.loading}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-16 pt-6 sm:px-8 sm:pt-16 lg:px-16">
        <Breadcrumb items={[{ label: nav.home, href: `/${locale}` }, { label: nav.portfolio }]} />

        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter sm:text-7xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              {nav.portfolio.charAt(0)}
            </span>
            <span>{nav.portfolio.slice(1)}</span>
          </h1>
          <p className="mb-6 max-w-2xl text-lg text-white/70">{copy.description}</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                selectedCategory === "all"
                  ? "border-lime-300 bg-lime-300 text-[#050505]"
                  : "border-white/30 bg-transparent text-white hover:border-lime-300 hover:text-lime-300"
              }`}
            >
              {copy.filterAll}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === category.name
                    ? "border-lime-300 bg-lime-300 text-[#050505]"
                    : "border-white/30 bg-transparent text-white hover:border-lime-300 hover:text-lime-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorks.map((work) => (
            <Link
              key={work.id}
              href={`/${locale}/portfolio/${work.slug}`}
              className="group relative overflow-hidden border-4 border-white/10 bg-[#0a0a0e] transition-all duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]"
            >
              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-black/20">
                <Image
                  src={work.coverImage}
                  alt={work.coverImageAlt}
                  width={600}
                  height={600}
                  className="h-auto w-full object-contain transition-transform group-hover:scale-110"
                />
              </div>

              <div className="p-4">
                <div className="mb-2 text-xs font-bold uppercase text-lime-400">{work.category}</div>
                <h2 className="mb-2 text-lg font-bold uppercase leading-tight">{work.title}</h2>
                {work.subtitle && <p className="mb-3 text-sm text-white/70 line-clamp-2">{work.subtitle}</p>}
                {work.composers.length > 0 && <div className="text-xs text-white/50">{work.composers.join(", ")}</div>}
                <div className="mt-3 inline-block text-xs font-bold uppercase text-lime-300 opacity-0 transition-opacity group-hover:opacity-100">
                  {viewProjectLabel} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredWorks.length === 0 && (
          <div className="py-20 text-center text-xl text-white/50">{copy.empty}</div>
        )}

        <div className="mt-16">
          <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-12">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">{copy.ctaTitle}</h2>
            <p className="mb-6 text-[#050505]/80">{copy.ctaDescription}</p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block border-4 border-[#050505] bg-[#050505] px-8 py-3 font-bold uppercase text-white transition-transform hover:scale-105"
            >
              {copy.ctaButton}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
