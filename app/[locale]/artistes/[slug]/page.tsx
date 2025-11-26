import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import {
  getArtistBySlug,
  getAllArtistSlugs,
} from "@/lib/prismaProjetsUtils";
import type { ArtistWithContributions } from "@/lib/prismaProjetsUtils";
import { getDictionary } from "@/lib/dictionaries";
import { Breadcrumb } from "@/components/breadcrumb";

// Generate static params for all artist slugs
export async function generateStaticParams() {
  const slugs = await getAllArtistSlugs();
  const locales: Locale[] = ["fr", "en"];

  const params: { locale: Locale; slug: string }[] = [];

  locales.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });

  return params;
}

type ArtistDetailParams = {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
};

type ArtistWorkSummary = {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
};

export default async function ArtisteDetailPage({
  params,
}: ArtistDetailParams) {
  const { locale, slug } = await params;
  const safeLocale = locale === "en" ? "en" : "fr";
  const artist = await getArtistBySlug(slug, safeLocale);
  const dictionary = await getDictionary(safeLocale);
  const copy = dictionary.artistDetail;

  if (!artist) {
    notFound();
  }

  // Extract data
  const translation = artist.translations[0];
  const works: ArtistWorkSummary[] = artist.contributions.map(
    (contribution: ArtistWithContributions["contributions"][number]) => ({
      id: contribution.work.id,
      slug: contribution.work.slug,
      title: contribution.work.translations[0]?.title ?? contribution.work.slug,
      coverImage:
        contribution.work.coverImage?.path ?? "/images/placeholder.jpg",
      coverImageAlt:
        contribution.work.coverImage?.alt ??
        contribution.work.translations[0]?.title ??
        contribution.work.slug,
      category: contribution.work.category?.translations[0]?.name ?? "Autres",
    }),
  );

  const artistImage = artist.image?.path;
  const hasValidImage = artistImage && artistImage.trim() !== "";

  // Build social links from ArtistLink table
  const socialLinks =
    artist.links?.map((link) => ({
      label: link.label ?? getPlatformName(link.url, safeLocale),
      url: link.url,
    })) ?? [];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,75,162,0.1),transparent_50%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 pb-20 pt-8 sm:pt-16 sm:px-8 lg:px-16">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: dictionary.nav.home, href: `/${safeLocale}` },
            {
              label: dictionary.nav.artists,
              href: `/${safeLocale}/artistes`,
            },
            { label: translation?.name || artist.slug },
          ]}
        />

        {/* Artist Header */}
        <div className="mb-12 space-y-8">
          {/* Artist Name & Image */}
          <div className="flex items-center gap-6">
            {/* Artist Image */}
            {hasValidImage ? (
              <div className="relative overflow-hidden border-4 border-white/10 bg-black/20 rounded-full w-32 h-32 flex-shrink-0">
                <Image
                  src={artistImage}
                  alt={
                    artist.image?.alt ?? translation?.name ?? artist.slug
                  }
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative overflow-hidden border-4 border-white/10 bg-gradient-to-br from-lime-300/20 to-emerald-400/20 rounded-full w-32 h-32 flex-shrink-0 flex items-center justify-center">
                <span className="text-5xl font-black text-white/40">
                  {translation?.name.charAt(0).toUpperCase() ||
                    artist.slug.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Artist Name */}
            <div className="flex-1 min-w-0">
              <h1 className="mb-2 text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
                {translation?.name || artist.slug}
              </h1>
              <span className="inline-block rounded-full border-2 border-lime-300 bg-lime-300/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-lime-300">
                {works.length}{" "}
                {works.length > 1 ? copy.worksPlural : copy.worksSingular}
              </span>
            </div>
          </div>

          {/* Artist Info */}
          <div className="space-y-6">
            {/* Bio */}
            {translation?.bio && (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-white/80 whitespace-pre-line">
                  {translation.bio}
                </p>
              </div>
            )}

            {/* External/Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-lime-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-lime-300 transition-all hover:bg-lime-300 hover:text-[#050505]"
                  >
                    <span>{link.label}</span>
                    <span aria-hidden>↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        {works.length > 0 && (
          <div>
            <h2 className="mb-6 text-3xl font-black uppercase tracking-tight">
              {copy.worksTitle}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {works.map((work) => (
                <Link
                  key={work.id}
                  href={`/${safeLocale}/projets/${work.slug}`}
                  className="group relative overflow-hidden rounded-[28px] border-4 border-white/10 bg-[#0a0a0e] shadow-[0_25px_60px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-2 hover:border-lime-300/70 hover:shadow-[0_30px_90px_rgba(213,255,10,0.15)]"
                >
                  <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-70 bg-gradient-to-br from-emerald-400 via-lime-300 to-yellow-300" />

                  <div className="relative z-10">
                    {/* Work Cover Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={work.coverImage}
                        alt={work.coverImageAlt}
                        width={800}
                        height={800}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Work Info */}
                    <div className="p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                        {work.category}
                      </div>
                      <h3 className="text-lg font-bold uppercase tracking-tight line-clamp-2">
                        {work.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16">
          <div className="border-4 border-lime-300 bg-gradient-to-r from-lime-300 to-emerald-400 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold uppercase text-[#050505]">
              {copy.ctaTitle}
            </h2>
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

// Helper function to extract platform name from URL
function getPlatformName(url: string, locale: Locale): string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "YouTube";
  }
  if (url.includes("soundcloud.com")) {
    return "SoundCloud";
  }
  if (url.includes("spotify.com")) {
    return "Spotify";
  }
  if (url.includes("deezer.com")) {
    return "Deezer";
  }
  if (url.includes("apple.com")) {
    return "Apple Music";
  }
  return locale === "fr" ? "le web" : "Web";
}
