'use client'

import { useEffect, useState } from 'react'

import type { ExportFormat, ExportStatus, ExportType } from '@prisma/client'

import {
  CheckCircleIcon,
  ClockIcon,
  DatabaseIcon,
  DownloadIcon,
  EyeIcon,
  FileJsonIcon,
  FolderIcon,
  ImageIcon,
  MusicIcon,
  TagIcon,
  UsersIcon,
  XCircleIcon,
} from 'lucide-react'

import { fetchWithAuth } from '@/lib/fetch-with-auth'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ExportHistoryItem = {
  id: string
  type: ExportType
  format: ExportFormat
  status: ExportStatus
  entityCount: number | null
  fileSize: number | null
  errorMessage: string | null
  downloadUrl: string | null
  createdAt: string
  completedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
}

export default function ExportHistoryPage() {
  const [history, setHistory] = useState<ExportHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const res = await fetchWithAuth('/api/admin/exports/history')

        if (!res.ok) {
          throw new Error('Failed to fetch export history')
        }

        const data = (await res.json()) as ExportHistoryItem[]
        setHistory(data)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching export history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchHistory()
  }, [])

  const getTypeIcon = (type: ExportType) => {
    switch (type) {
      case 'ASSETS':
        return ImageIcon
      case 'WORKS':
        return MusicIcon
      case 'ARTISTS':
        return UsersIcon
      case 'CATEGORIES':
        return FolderIcon
      case 'LABELS':
        return TagIcon
      case 'ALL':
        return DatabaseIcon
      default:
        return FileJsonIcon
    }
  }

  const getTypeLabel = (type: ExportType) => {
    switch (type) {
      case 'ASSETS':
        return 'Assets'
      case 'WORKS':
        return 'Projets'
      case 'ARTISTS':
        return 'Artistes'
      case 'CATEGORIES':
        return 'Catégories'
      case 'LABELS':
        return 'Labels'
      case 'ALL':
        return 'Toutes les données'
      default:
        return type
    }
  }

  const getStatusColor = (status: ExportStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'FAILED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'PENDING':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default:
        return 'bg-white/10 text-white border-white/20'
    }
  }

  const getStatusIcon = (status: ExportStatus) => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircleIcon
      case 'FAILED':
        return XCircleIcon
      case 'PENDING':
        return ClockIcon
      default:
        return ClockIcon
    }
  }

  const getStatusLabel = (status: ExportStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'Réussi'
      case 'FAILED':
        return 'Échoué'
      case 'PENDING':
        return 'En cours'
      default:
        return status
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${String(bytes)} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const getDuration = (createdAt: string, completedAt: string | null) => {
    if (!completedAt) return 'N/A'
    const start = new Date(createdAt).getTime()
    const end = new Date(completedAt).getTime()
    const duration = (end - start) / 1000 // en secondes
    if (duration < 1) return '< 1s'
    if (duration < 60) return `${duration.toFixed(1)}s`
    return `${(duration / 60).toFixed(1)}min`
  }

  const handleDownload = async (item: ExportHistoryItem) => {
    try {
      const res = await fetchWithAuth(`/api/admin/exports/history/${item.id}`)

      if (!res.ok) {
        throw new Error('Failed to fetch export data')
      }

      const result = (await res.json()) as {
        data: unknown
        format: string
        type: string
      }

      // Créer le fichier à télécharger
      const filename = `export-${result.type.toLowerCase()}-${new Date(item.createdAt).toISOString().split('T')[0]}.${result.format.toLowerCase()}`
      const content = JSON.stringify(result.data, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)

      // Déclencher le téléchargement
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error downloading export:', error)
      alert("Erreur lors du téléchargement de l'export")
    }
  }

  const handleView = async (item: ExportHistoryItem) => {
    try {
      const res = await fetchWithAuth(`/api/admin/exports/history/${item.id}`)

      if (!res.ok) {
        throw new Error('Failed to fetch export data')
      }

      const result = (await res.json()) as { data: unknown }

      // Ouvrir les données dans un nouvel onglet
      const content = JSON.stringify(result.data, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error viewing export:', error)
      alert("Erreur lors de l'affichage de l'export")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-white/50">Chargement de l'historique...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Historique des exports</h1>
        <p className="mt-2 text-white/50">Historique de tous les exports de données effectués</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Total exports</p>
                <p className="mt-2 text-3xl font-bold text-white">{history.length}</p>
              </div>
              <DownloadIcon className="h-8 w-8 text-[var(--brand-neon)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Réussis</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {history.filter((h) => h.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Échoués</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {history.filter((h) => h.status === 'FAILED').length}
                </p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Données exportées</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {history.reduce((sum, h) => sum + (h.entityCount ?? 0), 0).toLocaleString()}
                </p>
              </div>
              <DatabaseIcon className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export History Table */}
      <Card className="border-white/10 bg-black">
        <CardHeader>
          <CardTitle className="text-white">Historique des exports</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <DownloadIcon className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-4 text-white/50">Aucun export effectué pour le moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Type</TableHead>
                    <TableHead className="text-white/70">Format</TableHead>
                    <TableHead className="text-white/70">Statut</TableHead>
                    <TableHead className="text-white/70">Entités</TableHead>
                    <TableHead className="text-white/70">Taille</TableHead>
                    <TableHead className="text-white/70">Durée</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Utilisateur</TableHead>
                    <TableHead className="text-right text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => {
                    const TypeIcon = getTypeIcon(item.type)
                    const StatusIcon = getStatusIcon(item.status)

                    return (
                      <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-[var(--brand-neon)]" />
                            <span className="font-medium text-white">
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-white/20 bg-white/5 text-white"
                          >
                            {item.format}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {getStatusLabel(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {item.entityCount?.toLocaleString() ?? 'N/A'}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatFileSize(item.fileSize)}
                        </TableCell>
                        <TableCell className="text-white">
                          {getDuration(item.createdAt, item.completedAt)}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-white/70">
                          {item.user.name ?? item.user.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === 'COMPLETED' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    void handleView(item)
                                  }}
                                  className="h-8 gap-1 text-[var(--brand-neon)] hover:bg-[var(--brand-neon)]/10 hover:text-[var(--brand-neon)]"
                                  title="Voir l'export"
                                >
                                  <EyeIcon className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    void handleDownload(item)
                                  }}
                                  className="h-8 gap-1 text-[var(--brand-neon)] hover:bg-[var(--brand-neon)]/10 hover:text-[var(--brand-neon)]"
                                  title="Télécharger l'export"
                                >
                                  <DownloadIcon className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {item.status === 'FAILED' && item.errorMessage && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                title={item.errorMessage}
                              >
                                Erreur
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
