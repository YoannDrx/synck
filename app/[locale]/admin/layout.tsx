import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getDictionary } from '@/lib/dictionaries'
import { i18n } from '@/lib/i18n-config'
import type { Locale } from '@/lib/i18n-config'
import { prisma } from '@/lib/prisma'

import { AdminShell } from '@/components/admin/layout/admin-shell'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params

  // Validate locale
  const locale = (
    i18n.locales.includes(rawLocale as Locale) ? rawLocale : i18n.defaultLocale
  ) as Locale

  // Verify authentication server-side
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  // Redirect if not authenticated, not admin or deactivated
  if (session?.user?.role !== 'ADMIN' || session.user.isActive === false) {
    redirect(`/${locale}`)
  }

  // Get dictionary for admin navigation
  const dict = await getDictionary(locale)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, name: true, email: true },
  })

  return (
    <AdminShell
      locale={locale}
      dict={dict.admin}
      userEmail={dbUser?.email ?? session.user.email}
      userName={dbUser?.name ?? session.user.name}
      avatarUrl={dbUser?.image ?? undefined}
    >
      {children}
    </AdminShell>
  )
}
