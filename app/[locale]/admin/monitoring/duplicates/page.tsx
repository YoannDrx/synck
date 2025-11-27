'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  AlertTriangleIcon,
  CameraIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FilterIcon,
  FolderIcon,
  ImageIcon,
  LinkIcon,
  MusicIcon,
  TagIcon,
  TrashIcon,
  UsersIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { fetchWithAuth } from '@/lib/fetch-with-auth'
import {
  type Severity,
  getSeverityBadgeColor,
  getSeverityBorderColor,
  getSeverityIconColor,
  getSeverityLabel,
} from '@/lib/severity-helpers'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type DuplicatesData = {
  assets: {
    duplicatesByPath: {
      path: string
      count: number
      severity: Severity
      reason: string
      assets: {
        id: string
        path: string
        alt: string | null
        width: number | null
        height: number | null
        createdAt: Date
        usageCount: number
      }[]
    }[]
    unusedAssets: {
      id: string
      path: string
      alt: string | null
      width: number | null
      height: number | null
      createdAt: Date
    }[]
    totalDuplicates: number
    totalUnused: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  works: {
    duplicatesBySlug: {
      identifier: string
      type: 'slug' | 'title'
      count: number
      severity: Severity
      reason: string
      works: {
        id: string
        slug: string
        translations: { locale: string; title: string }[]
        category: {
          id: string
          slug: string
          translations: { locale: string; name: string }[]
        }
        year: number | null
        createdAt: Date
      }[]
    }[]
    duplicatesByTitle: {
      identifier: string
      type: 'slug' | 'title'
      count: number
      severity: Severity
      reason: string
      works: {
        id: string
        slug: string
        translations: { locale: string; title: string }[]
        category: {
          id: string
          slug: string
          translations: { locale: string; name: string }[]
        }
        year: number | null
        createdAt: Date
      }[]
    }[]
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  artists: {
    duplicatesBySlug: {
      identifier: string
      type: 'slug' | 'name' | 'similar'
      count: number
      severity: Severity
      reason: string
      artists: {
        id: string
        slug: string
        translations: { locale: string; name: string }[]
        createdAt: Date
      }[]
    }[]
    duplicatesByName: {
      identifier: string
      type: 'slug' | 'name' | 'similar'
      count: number
      severity: Severity
      reason: string
      artists: {
        id: string
        slug: string
        translations: { locale: string; name: string }[]
        createdAt: Date
      }[]
    }[]
    duplicatesBySimilarName: {
      identifier: string
      type: 'slug' | 'name' | 'similar'
      count: number
      severity: Severity
      reason: string
      artists: {
        id: string
        slug: string
        translations: { locale: string; name: string }[]
        createdAt: Date
      }[]
    }[]
    integrityIssues: {
      id: string
      slug: string
      name: string
      issue: 'no_bio_fr' | 'no_bio_en' | 'no_bio_both' | 'no_photo' | 'no_links'
      severity: Severity
      reason: string
      createdAt: Date
    }[]
    totalDuplicates: number
    totalIntegrityIssues: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  categories: {
    duplicatesBySlug: {
      slug: string
      count: number
      severity: Severity
      reason: string
      categories: {
        id: string
        slug: string
        translations: { locale: string; name: string }[]
        createdAt: Date
      }[]
    }[]
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
  labels: {
    duplicatesBySlug: {
      slug: string
      count: number
      severity: Severity
      reason: string
      labels: {
        id: string
        slug: string
        translations: { locale: string; name: string }[]
        createdAt: Date
      }[]
    }[]
    totalDuplicates: number
    totalErrors: number
    totalWarnings: number
    totalInfo: number
  }
}

export default function DuplicatesMonitoringPage() {
  const params = useParams()
  const locale = (params.locale as string) ?? 'fr'
  const [data, setData] = useState<DuplicatesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assets')
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')

  useEffect(() => {
    const fetchDuplicates = async () => {
      try {
        setIsLoading(true)
        const res = await fetchWithAuth('/api/admin/monitoring/duplicates')

        if (!res.ok) {
          throw new Error('Failed to fetch duplicates')
        }

        const result = (await res.json()) as DuplicatesData
        setData(result)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching duplicates:', error)
        toast.error('Erreur lors du chargement des doublons')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDuplicates()
  }, [])

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const res = await fetchWithAuth(`/api/admin/assets/${assetId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete asset')
      }

      toast.success('Asset supprimé avec succès')
      // Refresh data
      window.location.reload()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting asset:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-white/50">Analyse en cours...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-400">Erreur lors du chargement des données</p>
      </div>
    )
  }

  const totalIssues =
    data.assets.totalDuplicates +
    data.assets.totalUnused +
    data.works.totalDuplicates +
    data.artists.totalDuplicates +
    data.artists.totalIntegrityIssues +
    data.categories.totalDuplicates +
    data.labels.totalDuplicates

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Monitoring des doublons</h1>
        <p className="mt-2 text-white/50">
          Détection et gestion des doublons dans la base de données
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Total problèmes</p>
                <p className="mt-2 text-3xl font-bold text-white">{totalIssues}</p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Erreurs</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {data.assets.totalErrors +
                    data.works.totalErrors +
                    data.artists.totalErrors +
                    data.categories.totalErrors +
                    data.labels.totalErrors}
                </p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400">Attention</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {data.assets.totalWarnings +
                    data.works.totalWarnings +
                    data.artists.totalWarnings +
                    data.categories.totalWarnings +
                    data.labels.totalWarnings}
                </p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400">Info</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {data.assets.totalInfo +
                    data.works.totalInfo +
                    data.artists.totalInfo +
                    data.categories.totalInfo +
                    data.labels.totalInfo}
                </p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Severity Filter */}
      <Card className="border-white/10 bg-black">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-white/50" />
              <span className="text-sm font-medium text-white/70">Filtrer par niveau:</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={severityFilter === 'all' ? 'default' : 'outline'}
                onClick={() => {
                  setSeverityFilter('all')
                }}
                className={
                  severityFilter === 'all'
                    ? 'bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]'
                    : 'border-white/20 text-white/70 hover:bg-white/5'
                }
              >
                Tout
              </Button>
              <Button
                size="sm"
                variant={severityFilter === 'error' ? 'default' : 'outline'}
                onClick={() => {
                  setSeverityFilter('error')
                }}
                className={
                  severityFilter === 'error'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'border-white/20 text-white/70 hover:bg-white/5'
                }
              >
                <AlertTriangleIcon className="mr-1 h-3 w-3" />
                Erreurs
              </Button>
              <Button
                size="sm"
                variant={severityFilter === 'warning' ? 'default' : 'outline'}
                onClick={() => {
                  setSeverityFilter('warning')
                }}
                className={
                  severityFilter === 'warning'
                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                    : 'border-white/20 text-white/70 hover:bg-white/5'
                }
              >
                <AlertTriangleIcon className="mr-1 h-3 w-3" />
                Attention
              </Button>
              <Button
                size="sm"
                variant={severityFilter === 'info' ? 'default' : 'outline'}
                onClick={() => {
                  setSeverityFilter('info')
                }}
                className={
                  severityFilter === 'info'
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    : 'border-white/20 text-white/70 hover:bg-white/5'
                }
              >
                <AlertTriangleIcon className="mr-1 h-3 w-3" />
                Info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b border-white/10 bg-transparent">
          <TabsTrigger
            value="assets"
            className="rounded-md border border-transparent bg-transparent text-white/70 data-[state=active]:border-[var(--brand-neon)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-neon)]"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Assets ({data.assets.totalDuplicates + data.assets.totalUnused})
          </TabsTrigger>
          <TabsTrigger
            value="works"
            className="rounded-md border border-transparent bg-transparent text-white/70 data-[state=active]:border-[var(--brand-neon)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-neon)]"
          >
            <MusicIcon className="mr-2 h-4 w-4" />
            Projets ({data.works.totalDuplicates})
          </TabsTrigger>
          <TabsTrigger
            value="composers"
            className="rounded-md border border-transparent bg-transparent text-white/70 data-[state=active]:border-[var(--brand-neon)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-neon)]"
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            Artistes ({data.artists.totalDuplicates + data.artists.totalIntegrityIssues})
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="rounded-md border border-transparent bg-transparent text-white/70 data-[state=active]:border-[var(--brand-neon)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-neon)]"
          >
            <FolderIcon className="mr-2 h-4 w-4" />
            Catégories ({data.categories.totalDuplicates})
          </TabsTrigger>
          <TabsTrigger
            value="labels"
            className="rounded-md border border-transparent bg-transparent text-white/70 data-[state=active]:border-[var(--brand-neon)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-neon)]"
          >
            <TagIcon className="mr-2 h-4 w-4" />
            Labels ({data.labels.totalDuplicates})
          </TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          {/* Duplicate Assets */}
          {data.assets.duplicatesByPath.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Assets en doublon (
                {
                  data.assets.duplicatesByPath.filter(
                    (d) => severityFilter === 'all' || d.severity === severityFilter
                  ).length
                }
                )
              </h2>
              <div className="space-y-4">
                {data.assets.duplicatesByPath
                  .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                  .map((duplicate) => (
                    <Card
                      key={duplicate.path}
                      className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <AlertTriangleIcon
                              className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                            />
                            {duplicate.count} doublons pour: {duplicate.path}
                          </CardTitle>
                          <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                            {getSeverityLabel(duplicate.severity)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {duplicate.assets.map((asset) => (
                            <div
                              key={asset.id}
                              className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                              {asset.width && asset.height && (
                                <div className="relative mb-3 aspect-video overflow-hidden rounded bg-white/10">
                                  <Image
                                    src={asset.path}
                                    alt={asset.alt ?? 'Asset'}
                                    width={asset.width}
                                    height={asset.height}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="space-y-2 text-sm">
                                <p className="text-white/70">
                                  ID:{' '}
                                  <span className="font-mono text-white">
                                    {asset.id.slice(0, 8)}...
                                  </span>
                                </p>
                                <p className="text-white/70">
                                  Utilisations:{' '}
                                  <Badge
                                    variant={asset.usageCount > 0 ? 'default' : 'destructive'}
                                    className="ml-1"
                                  >
                                    {asset.usageCount}
                                  </Badge>
                                </p>
                                <p className="text-white/70">
                                  Créé le: {formatDate(asset.createdAt)}
                                </p>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      window.open(asset.path, '_blank')
                                    }}
                                    className="gap-1 text-white/70 hover:text-white"
                                  >
                                    <ExternalLinkIcon className="h-3 w-3" />
                                    Voir
                                  </Button>
                                  {asset.usageCount === 0 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        void handleDeleteAsset(asset.id)
                                      }}
                                      className="gap-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                      Supprimer
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Unused Assets */}
          {data.assets.unusedAssets.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Assets non utilisés ({data.assets.unusedAssets.length})
              </h2>
              <Card className="border-orange-500/20 bg-black">
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {data.assets.unusedAssets.slice(0, 12).map((asset) => (
                      <div
                        key={asset.id}
                        className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-3"
                      >
                        {asset.width && asset.height && (
                          <div className="relative mb-2 aspect-video overflow-hidden rounded bg-white/10">
                            <Image
                              src={asset.path}
                              alt={asset.alt ?? 'Asset'}
                              width={asset.width}
                              height={asset.height}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <p className="truncate text-xs text-white/70">
                          {asset.path.split('/').pop()}
                        </p>
                        <div className="mt-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              window.open(asset.path, '_blank')
                            }}
                            className="h-7 flex-1 gap-1 text-xs text-white/70 hover:text-white"
                          >
                            <ExternalLinkIcon className="h-3 w-3" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              void handleDeleteAsset(asset.id)
                            }}
                            className="h-7 flex-1 gap-1 text-xs text-red-400 hover:bg-red-500/10"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.assets.unusedAssets.length > 12 && (
                    <p className="mt-4 text-center text-sm text-white/50">
                      ... et {data.assets.unusedAssets.length - 12} autres
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {data.assets.duplicatesByPath.length === 0 && data.assets.unusedAssets.length === 0 && (
            <Card className="border-white/10 bg-black">
              <CardContent className="p-12 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-white/20" />
                <p className="mt-4 text-white/50">Aucun problème détecté pour les assets</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Works Tab */}
        <TabsContent value="works" className="space-y-6">
          {data.works.duplicatesBySlug.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Doublons par slug (
                {
                  data.works.duplicatesBySlug.filter(
                    (d) => severityFilter === 'all' || d.severity === severityFilter
                  ).length
                }
                )
              </h2>
              <div className="space-y-4">
                {data.works.duplicatesBySlug
                  .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                  .map((duplicate) => (
                    <Card
                      key={duplicate.identifier}
                      className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <AlertTriangleIcon
                              className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                            />
                            {duplicate.count} projets avec le slug "{duplicate.identifier}"
                          </CardTitle>
                          <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                            {getSeverityLabel(duplicate.severity)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {duplicate.works.map((work) => (
                            <div
                              key={work.id}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                              <div>
                                <p className="font-medium text-white">
                                  {work.translations.find((t) => t.locale === 'fr')?.title ??
                                    work.slug}
                                </p>
                                <p className="mt-1 text-sm text-white/50">
                                  Catégorie:{' '}
                                  {work.category.translations.find((t) => t.locale === 'fr')
                                    ?.name ?? 'N/A'}{' '}
                                  • Année: {work.year ?? 'N/A'} • Créé le:{' '}
                                  {formatDate(work.createdAt)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  window.open(`/${locale}/admin/projets/${work.id}`, '_blank')
                                }}
                                className="gap-1 text-white/70 hover:text-white"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                                Voir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {data.works.duplicatesByTitle.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Doublons par titre (
                {
                  data.works.duplicatesByTitle.filter(
                    (d) => severityFilter === 'all' || d.severity === severityFilter
                  ).length
                }
                )
              </h2>
              <div className="space-y-4">
                {data.works.duplicatesByTitle
                  .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                  .map((duplicate) => (
                    <Card
                      key={duplicate.identifier}
                      className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <AlertTriangleIcon
                              className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                            />
                            {duplicate.count} projets avec un titre similaire
                          </CardTitle>
                          <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                            {getSeverityLabel(duplicate.severity)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {duplicate.works.map((work) => (
                            <div
                              key={work.id}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                              <div>
                                <p className="font-medium text-white">
                                  {work.translations.find((t) => t.locale === 'fr')?.title ??
                                    work.slug}
                                </p>
                                <p className="mt-1 text-sm text-white/50">
                                  Slug: {work.slug} • Catégorie:{' '}
                                  {work.category.translations.find((t) => t.locale === 'fr')
                                    ?.name ?? 'N/A'}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  window.open(`/${locale}/admin/projets/${work.id}`, '_blank')
                                }}
                                className="gap-1 text-white/70 hover:text-white"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                                Voir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {data.works.duplicatesBySlug.length === 0 &&
            data.works.duplicatesByTitle.length === 0 && (
              <Card className="border-white/10 bg-black">
                <CardContent className="p-12 text-center">
                  <MusicIcon className="mx-auto h-12 w-12 text-white/20" />
                  <p className="mt-4 text-white/50">Aucun doublon détecté pour les projets</p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        {/* Composers Tab */}
        <TabsContent value="composers" className="space-y-6">
          {data.artists.duplicatesBySlug.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Doublons par slug (
                {
                  data.artists.duplicatesBySlug.filter(
                    (d) => severityFilter === 'all' || d.severity === severityFilter
                  ).length
                }
                )
              </h2>
              <div className="space-y-4">
                {data.artists.duplicatesBySlug
                  .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                  .map((duplicate) => (
                    <Card
                      key={duplicate.identifier}
                      className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <AlertTriangleIcon
                              className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                            />
                            {duplicate.count} artistes avec le slug "{duplicate.identifier}"
                          </CardTitle>
                          <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                            {getSeverityLabel(duplicate.severity)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {duplicate.artists.map((artist) => (
                            <div
                              key={artist.id}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                              <div>
                                <p className="font-medium text-white">
                                  {artist.translations.find((t) => t.locale === 'fr')?.name ??
                                    artist.slug}
                                </p>
                                <p className="mt-1 text-sm text-white/50">
                                  Créé le: {formatDate(artist.createdAt)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  window.open(`/${locale}/admin/artistes/${artist.id}`, '_blank')
                                }}
                                className="gap-1 text-white/70 hover:text-white"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                                Voir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {data.artists.duplicatesByName.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Doublons par nom (
                {
                  data.artists.duplicatesByName.filter(
                    (d) => severityFilter === 'all' || d.severity === severityFilter
                  ).length
                }
                )
              </h2>
              <div className="space-y-4">
                {data.artists.duplicatesByName
                  .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                  .map((duplicate) => (
                    <Card
                      key={duplicate.identifier}
                      className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <AlertTriangleIcon
                              className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                            />
                            {duplicate.count} artistes avec un nom similaire
                          </CardTitle>
                          <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                            {getSeverityLabel(duplicate.severity)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {duplicate.artists.map((artist) => (
                            <div
                              key={artist.id}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                              <div>
                                <p className="font-medium text-white">
                                  {artist.translations.find((t) => t.locale === 'fr')?.name ??
                                    artist.slug}
                                </p>
                                <p className="mt-1 text-sm text-white/50">Slug: {artist.slug}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  window.open(`/${locale}/admin/artistes/${artist.id}`, '_blank')
                                }}
                                className="gap-1 text-white/70 hover:text-white"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                                Voir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Similar Names (normalized) */}
          {data.artists.duplicatesBySimilarName.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Noms similaires (
                {
                  data.artists.duplicatesBySimilarName.filter(
                    (d) => severityFilter === 'all' || d.severity === severityFilter
                  ).length
                }
                )
              </h2>
              <div className="space-y-4">
                {data.artists.duplicatesBySimilarName
                  .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                  .map((duplicate) => (
                    <Card
                      key={duplicate.identifier}
                      className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <AlertTriangleIcon
                              className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                            />
                            {duplicate.count} artistes avec des noms similaires
                          </CardTitle>
                          <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                            {getSeverityLabel(duplicate.severity)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {duplicate.artists.map((artist) => (
                            <div
                              key={artist.id}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                              <div>
                                <p className="font-medium text-white">
                                  {artist.translations.find((t) => t.locale === 'fr')?.name ??
                                    artist.slug}
                                </p>
                                <p className="mt-1 text-sm text-white/50">Slug: {artist.slug}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  window.open(`/${locale}/admin/artistes/${artist.id}`, '_blank')
                                }}
                                className="gap-1 text-white/70 hover:text-white"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                                Voir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Integrity Issues */}
          {data.artists.integrityIssues.filter(
            (i) => severityFilter === 'all' || i.severity === severityFilter
          ).length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Problèmes d&apos;intégrité (
                {
                  data.artists.integrityIssues.filter(
                    (i) => severityFilter === 'all' || i.severity === severityFilter
                  ).length
                }
                )
              </h2>

              {/* Group by issue type */}
              {/* No Bio */}
              {data.artists.integrityIssues.filter(
                (i) =>
                  (severityFilter === 'all' || i.severity === severityFilter) &&
                  (i.issue === 'no_bio_both' || i.issue === 'no_bio_fr' || i.issue === 'no_bio_en')
              ).length > 0 && (
                <Card className="mb-4 border-orange-500/20 bg-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <FileTextIcon className="h-5 w-5 text-orange-400" />
                      Biographies manquantes (
                      {
                        data.artists.integrityIssues.filter(
                          (i) =>
                            (severityFilter === 'all' || i.severity === severityFilter) &&
                            (i.issue === 'no_bio_both' ||
                              i.issue === 'no_bio_fr' ||
                              i.issue === 'no_bio_en')
                        ).length
                      }
                      )
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.artists.integrityIssues
                        .filter(
                          (i) =>
                            (severityFilter === 'all' || i.severity === severityFilter) &&
                            (i.issue === 'no_bio_both' ||
                              i.issue === 'no_bio_fr' ||
                              i.issue === 'no_bio_en')
                        )
                        .map((issue) => (
                          <div
                            key={`${issue.id}-${issue.issue}`}
                            className={`flex items-center justify-between rounded-lg border ${getSeverityBorderColor(issue.severity)} bg-white/5 p-3`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={getSeverityBadgeColor(issue.severity)}>
                                {issue.issue === 'no_bio_both'
                                  ? 'FR + EN'
                                  : issue.issue === 'no_bio_fr'
                                    ? 'FR'
                                    : 'EN'}
                              </Badge>
                              <div>
                                <p className="font-medium text-white">{issue.name}</p>
                                <p className="text-sm text-white/50">{issue.reason}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                window.open(`/${locale}/admin/artistes/${issue.id}`, '_blank')
                              }}
                              className="gap-1 text-white/70 hover:text-white"
                            >
                              <ExternalLinkIcon className="h-4 w-4" />
                              Éditer
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Photo */}
              {data.artists.integrityIssues.filter(
                (i) =>
                  (severityFilter === 'all' || i.severity === severityFilter) &&
                  i.issue === 'no_photo'
              ).length > 0 && (
                <Card className="mb-4 border-orange-500/20 bg-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <CameraIcon className="h-5 w-5 text-orange-400" />
                      Photos manquantes (
                      {
                        data.artists.integrityIssues.filter(
                          (i) =>
                            (severityFilter === 'all' || i.severity === severityFilter) &&
                            i.issue === 'no_photo'
                        ).length
                      }
                      )
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {data.artists.integrityIssues
                        .filter(
                          (i) =>
                            (severityFilter === 'all' || i.severity === severityFilter) &&
                            i.issue === 'no_photo'
                        )
                        .map((issue) => (
                          <div
                            key={`${issue.id}-${issue.issue}`}
                            className="flex items-center justify-between rounded-lg border border-orange-500/20 bg-white/5 p-3"
                          >
                            <p className="font-medium text-white">{issue.name}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                window.open(`/${locale}/admin/artistes/${issue.id}`, '_blank')
                              }}
                              className="gap-1 text-white/70 hover:text-white"
                            >
                              <ExternalLinkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Links */}
              {data.artists.integrityIssues.filter(
                (i) =>
                  (severityFilter === 'all' || i.severity === severityFilter) &&
                  i.issue === 'no_links'
              ).length > 0 && (
                <Card className="mb-4 border-blue-500/20 bg-black">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <LinkIcon className="h-5 w-5 text-blue-400" />
                      Liens manquants (
                      {
                        data.artists.integrityIssues.filter(
                          (i) =>
                            (severityFilter === 'all' || i.severity === severityFilter) &&
                            i.issue === 'no_links'
                        ).length
                      }
                      )
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {data.artists.integrityIssues
                        .filter(
                          (i) =>
                            (severityFilter === 'all' || i.severity === severityFilter) &&
                            i.issue === 'no_links'
                        )
                        .map((issue) => (
                          <div
                            key={`${issue.id}-${issue.issue}`}
                            className="flex items-center justify-between rounded-lg border border-blue-500/20 bg-white/5 p-3"
                          >
                            <p className="font-medium text-white">{issue.name}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                window.open(`/${locale}/admin/artistes/${issue.id}`, '_blank')
                              }}
                              className="gap-1 text-white/70 hover:text-white"
                            >
                              <ExternalLinkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {data.artists.duplicatesBySlug.length === 0 &&
            data.artists.duplicatesByName.length === 0 &&
            data.artists.duplicatesBySimilarName.length === 0 &&
            data.artists.integrityIssues.length === 0 && (
              <Card className="border-white/10 bg-black">
                <CardContent className="p-12 text-center">
                  <UsersIcon className="mx-auto h-12 w-12 text-white/20" />
                  <p className="mt-4 text-white/50">Aucun problème détecté pour les artistes</p>
                </CardContent>
              </Card>
            )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {data.categories.duplicatesBySlug.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 ? (
            <div className="space-y-4">
              {data.categories.duplicatesBySlug
                .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                .map((duplicate) => (
                  <Card
                    key={duplicate.slug}
                    className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <AlertTriangleIcon
                            className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                          />
                          {duplicate.count} catégories avec le slug "{duplicate.slug}"
                        </CardTitle>
                        <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                          {getSeverityLabel(duplicate.severity)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {duplicate.categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                          >
                            <div>
                              <p className="font-medium text-white">
                                {category.translations.find((t) => t.locale === 'fr')?.name ??
                                  category.slug}
                              </p>
                              <p className="mt-1 text-sm text-white/50">
                                Créé le: {formatDate(category.createdAt)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                window.open(`/${locale}/admin/categories/${category.id}`, '_blank')
                              }}
                              className="gap-1 text-white/70 hover:text-white"
                            >
                              <ExternalLinkIcon className="h-4 w-4" />
                              Voir
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="border-white/10 bg-black">
              <CardContent className="p-12 text-center">
                <FolderIcon className="mx-auto h-12 w-12 text-white/20" />
                <p className="mt-4 text-white/50">Aucun doublon détecté pour les catégories</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Labels Tab */}
        <TabsContent value="labels" className="space-y-6">
          {data.labels.duplicatesBySlug.filter(
            (d) => severityFilter === 'all' || d.severity === severityFilter
          ).length > 0 ? (
            <div className="space-y-4">
              {data.labels.duplicatesBySlug
                .filter((d) => severityFilter === 'all' || d.severity === severityFilter)
                .map((duplicate) => (
                  <Card
                    key={duplicate.slug}
                    className={`${getSeverityBorderColor(duplicate.severity)} bg-black`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <AlertTriangleIcon
                            className={`h-5 w-5 ${getSeverityIconColor(duplicate.severity)}`}
                          />
                          {duplicate.count} labels avec le slug "{duplicate.slug}"
                        </CardTitle>
                        <Badge className={getSeverityBadgeColor(duplicate.severity)}>
                          {getSeverityLabel(duplicate.severity)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-white/60">{duplicate.reason}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {duplicate.labels.map((label) => (
                          <div
                            key={label.id}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                          >
                            <div>
                              <p className="font-medium text-white">
                                {label.translations.find((t) => t.locale === 'fr')?.name ??
                                  label.slug}
                              </p>
                              <p className="mt-1 text-sm text-white/50">
                                Créé le: {formatDate(label.createdAt)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                window.open(`/${locale}/admin/labels/${label.id}`, '_blank')
                              }}
                              className="gap-1 text-white/70 hover:text-white"
                            >
                              <ExternalLinkIcon className="h-4 w-4" />
                              Voir
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="border-white/10 bg-black">
              <CardContent className="p-12 text-center">
                <TagIcon className="mx-auto h-12 w-12 text-white/20" />
                <p className="mt-4 text-white/50">Aucun doublon détecté pour les labels</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
