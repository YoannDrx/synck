import { headers } from 'next/headers'
import Link from 'next/link'

import {
  ActivityIcon,
  AlertCircleIcon,
  FolderIcon,
  ImageIcon,
  MusicIcon,
  PlusIcon,
  TagIcon,
  UsersIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { DashboardCharts } from '@/components/admin/dashboard/dashboard-charts'
import { DuplicatesWidget } from '@/components/admin/dashboard/duplicates-widget'
import { StatCard } from '@/components/admin/dashboard/stat-card'

// Fetch stats server-side
async function getStats() {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol =
    headersList.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
  const baseUrl =
    host && protocol
      ? `${protocol}://${host}`
      : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  const cookie = headersList.get('cookie')

  try {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      cache: 'no-store', // Always get fresh data
      headers: cookie ? { cookie } : undefined, // Forward auth session
    })

    if (!res.ok) {
      throw new Error('Failed to fetch stats')
    }

    return await (res.json() as Promise<{
      works: { total: number; active: number; inactive: number }
      artists: { total: number; active: number; inactive: number }
      categories: { total: number; active: number }
      labels: { total: number; active: number }
      assets: { total: number; orphaned: number }
      lastActivity: {
        work: { id: string; title: string; createdAt: string } | null
        artist: { id: string; name: string; createdAt: string } | null
      }
    }>)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching stats:', error)
    // Return default values on error
    return {
      works: { total: 0, active: 0, inactive: 0 },
      artists: { total: 0, active: 0, inactive: 0 },
      categories: { total: 0, active: 0 },
      labels: { total: 0, active: 0 },
      assets: { total: 0, orphaned: 0 },
      lastActivity: { work: null, artist: null },
    }
  }
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const stats = await getStats()

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-white/50">Vue d'ensemble de votre contenu et activité</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projets"
          value={stats.works.total}
          description={`${String(stats.works.active)} actifs, ${String(stats.works.inactive)} inactifs`}
          icon={MusicIcon}
        />
        <StatCard
          title="Artistes"
          value={stats.artists.total}
          description={`${String(stats.artists.active)} actifs`}
          icon={UsersIcon}
        />
        <StatCard
          title="Catégories"
          value={stats.categories.total}
          description={`${String(stats.categories.active)} actives`}
          icon={FolderIcon}
        />
        <StatCard
          title="Labels"
          value={stats.labels.total}
          description={`${String(stats.labels.active)} actifs`}
          icon={TagIcon}
        />
      </div>

      {/* Analytics Charts */}
      <DashboardCharts />

      {/* Health & Quick Actions Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Site Health */}
        <Card className="border-[var(--brand-neon)]/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ActivityIcon className="h-5 w-5 text-[var(--brand-neon)]" />
              Santé du site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assets Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-white/50" />
                <span className="text-sm text-white/70">Assets totaux</span>
              </div>
              <Badge
                variant="outline"
                className="border-[var(--brand-neon)]/30 text-[var(--brand-neon)]"
              >
                {stats.assets.total}
              </Badge>
            </div>

            {/* Orphaned Assets Warning */}
            {stats.assets.orphaned > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-orange-500/10 p-3">
                <div className="flex items-center gap-2">
                  <AlertCircleIcon className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-orange-300">Assets orphelins</span>
                </div>
                <Badge variant="outline" className="border-orange-400/30 text-orange-400">
                  {stats.assets.orphaned}
                </Badge>
              </div>
            )}

            {/* Last Activity */}
            {(stats.lastActivity.work ?? stats.lastActivity.artist) && (
              <div className="space-y-2 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold text-white/50 uppercase">Dernière activité</p>
                {stats.lastActivity.work && (
                  <div className="text-sm">
                    <p className="text-white/70">
                      Projet:{' '}
                      <span className="font-medium text-white">
                        {stats.lastActivity.work.title}
                      </span>
                    </p>
                    <p className="text-xs text-white/50">
                      {formatDate(stats.lastActivity.work.createdAt)}
                    </p>
                  </div>
                )}
                {stats.lastActivity.artist && (
                  <div className="text-sm">
                    <p className="text-white/70">
                      Artiste:{' '}
                      <span className="font-medium text-white">
                        {stats.lastActivity.artist.name}
                      </span>
                    </p>
                    <p className="text-xs text-white/50">
                      {formatDate(stats.lastActivity.artist.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-[var(--brand-neon)]/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <PlusIcon className="h-5 w-5 text-[var(--brand-neon)]" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/${locale}/admin/projets/nouveau`} className="block">
              <Button
                className="w-full justify-start gap-2 bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]"
                size="lg"
              >
                <MusicIcon className="h-4 w-4" />
                Nouveau projet
              </Button>
            </Link>
            <Link href={`/${locale}/admin/compositeurs/nouveau`} className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-white/20 text-white hover:bg-white/5"
                size="lg"
              >
                <UsersIcon className="h-4 w-4" />
                Nouveau compositeur
              </Button>
            </Link>
            <Link href={`/${locale}/admin/medias`} className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-white/20 text-white hover:bg-white/5"
                size="lg"
              >
                <ImageIcon className="h-4 w-4" />
                Gérer les médias
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Duplicates Monitoring Widget */}
        <DuplicatesWidget locale={locale} />
      </div>
    </div>
  )
}
