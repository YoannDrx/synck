import fs from "fs";
import path from "path";
import type { Locale } from "./i18n-config";

interface LegacyCompositeur {
  name: string;
  compoImg?: string;
  links?: string | Record<string, string>;
}

export interface LegacyProjetMetadata {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  category?: string;
  externalLink?: string;
  linkSpotify?: string;
  src?: string;
  releaseDate?: string;
  genre?: string;
  compositeurs?: LegacyCompositeur[];
}

export interface LegacyProjetItem extends LegacyProjetMetadata {
  description?: string;
}

export interface LegacyComposerLink {
  label: string;
  url: string;
}

export interface LegacyComposerProfile {
  slug: string;
  name: string;
  image?: string;
  links: LegacyComposerLink[];
}

const metadataCache = new Map<Locale, LegacyProjetMetadata[]>();
const descriptionCache = new Map<string, string>();
const descriptionIndex = new Map<Locale, Map<string, string>>();
const legacyComposerCache = new Map<string, LegacyComposerProfile>();

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

function getDescriptionsDir(locale: Locale) {
  return path.join(process.cwd(), "content", "projets", locale, "descriptions");
}

function ensureDescriptionIndex(locale: Locale) {
  if (descriptionIndex.has(locale)) {
    return descriptionIndex.get(locale)!;
  }

  const dir = getDescriptionsDir(locale);
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const map = new Map<string, string>();

  entries.forEach((file) => {
    if (!file.endsWith(".md")) return;
    const base = path.parse(file).name;
    map.set(normalizeKey(base), path.join(dir, file));
  });

  descriptionIndex.set(locale, map);
  return map;
}

function loadLegacyMetadata(locale: Locale) {
  if (!metadataCache.has(locale)) {
    const metadataPath = path.join(process.cwd(), "content", "projets", locale, "metadata.json");
    const content = fs.readFileSync(metadataPath, "utf8");
    metadataCache.set(locale, JSON.parse(content));
  }

  return metadataCache.get(locale)!;
}

function readDescription(locale: Locale, slug: string) {
  const normalizedSlug = normalizeKey(slug);
  const cacheKey = `${locale}:${normalizedSlug}`;

  if (descriptionCache.has(cacheKey)) {
    return descriptionCache.get(cacheKey)!;
  }

  const map = ensureDescriptionIndex(locale);
  const filePath = map.get(normalizedSlug);

  if (!filePath) {
    return null;
  }

  const description = fs.readFileSync(filePath, "utf8").trim();
  descriptionCache.set(cacheKey, description);
  return description;
}

function detectLabel(url: string, key?: string) {
  if (key) {
    return key.replace(/[_-]/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
  }

  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const host = parsed.hostname.replace("www.", "");
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("soundcloud")) return "SoundCloud";
    if (host.includes("spotify")) return "Spotify";
    if (host.includes("deezer")) return "Deezer";
    if (host.includes("apple")) return "Apple Music";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("twitter") || host.includes("x.com")) return "Twitter";
    return host;
  } catch {
    return key || "Lien";
  }
}

function normalizeLinks(raw?: string | Record<string, string>): LegacyComposerLink[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    return [
      {
        label: detectLabel(raw),
        url: raw,
      },
    ];
  }

  return Object.entries(raw)
    .filter(([, url]) => typeof url === "string" && url.trim().length > 0)
    .map(([key, url]) => ({
      label: detectLabel(url, key),
      url,
    }));
}

function buildLegacyComposerCache() {
  if (legacyComposerCache.size > 0) return legacyComposerCache;

  const frMetadata = loadLegacyMetadata("fr");

  frMetadata.forEach((work) => {
    work.compositeurs?.forEach((composer) => {
      const slug = slugify(composer.name || "");
      if (!slug) return;

      const existing = legacyComposerCache.get(slug) ?? {
        slug,
        name: composer.name,
        image: composer.compoImg,
        links: [],
      };

      if (!existing.image && composer.compoImg) {
        existing.image = composer.compoImg;
      }

      const links = normalizeLinks(composer.links);
      links.forEach((link) => {
        if (!existing.links.some((existingLink) => existingLink.url === link.url)) {
          existing.links.push(link);
        }
      });

      legacyComposerCache.set(slug, existing);
    });
  });

  return legacyComposerCache;
}

export function getLegacyProjetItem(slug: string, locale: Locale): LegacyProjetItem | null {
  const entries = loadLegacyMetadata(locale);
  const normalizedSlug = normalizeKey(slug);
  const match =
    entries.find((item) => normalizeKey(item.slug) === normalizedSlug) ??
    entries.find((item) => item.slug === slug);

  if (!match) {
    return null;
  }

  const description = readDescription(locale, match.slug);

  return {
    ...match,
    description: description ?? undefined,
  };
}

export function getLegacyComposerBySlug(slug: string): LegacyComposerProfile | null {
  const cache = buildLegacyComposerCache();
  const normalizedSlug = slugify(slug);
  return cache.get(normalizedSlug) ?? null;
}
