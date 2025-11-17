import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n-config'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirect root to default locale
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(`/${i18n.defaultLocale}`, request.url)
    )
  }

  // Check if locale is in pathname
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // Redirect to default locale
    return NextResponse.redirect(
      new URL(`/${i18n.defaultLocale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.pdf).*)'],
}
