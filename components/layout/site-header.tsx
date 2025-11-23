"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, UserCircle } from "lucide-react";

import type { Locale } from "@/lib/i18n-config";
import type { Dictionary, LanguageSwitchDictionary } from "@/types/dictionary";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useSession } from "@/lib/auth-client";

type SiteHeaderProps = {
  locale: Locale;
  navigation: Dictionary["nav"];
  language: LanguageSwitchDictionary;
  menu: {
    open: string;
    close: string;
  };
};

const buildLinks = (locale: Locale) =>
  [
    { key: "home", href: `/${locale}` },
    { key: "expertises", href: `/${locale}/expertises` },
    { key: "projets", href: `/${locale}/projets` },
    { key: "composers", href: `/${locale}/compositeurs` },
    { key: "blog", href: `/${locale}/blog` },
    { key: "contact", href: `/${locale}/contact` },
  ].filter((link) => link.key !== "blog");

export function SiteHeader({
  locale,
  navigation,
  language,
  menu,
}: SiteHeaderProps) {
  const pathname = usePathname() || "/";
  const links = buildLinks(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { data: session } = useSession();

  // Check if user is an admin (with type assertion for custom fields)
  const user = session?.user as
    | {
        role?: string;
        image?: string | null;
        name?: string | null;
        email?: string;
      }
    | undefined;
  const isAdmin = user?.role === "ADMIN";

  // Hide header on admin routes
  if (pathname.includes("/admin")) {
    return null;
  }

  const closeMobile = () => {
    setMobileOpen(false);
  };

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
          {isAdmin ? (
            <Link
              href={`/${locale}/admin`}
              className="hidden lg:flex items-center gap-2 rounded-full border border-lime-300/50 bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-300 transition hover:border-lime-300 hover:bg-lime-300/20"
              aria-label="Admin panel"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? user.email ?? "Admin"}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-4 w-4" />
              )}
              <span className="max-w-[100px] truncate">
                {user?.name ?? user?.email?.split("@")[0]}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLoginOpen(true);
              }}
              className="hidden lg:flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/70 transition hover:border-lime-300 hover:text-lime-300"
              aria-label="Admin login"
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </button>
          )}
          <div className="hidden lg:block">
            <LanguageSwitcher locale={locale} dictionary={language} />
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileOpen((prev) => !prev);
            }}
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
          <div className="mt-4 flex flex-col gap-3">
            {isAdmin ? (
              <Link
                href={`/${locale}/admin`}
                className="flex items-center justify-center gap-2 rounded-full border border-lime-300/50 bg-lime-300/10 px-4 py-2 text-center text-lime-300 transition-colors hover:border-lime-300 hover:bg-lime-300/20"
                onClick={closeMobile}
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? user.email ?? "Admin"}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-4 h-4" />
                )}
                <span className="text-xs font-semibold">
                  {user?.name ?? user?.email?.split("@")[0]}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLoginOpen(true);
                  closeMobile();
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-center transition-colors hover:border-lime-300 hover:text-lime-300"
              >
                <Lock className="w-3 h-3" />
                <span className="text-xs font-semibold">Admin</span>
              </button>
            )}
            <div className="flex justify-end">
              <LanguageSwitcher locale={locale} dictionary={language} />
            </div>
          </div>
        </div>
      )}

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        locale={locale}
      />
    </header>
  );
}
