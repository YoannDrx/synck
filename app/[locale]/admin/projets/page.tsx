'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { FilterIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { fetchWithAuth } from '@/lib/fetch-with-auth'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { BulkActionsToolbar } from '@/components/admin/bulk-actions-toolbar'
import { type Column, DataTable } from '@/components/admin/data-table/data-table'
import { SearchBar } from '@/components/admin/data-table/search-bar'
import { ExportButton } from '@/components/admin/export-button'
import { ImportDialog } from '@/components/admin/import-dialog'

type WorkApi = {
  id: string
  slug: string
  status?: string | null
  isActive?: boolean | null
  createdAt: string
  updatedAt: string
  translations?: { locale: string; title?: string | null }[]
  coverImage?: { path?: string | null; blurDataUrl?: string | null } | null
  category?: {
    id: string
    color?: string | null
    translations?: { locale: string; name?: string | null }[]
  } | null
  label?: {
    id: string
    translations?: { locale: string; name?: string | null }[]
  } | null
}

type Work = {
  id: string
  slug: string
  titleFr: string
  titleEn: string
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  coverImageUrl: string | null
  coverImageBlur: string | null
  category: {
    id: string
    nameFr: string
    nameEn: string
    color: string
  } | null
  label: { id: string; nameFr: string; nameEn: string } | null
}

type Category = {
  id: string
  nameFr: string
  nameEn: string
}

type TaxonomyApi = {
  id: string
  translations: { locale: string; name?: string | null }[]
  color?: string | null
}

type Label = {
  id: string
  nameFr: string
  nameEn: string
}

