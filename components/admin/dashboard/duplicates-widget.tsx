'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { AlertCircle, AlertTriangleIcon, ArrowRightIcon, InfoIcon, XCircleIcon } from 'lucide-react'

import { fetchWithAuth } from '@/lib/fetch-with-auth'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type DuplicatesSummary = {
  assets: {
    totalDuplicates: number
    totalUnused: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  works: {
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  artists: {
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  categories: {
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  labels: {
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
}

export function DuplicatesWidget({ locale }: { locale: string }) {
  const [data, setData] = useState<DuplicatesSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDuplicates = async () => {
      try {
        setIsLoading(true)
        const res = await fetchWithAuth('/api/admin/monitoring/duplicates')

        if (!res.ok) {
          throw new Error('Failed to fetch duplicates')
        }

        const result = (await res.json()) as DuplicatesSummary
        setData(result)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching duplicates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDuplicates()
  }, [])

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangleIcon className="h-5 w-5 text-orange-400" />
            Monitoring des doublons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/50">Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const totalIssues =
    data.assets.totalDuplicates +
    data.assets.totalUnused +
    data.works.totalDuplicates +
    data.artists.totalDuplicates +
    data.categories.totalDuplicates +
    data.labels.totalDuplicates

  const totalErrors =
    data.assets.totalErrors +
    data.works.totalErrors +
    data.artists.totalErrors +
    data.categories.totalErrors +
    data.labels.totalErrors

  const totalWarnings =
    data.assets.totalWarnings +
    data.works.totalWarnings +
    data.artists.totalWarnings +
    data.categories.totalWarnings +
    data.labels.totalWarnings

  const totalInfo =
    data.assets.totalInfo +
    data.works.totalInfo +
    data.artists.totalInfo +
    data.categories.totalInfo +
    data.labels.totalInfo

  if (totalIssues === 0) {
    return (
      <Card className="[border-color:var(--brand-neon,_#d5ff0a)]/20 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangleIcon className="h-5 w-5 [color:var(--brand-neon)]" />
            Monitoring des doublons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm [color:var(--brand-neon)]">
            ✓ Aucun problème détecté dans la base de données
          </p>
        </CardContent>
      </Card>
    )
  }

  // Determine the most severe issue to set border color
  const borderColor =
    totalErrors > 0
      ? 'border-red-500/20'
      : totalWarnings > 0
        ? 'border-orange-500/20'
        : 'border-blue-500/20'

  return (
    <Card className={`${borderColor} bg-black`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangleIcon className="h-5 w-5 text-orange-400" />
            Monitoring des doublons
          </div>
          <Badge variant="destructive" className="bg-orange-500/20 text-orange-400">
            {totalIssues} problème{totalIssues > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Severity breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {totalErrors > 0 && (
            <div className="flex flex-col items-center rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <p className="mt-1 text-2xl font-bold text-red-400">{totalErrors}</p>
              <p className="text-xs text-red-400/70">Erreur{totalErrors > 1 ? 's' : ''}</p>
            </div>
          )}
          {totalWarnings > 0 && (
            <div className="flex flex-col items-center rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <p className="mt-1 text-2xl font-bold text-orange-400">{totalWarnings}</p>
              <p className="text-xs text-orange-400/70">Attention</p>
            </div>
          )}
          {totalInfo > 0 && (
            <div className="flex flex-col items-center rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
              <InfoIcon className="h-5 w-5 text-blue-400" />
              <p className="mt-1 text-2xl font-bold text-blue-400">{totalInfo}</p>
              <p className="text-xs text-blue-400/70">Info</p>
            </div>
          )}
        </div>

        {/* Detailed breakdown by type */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white/50 uppercase">Détails par type</p>

          {data.works.totalDuplicates > 0 && (
            <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Projets</span>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {data.works.totalDuplicates}
                </Badge>
              </div>
              <div className="flex gap-2 text-xs">
                {data.works.totalErrors > 0 && (
                  <span className="text-red-400">
                    {data.works.totalErrors} erreur
                    {data.works.totalErrors > 1 ? 's' : ''}
                  </span>
                )}
                {data.works.totalWarnings > 0 && (
                  <span className="text-orange-400">{data.works.totalWarnings} attention</span>
                )}
                {data.works.totalInfo > 0 && (
                  <span className="text-blue-400">{data.works.totalInfo} info</span>
                )}
              </div>
              <p className="text-xs text-white/50">Slugs ou titres en doublon</p>
            </div>
          )}

          {(data.assets.totalDuplicates > 0 || data.assets.totalUnused > 0) && (
            <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Assets</span>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {data.assets.totalDuplicates + data.assets.totalUnused}
                </Badge>
              </div>
              <div className="flex gap-2 text-xs">
                {data.assets.totalErrors > 0 && (
                  <span className="text-red-400">
                    {data.assets.totalErrors} erreur
                    {data.assets.totalErrors > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50">Fichiers dupliqués ou inutilisés</p>
            </div>
          )}

          {data.artists.totalDuplicates > 0 && (
            <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Artistes</span>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {data.artists.totalDuplicates}
                </Badge>
              </div>
              <div className="flex gap-2 text-xs">
                {data.artists.totalErrors > 0 && (
                  <span className="text-red-400">
                    {data.artists.totalErrors} erreur
                    {data.artists.totalErrors > 1 ? 's' : ''}
                  </span>
                )}
                {data.artists.totalWarnings > 0 && (
                  <span className="text-orange-400">{data.artists.totalWarnings} attention</span>
                )}
                {data.artists.totalInfo > 0 && (
                  <span className="text-blue-400">{data.artists.totalInfo} info</span>
                )}
              </div>
              <p className="text-xs text-white/50">Slugs ou noms en doublon</p>
            </div>
          )}

          {data.categories.totalDuplicates > 0 && (
            <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Catégories</span>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {data.categories.totalDuplicates}
                </Badge>
              </div>
              <div className="flex gap-2 text-xs">
                {data.categories.totalErrors > 0 && (
                  <span className="text-red-400">
                    {data.categories.totalErrors} erreur
                    {data.categories.totalErrors > 1 ? 's' : ''}
                  </span>
                )}
                {data.categories.totalWarnings > 0 && (
                  <span className="text-orange-400">{data.categories.totalWarnings} attention</span>
                )}
                {data.categories.totalInfo > 0 && (
                  <span className="text-blue-400">{data.categories.totalInfo} info</span>
                )}
              </div>
              <p className="text-xs text-white/50">Slugs en doublon</p>
            </div>
          )}

          {data.labels.totalDuplicates > 0 && (
            <div className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Labels</span>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {data.labels.totalDuplicates}
                </Badge>
              </div>
              <div className="flex gap-2 text-xs">
                {data.labels.totalErrors > 0 && (
                  <span className="text-red-400">
                    {data.labels.totalErrors} erreur
                    {data.labels.totalErrors > 1 ? 's' : ''}
                  </span>
                )}
                {data.labels.totalWarnings > 0 && (
                  <span className="text-orange-400">{data.labels.totalWarnings} attention</span>
                )}
                {data.labels.totalInfo > 0 && (
                  <span className="text-blue-400">{data.labels.totalInfo} info</span>
                )}
              </div>
              <p className="text-xs text-white/50">Slugs en doublon</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/${locale}/admin/monitoring/duplicates`}>
          <Button
            variant="outline"
            className="w-full gap-2 [border-color:var(--brand-neon,_#d5ff0a)]/30 [color:var(--brand-neon)] hover:[background-color:var(--brand-neon,_#d5ff0a)]/10"
          >
            Voir tous les doublons
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
