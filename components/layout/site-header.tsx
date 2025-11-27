'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Lock, UserCircle } from 'lucide-react'

import { useSession } from '@/lib/auth-client'
import type { Locale } from '@/lib/i18n-config'

import { LoginDialog } from '@/components/auth/login-dialog'
import { LanguageSwitcher } from '@/components/layout/language-switcher'

import type { Dictionary, LanguageSwitchDictionary } from '@/types/dictionary'

type SiteHeaderProps = {
  locale: Locale
  navigation: Dictionary['nav']
  language: LanguageSwitchDictionary
  menu: {
    open: string
    close: string
  }
}

const buildLinks = (locale: Locale) =>
  [
    { key: 'home', href: `/${locale}` },
    { key: 'expertises', href: `/${locale}/expertises` },
    { key: 'projets', href: `/${locale}/projets` },
    { key: 'artists', href: `/${locale}/artistes` },
    { key: 'blog', href: `/${locale}/blog` },
    { key: 'contact', href: `/${locale}/contact` },
  ].filter((link) => link.key !== 'blog')

export function SiteHeader({ locale, navigation, language, menu }: SiteHeaderProps) {
  const pathname = usePathname() || '/'
  const links = buildLinks(locale)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const { data: session } = useSession()

  // Check if user is an admin (with type assertion for custom fields)
  const user = session?.user as
    | {
        role?: string
        image?: string | null
        name?: string | null
        email?: string
      }
    | undefined
  const isAdmin = user?.role === 'ADMIN'

  // Hide header on admin routes
  if (pathname.includes('/admin')) {
    return null
  }

  const closeMobile = () => {
    setMobileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-16">
        <Link
          href={`/${locale}`}
          className="text-xs font-semibold tracking-[0.4em] text-white/80 uppercase transition-colors hover:text-[var(--brand-neon)]"
        >
          SYNCK
        </Link>

        <nav className="hidden flex-wrap items-center gap-4 text-[0.65rem] font-bold tracking-[0.35em] uppercase lg:flex">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`transition-colors hover:text-[var(--brand-neon)] ${
                pathname === link.href ? 'text-[var(--brand-neon)]' : 'text-white/60'
              }`}
            >
              {navigation[link.key as keyof Dictionary['nav']]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Link
              href={`/${locale}/admin`}
              className="hidden items-center gap-2 rounded-full border border-[var(--brand-neon)]/50 bg-[var(--brand-neon)]/10 px-3 py-2 text-xs font-semibold text-[var(--brand-neon)] transition hover:border-[var(--brand-neon)] hover:bg-[var(--brand-neon)]/20 lg:flex"
              aria-label="Admin panel"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? user.email ?? 'Admin'}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-4 w-4" />
              )}
              <span className="max-w-[100px] truncate">
                {user?.name ?? user?.email?.split('@')[0]}
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLoginOpen(true)
              }}
              className="hidden items-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-bold tracking-[0.3em] text-white/70 uppercase transition hover:border-[var(--brand-neon)] hover:text-[var(--brand-neon)] lg:flex"
              aria-label="Admin login"
            >
              <Lock className="h-3 w-3" />
              <span>Admin</span>
            </button>
          )}
          <div className="hidden lg:block">
            <LanguageSwitcher locale={locale} dictionary={language} />
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileOpen((prev) => !prev)
            }}
            className="rounded-full border border-white/25 px-3 py-2 text-xs font-bold tracking-[0.4em] text-white/70 uppercase transition hover:text-[var(--brand-neon)] lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? menu.close.toUpperCase() : menu.open.toUpperCase()}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/90 px-4 pt-4 pb-6 text-xs tracking-[0.3em] text-white/70 uppercase lg:hidden">
          <nav className="flex flex-col gap-3 font-semibold">
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`rounded-full border border-white/20 px-4 py-2 text-center transition-colors hover:border-[var(--brand-neon)] hover:text-[var(--brand-neon)] ${
                  pathname === link.href
                    ? 'border-[var(--brand-neon)] text-[var(--brand-neon)]'
                    : ''
                }`}
                onClick={closeMobile}
              >
                {navigation[link.key as keyof Dictionary['nav']]}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            {isAdmin ? (
              <Link
                href={`/${locale}/admin`}
                className="flex items-center justify-center gap-2 rounded-full border border-[var(--brand-neon)]/50 bg-[var(--brand-neon)]/10 px-4 py-2 text-center text-[var(--brand-neon)] transition-colors hover:border-[var(--brand-neon)] hover:bg-[var(--brand-neon)]/20"
                onClick={closeMobile}
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? user.email ?? 'Admin'}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-4 w-4" />
                )}
                <span className="text-xs font-semibold">
                  {user?.name ?? user?.email?.split('@')[0]}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLoginOpen(true)
                  closeMobile()
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2 text-center transition-colors hover:border-[var(--brand-neon)] hover:text-[var(--brand-neon)]"
              >
                <Lock className="h-3 w-3" />
                <span className="text-xs font-semibold">Admin</span>
              </button>
            )}
            <div className="flex justify-end">
              <LanguageSwitcher locale={locale} dictionary={language} />
            </div>
          </div>
        </div>
      )}

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} locale={locale} />
    </header>
  )
}
