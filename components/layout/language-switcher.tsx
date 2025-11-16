"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { i18n, type Locale } from "@/lib/i18n-config";
import type { LanguageSwitchDictionary } from "@/types/dictionary";

interface LanguageSwitcherProps {
  locale: Locale;
  dictionary: LanguageSwitchDictionary;
}

export function LanguageSwitcher({ locale, dictionary }: LanguageSwitcherProps) {
  const pathname = usePathname() || "/";

  const buildHref = (targetLocale: Locale) => {
    const segments = pathname.split("/");
    if (i18n.locales.includes(segments[1] as Locale)) {
      segments[1] = targetLocale;
    } else {
      segments.splice(1, 0, targetLocale);
    }
    const nextPath = segments.join("/") || "/";
    return nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.4em] text-white/70">
      <span>{dictionary.label}</span>
      {i18n.locales.map((targetLocale) => (
        <Link
          key={targetLocale}
          href={buildHref(targetLocale)}
          className={`rounded-full px-2 py-1 font-bold transition-colors ${
            targetLocale === locale ? "bg-lime-300 text-[#050505]" : "text-white/60 hover:text-lime-300"
          }`}
          aria-label={`${dictionary.label} ${targetLocale}`}
        >
          {targetLocale === "fr" ? dictionary.fr : dictionary.en}
        </Link>
      ))}
    </div>
  );
}
