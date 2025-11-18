import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";
import { getComposersFromPrisma } from "@/lib/prismaProjetsUtils";
import { getDictionary } from "@/lib/dictionaries";
import { Breadcrumb } from "@/components/breadcrumb";

type ComposersPageParams = {
  params: Promise<{
    locale: Locale;
  }>;
};

export default async function ComposeursPage({ params }: ComposersPageParams) {
  const { locale } = await params;
  const safeLocale = (locale === "en" ? "en" : "fr");
  const composers = await getComposersFromPrisma(safeLocale);
  const dictionary = await getDictionary(safeLocale);
  const copy = dictionary.composersPage;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pb-20 pt-8 sm:pt-16 sm:px-8 lg:px-16">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: dictionary.nav.home, href: `/${safeLocale}` }, { label: dictionary.nav.composers }]} />

        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter sm:text-8xl lg:text-9xl">
            <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
              {dictionary.nav.composers.charAt(0)}
            </span>
            <span>{dictionary.nav.composers.slice(1)}</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">{copy.description}</p>
        </div>

        {/* Composers Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {composers.map((composer) => (
            <Link
              key={composer.id}
              href={`/${safeLocale}/compositeurs/${composer.slug}`}
              className="group relative overflow-hidden border-4 border-white/10 bg-[#0a0a0e] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                {/* Composer Image */}
                {composer.image ? (
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 bg-black/20">
                    <Image
                      src={composer.image}
                      alt={composer.imageAlt ?? composer.name}
                      fill
                      sizes="128px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-lime-300/20 to-emerald-400/20 flex items-center justify-center">
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-5xl font-black text-white/40 leading-none" style={{ lineHeight: "1" }}>
                        {composer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Composer Name */}
                <h3 className="text-xl font-bold uppercase tracking-tight">{composer.name}</h3>

                {/* Works Count */}
                <div className="text-sm text-white/60">
                  {composer.worksCount} {composer.worksCount > 1 ? copy.worksPlural : copy.worksSingular}
                </div>

                {/* Bio Preview */}
                {composer.bio && <p className="text-xs text-white/50 line-clamp-2">{composer.bio}</p>}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16">
          <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">{copy.ctaTitle}</h2>
            <p className="mb-6 text-[#050505]/80">{copy.ctaDescription}</p>
            <Link
              href={`/${safeLocale}/contact`}
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