export default function ProjetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [locale, setLocale] = useState<string>('fr')
  const [works, setWorks] = useState<Work[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLabel, setSelectedLabel] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Delete dialog state
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch locale from params
  useEffect(() => {
    void params.then((p) => {
      setLocale(p.locale)
    })
  }, [params])

  const PAGE_SIZE = 20

  const mapWork = (work: WorkApi): Work => {
    const translations = work.translations ?? []
    const titleFr = translations.find((t) => t.locale === 'fr')?.title ?? ''
    const titleEn = translations.find((t) => t.locale === 'en')?.title ?? ''

    const statusCandidate = (work.status ?? '').toUpperCase()
    const status: Work['status'] = ['PUBLISHED', 'DRAFT', 'ARCHIVED'].includes(statusCandidate)
      ? (statusCandidate as Work['status'])
      : work.isActive
        ? 'PUBLISHED'
        : 'DRAFT'

    const categoryTranslations = work.category?.translations ?? []
    const labelTranslations = work.label?.translations ?? []

    return {
      id: work.id,
      slug: work.slug,
      titleFr,
      titleEn,
      status,
      createdAt: work.createdAt,
      updatedAt: work.updatedAt,
      coverImageUrl: work.coverImage?.path ?? null,
      coverImageBlur: work.coverImage?.blurDataUrl ?? null,
      category: work.category
        ? {
            id: work.category.id,
            nameFr: categoryTranslations.find((t) => t.locale === 'fr')?.name ?? '',
            nameEn: categoryTranslations.find((t) => t.locale === 'en')?.name ?? '',
            color: work.category.color ?? '#ffffff',
          }
        : null,
      label: work.label
        ? {
            id: work.label.id,
            nameFr: labelTranslations.find((t) => t.locale === 'fr')?.name ?? '',
            nameEn: labelTranslations.find((t) => t.locale === 'en')?.name ?? '',
          }
        : null,
    }
  }

  const fetchWorks = useCallback(
    async (pageToLoad = 0, append = false) => {
      try {
        setIsLoading(true)

        const params = new URLSearchParams({
          page: pageToLoad.toString(),
          limit: PAGE_SIZE.toString(),
          sortBy,
          sortOrder,
          full: 'true',
        })

        if (searchQuery) params.set('search', searchQuery)
        if (selectedCategory !== 'all') params.set('categoryId', selectedCategory)
        if (selectedLabel !== 'all') params.set('labelId', selectedLabel)
        if (selectedStatus !== 'all') params.set('status', selectedStatus)

        const res = await fetchWithAuth(`/api/admin/projects?${params.toString()}`)

        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }

        const payload = (await res.json()) as unknown
        if (
          !payload ||
          typeof payload !== 'object' ||
          !Array.isArray((payload as { data?: unknown }).data)
        ) {
          throw new Error('Invalid projects payload')
        }

        const { data, pagination } = payload as {
          data: WorkApi[]
          pagination: { page: number; total: number; totalPages: number }
        }

        const worksData = data.map(mapWork)

        setWorks((prev) => (append ? [...prev, ...worksData] : worksData))
        setPage(pagination.page)
        setHasMore(pagination.page < pagination.totalPages - 1)
        setTotalCount(pagination.total)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching data:', error)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setIsLoading(false)
      }
    },
    [searchQuery, selectedCategory, selectedLabel, selectedStatus, sortBy, sortOrder]
  )

  // Fetch categories and labels once
  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        const [categoriesRes, labelsRes] = await Promise.all([
          fetchWithAuth('/api/admin/categories'),
          fetchWithAuth('/api/admin/labels'),
        ])

        if (!categoriesRes.ok || !labelsRes.ok) {
          throw new Error('Failed to fetch taxonomies')
        }

        const [categoriesRaw, labelsRaw] = (await Promise.all([
          categoriesRes.json(),
          labelsRes.json(),
        ])) as [unknown, unknown]

        if (!Array.isArray(categoriesRaw) || !Array.isArray(labelsRaw)) {
          throw new Error('Invalid taxonomies payload')
        }

        const categoriesData: Category[] = (categoriesRaw as TaxonomyApi[]).map((category) => {
          const translations = category.translations ?? []
          return {
            id: category.id,
            nameFr: translations.find((t) => t.locale === 'fr')?.name ?? '',
            nameEn: translations.find((t) => t.locale === 'en')?.name ?? '',
            color: category.color ?? '#ffffff',
          }
        })

        const labelsData: Label[] = (labelsRaw as TaxonomyApi[]).map((label) => {
          const translations = label.translations ?? []
          return {
            id: label.id,
            nameFr: translations.find((t) => t.locale === 'fr')?.name ?? '',
            nameEn: translations.find((t) => t.locale === 'en')?.name ?? '',
          }
        })

        setCategories(categoriesData)
        setLabels(labelsData)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching taxonomies:', error)
        toast.error('Erreur lors du chargement des catégories/labels')
      }
    }

    void fetchTaxonomies()
  }, [])

  // Fetch works when filters change
  useEffect(() => {
    setSelectedIds([])
    setWorks([])
    setHasMore(true)
    setPage(0)
    void fetchWorks(0, false)
  }, [fetchWorks])

  // Infinite scroll observer (server-side pagination)
  useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoading) {
          void fetchWorks(page + 1, true)
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(loadMoreRef.current)
    return () => {
      observer.disconnect()
    }
  }, [fetchWorks, hasMore, isLoading, page])

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!workToDelete) return

    try {
      setIsDeleting(true)
      const res = await fetchWithAuth(`/api/admin/projects/${workToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete work')
      }

      setSelectedIds([])
      setWorks([])
      setHasMore(true)
      setPage(0)
      void fetchWorks(0, false)
      setTotalCount((count) => Math.max(count - 1, 0))
      toast.success('Projet supprimé avec succès')
      setWorkToDelete(null)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting work:', error)
      toast.error('Erreur lors de la suppression du projet')
    } finally {
      setIsDeleting(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedLabel('all')
    setSelectedStatus('all')
  }

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || selectedLabel !== 'all' || selectedStatus !== 'all'

  // Handle checkbox selection
  const handleSelectAll = () => {
    if (selectedIds.length === works.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(works.map((work) => work.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const isAllSelected = works.length > 0 && selectedIds.length === works.length
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected

  // Define columns
  const columns: Column<Work>[] = [
    {
      key: 'select',
      label: (
        <Checkbox
          checked={isSomeSelected ? 'indeterminate' : isAllSelected ? true : false}
          onCheckedChange={handleSelectAll}
          aria-label="Sélectionner tout"
        />
      ),
      render: (work) => (
        <Checkbox
          checked={selectedIds.includes(work.id)}
          onCheckedChange={() => {
            handleSelectOne(work.id)
          }}
          aria-label={`Sélectionner ${locale === 'fr' ? work.titleFr : work.titleEn}`}
        />
      ),
    },
    {
      key: 'cover',
      label: 'Visuel',
      render: (work) =>
        work.coverImageUrl ? (
          <div className="relative h-14 w-24 overflow-hidden rounded bg-white/5">
            <Image
              src={work.coverImageUrl}
              alt={work.titleFr || work.titleEn}
              fill
              sizes="96px"
              className="object-cover"
              placeholder={work.coverImageBlur ? 'blur' : 'empty'}
              blurDataURL={work.coverImageBlur ?? undefined}
            />
          </div>
        ) : (
          <div className="flex h-14 w-24 items-center justify-center rounded border border-dashed border-white/10 text-xs text-white/40">
            Aucun
          </div>
        ),
    },
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (work) => (
        <Link
          href={`/${locale}/admin/projets/${work.id}`}
          className="font-medium text-[var(--brand-neon)] hover:underline"
        >
          {locale === 'fr' ? work.titleFr : work.titleEn}
        </Link>
      ),
    },
    {
      key: 'category',
      label: 'Catégorie',
      sortable: true,
      render: (work) =>
        work.category ? (
          <Badge
            variant="outline"
            className="border-white/20"
            style={{ borderColor: work.category.color }}
          >
            {locale === 'fr' ? work.category.nameFr : work.category.nameEn}
          </Badge>
        ) : (
          <span className="text-white/30">-</span>
        ),
    },
    {
      key: 'label',
      label: 'Label',
      render: (work) =>
        work.label ? (
          <span className="text-white/70">
            {locale === 'fr' ? work.label.nameFr : work.label.nameEn}
          </span>
        ) : (
          <span className="text-white/30">-</span>
        ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (work) => (
        <Badge
          variant={
            work.status === 'PUBLISHED'
              ? 'default'
              : work.status === 'DRAFT'
                ? 'outline'
                : 'secondary'
          }
          className={
            work.status === 'PUBLISHED'
              ? 'bg-[var(--brand-neon)] text-black'
              : work.status === 'DRAFT'
                ? 'border-white/30 text-white/50'
                : 'border-white/20 bg-white/10 text-white/70'
          }
        >
          {work.status === 'PUBLISHED'
            ? 'Publié'
            : work.status === 'ARCHIVED'
              ? 'Archivé'
              : 'Brouillon'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      sortable: true,
      render: (work) => (
        <span className="text-sm text-white/50">
          {new Date(work.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (work) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/${locale}/admin/projets/${work.id}`)
            }}
            className="h-8 w-8 p-0 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setWorkToDelete(work)
            }}
            className="h-8 w-8 p-0 text-red-400/50 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projets</h1>
          <p className="mt-2 text-white/50">
            Gérer vos œuvres musicales ({totalCount} {totalCount > 1 ? 'projets' : 'projet'})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportDialog
            entity="projects"
            onSuccess={() => {
              setHasMore(true)
              setPage(0)
              void fetchWorks(0, false)
            }}
          />
          <ExportButton
            entity="projects"
            filters={{
              ...(selectedCategory !== 'all' && {
                categoryId: selectedCategory,
              }),
              ...(selectedLabel !== 'all' && { labelId: selectedLabel }),
              ...(selectedStatus !== 'all' && { status: selectedStatus }),
            }}
          />
          <Link href={`/${locale}/admin/projets/nouveau`} className="w-full sm:w-auto">
            <Button className="w-full justify-center gap-2 bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)] sm:w-auto">
              <PlusIcon className="h-4 w-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FilterIcon className="h-5 w-5 text-white/50" />
          <h2 className="text-sm font-semibold text-white/70 uppercase">Filtres</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 gap-1 text-xs text-white/50 hover:text-white"
            >
              <XIcon className="h-3 w-3" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par titre..."
            />
          </div>

          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="border-white/20 bg-black text-white">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {locale === 'fr' ? category.nameFr : category.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Label filter */}
          <Select value={selectedLabel} onValueChange={setSelectedLabel}>
            <SelectTrigger className="border-white/20 bg-black text-white">
              <SelectValue placeholder="Tous les labels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les labels</SelectItem>
              {labels.map((label) => (
                <SelectItem key={label.id} value={label.id}>
                  {locale === 'fr' ? label.nameFr : label.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus('all')
            }}
            className={
              selectedStatus === 'all'
                ? 'bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]'
                : 'border-white/20 text-white hover:bg-white/5'
            }
          >
            Tous
          </Button>
          <Button
            variant={selectedStatus === 'PUBLISHED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus('PUBLISHED')
            }}
            className={
              selectedStatus === 'PUBLISHED'
                ? 'bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]'
                : 'border-white/20 text-white hover:bg-white/5'
            }
          >
            Publiés
          </Button>
          <Button
            variant={selectedStatus === 'DRAFT' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus('DRAFT')
            }}
            className={
              selectedStatus === 'DRAFT'
                ? 'bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]'
                : 'border-white/20 text-white hover:bg-white/5'
            }
          >
            Brouillons
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={works}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'Aucun projet ne correspond aux filtres sélectionnés'
            : 'Aucun projet pour le moment'
        }
      />

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className="h-8">
        {hasMore && !isLoading && (
          <p className="text-center text-xs text-white/40">Chargement automatique...</p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(workToDelete)}
        onOpenChange={(open) => {
          if (!open) setWorkToDelete(null)
        }}
      >
        <AlertDialogContent className="border-[var(--brand-neon)]/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer le projet "
              {workToDelete ? (locale === 'fr' ? workToDelete.titleFr : workToDelete.titleEn) : ''}"
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/20 text-white hover:bg-white/5"
              disabled={isDeleting}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDelete()
              }}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedIds={selectedIds}
          onSuccess={() => {
            setSelectedIds([])
            setHasMore(true)
            setPage(0)
            setWorks([])
            void fetchWorks(0, false)
          }}
          onClear={() => {
            setSelectedIds([])
          }}
        />
      )}
    </div>
  )
}
