"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/i18n-config";
import type { Dictionary, LanguageSwitchDictionary } from "@/types/dictionary";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type SiteHeaderProps = {
  locale: Locale;
  navigation: Dictionary["nav"];
  language: LanguageSwitchDictionary;
  menu: {
    open: string;
    close: string;
  };
}

const buildLinks = (locale: Locale) =>
  [
    { key: "home", href: `/${locale}` },
    { key: "expertises", href: `/${locale}/expertises` },
    { key: "projets", href: `/${locale}/projets` },
    { key: "composers", href: `/${locale}/compositeurs` },
    { key: "blog", href: `/${locale}/blog` },
    { key: "contact", href: `/${locale}/contact` },
  ].filter((link) => link.key !== "blog");

export function SiteHeader({ locale, navigation, language, menu }: SiteHeaderProps) {
  const pathname = usePathname() || "/";
  const links = buildLinks(locale);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => { setMobileOpen(false); };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-16">
        <Link
          href={`/${locale}`}
          className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80 transition-colors hover:text-lime-300"
        >
          SYNCK
        </Link>

        <nav className="hidden lg:flex flex-wrap items-center gap-4 text-[0.65rem] font-bold uppercase tracking-[0.35em]">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`transition-colors hover:text-lime-300 ${
                pathname === link.href ? "text-lime-300" : "text-white/60"
              }`}
            >
              {navigation[link.key as keyof Dictionary["nav"]]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <LanguageSwitcher locale={locale} dictionary={language} />
          </div>
          <button
            type="button"
            onClick={() => { setMobileOpen((prev) => !prev); }}
            className="rounded-full border border-white/25 px-3 py-2 text-xs font-bold uppercase tracking-[0.4em] text-white/70 transition hover:text-lime-300 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? menu.close.toUpperCase() : menu.open.toUpperCase()}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/90 px-4 pb-6 pt-4 text-xs uppercase tracking-[0.3em] text-white/70">
          <nav className="flex flex-col gap-3 font-semibold">
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`rounded-full border border-white/20 px-4 py-2 text-center transition-colors hover:border-lime-300 hover:text-lime-300 ${
                  pathname === link.href ? "border-lime-300 text-lime-300" : ""
                }`}
                onClick={closeMobile}
              >
                {navigation[link.key as keyof Dictionary["nav"]]}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex justify-end">
            <LanguageSwitcher locale={locale} dictionary={language} />
          </div>
        </div>
      )}
    </header>
  );
}
