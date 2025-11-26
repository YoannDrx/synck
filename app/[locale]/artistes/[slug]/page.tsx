import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import { getArtistBySlug, getAllArtistSlugs } from "@/lib/prismaProjetsUtils";
import type { ArtistWithContributions } from "@/lib/prismaProjetsUtils";
import { getDictionary } from "@/lib/dictionaries";
import { ArtistDetailClient } from "@/components/sections/artist-detail-client";

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

// Helper function to transform asset path to URL
function assetPathToUrl(path: string | null | undefined): string {
  if (!path) return "/images/placeholder.jpg";
  if (path.startsWith("public/")) {
    return `/${path.substring("public/".length)}`;
  }
  if (path.startsWith("/")) {
    return path;
  }
  return `/${path}`;
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
  if (url.includes("instagram.com")) {
    return "Instagram";
  }
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return "X";
  }
  if (url.includes("facebook.com")) {
    return "Facebook";
  }
  return locale === "fr" ? "Site web" : "Website";
}

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

  // Extract translation
  const translation = artist.translations[0];

  // Transform works data
  const works: ArtistWorkSummary[] = artist.contributions.map(
    (contribution: ArtistWithContributions["contributions"][number]) => ({
      id: contribution.work.id,
      slug: contribution.work.slug,
      title: contribution.work.translations[0]?.title ?? contribution.work.slug,
      coverImage: assetPathToUrl(contribution.work.coverImage?.path),
      coverImageAlt:
        contribution.work.coverImage?.alt ??
        contribution.work.translations[0]?.title ??
        contribution.work.slug,
      category: contribution.work.category?.translations[0]?.name ?? "Autres",
    }),
  );

  // Build social links from ArtistLink table
  const socialLinks =
    artist.links?.map((link) => ({
      label: link.label ?? getPlatformName(link.url, safeLocale),
      url: link.url,
    })) ?? [];

  // Prepare artist data for client component
  const artistData = {
    slug: artist.slug,
    name: translation?.name ?? artist.slug,
    bio: translation?.bio ?? undefined,
    image: assetPathToUrl(artist.image?.path),
    imageAlt: artist.image?.alt ?? translation?.name ?? artist.slug,
  };

  return (
    <ArtistDetailClient
      locale={safeLocale}
      artist={artistData}
      works={works}
      socialLinks={socialLinks}
      nav={{
        home: dictionary.nav.home,
        artists: dictionary.nav.artists,
      }}
      copy={copy}
    />
  );
}
