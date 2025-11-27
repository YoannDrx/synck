'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { FolderIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
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

import { type Column, DataTable } from '@/components/admin/data-table/data-table'
import { SearchBar } from '@/components/admin/data-table/search-bar'
import { ExportButton } from '@/components/admin/export-button'

type CategoryApi = {
  id: string
  translations: { locale: string; name: string }[]
  color: string | null
  icon: string | null
  order: number | null
  isActive: boolean | null
  createdAt: string
  _count?: { works?: number }
}

type Category = {
  id: string
  nameFr: string
  nameEn: string
  color: string
  icon: string | null
  order: number
  isActive: boolean
  createdAt: string
  _count?: {
    works: number
  }
}

export default function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const [locale, setLocale] = useState<string>('fr')
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Delete dialog state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch locale from params
  useEffect(() => {
    void params.then((p) => {
      setLocale(p.locale)
    })
  }, [params])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const res = await fetchWithAuth('/api/admin/categories')

        if (!res.ok) {
          throw new Error('Failed to fetch categories')
        }

        const raw = (await res.json()) as unknown
        if (!Array.isArray(raw)) {
          throw new Error('Invalid categories payload')
        }

        const mapped: Category[] = (raw as CategoryApi[]).map((category) => {
          const translations = category.translations ?? []
          const nameFr = translations.find((t) => t.locale === 'fr')?.name ?? ''
          const nameEn = translations.find((t) => t.locale === 'en')?.name ?? ''

          return {
            id: category.id,
            nameFr,
            nameEn,
            color: category.color ?? '#ffffff',
            icon: category.icon ?? null,
            order: category.order ?? 0,
            isActive: Boolean(category.isActive),
            createdAt: category.createdAt,
            _count: { works: category._count?.works ?? 0 },
          }
        })
        setCategories(mapped)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching categories:', error)
        toast.error('Erreur lors du chargement des catégories')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchCategories()
  }, [])

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    // Search filter
    const name = (locale === 'fr' ? category.nameFr : category.nameEn) || ''
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && category.isActive) ||
      (selectedStatus === 'inactive' && !category.isActive)

    return matchesSearch && matchesStatus
  })

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let aValue: string | number = ''
    let bValue: string | number = ''

    if (sortBy === 'name') {
      aValue = locale === 'fr' ? a.nameFr : a.nameEn
      bValue = locale === 'fr' ? b.nameFr : b.nameEn
    } else if (sortBy === 'status') {
      aValue = a.isActive ? 1 : 0
      bValue = b.isActive ? 1 : 0
    } else if (sortBy === 'works') {
      aValue = a._count?.works ?? 0
      bValue = b._count?.works ?? 0
    } else if (sortBy === 'order') {
      aValue = a.order
      bValue = b.order
    } else if (sortBy === 'createdAt') {
      aValue = new Date(a.createdAt).getTime()
      bValue = new Date(b.createdAt).getTime()
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Paginate categories
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage)
  const paginatedCategories = sortedCategories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

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
    if (!categoryToDelete) return

    try {
      setIsDeleting(true)
      const res = await fetchWithAuth(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete category')
      }

      setCategories(categories.filter((c) => c.id !== categoryToDelete.id))
      toast.success('Catégorie supprimée avec succès')
      setCategoryToDelete(null)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting category:', error)
      toast.error('Erreur lors de la suppression de la catégorie')
    } finally {
      setIsDeleting(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedStatus('all')
    setCurrentPage(0)
  }

  const hasActiveFilters = searchQuery || selectedStatus !== 'all'

  // Define columns
  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
          <Link
            href={`/${locale}/admin/categories/${category.id}`}
            className="font-medium text-[var(--brand-neon)] hover:underline"
          >
            {locale === 'fr' ? category.nameFr : category.nameEn}
          </Link>
        </div>
      ),
    },
    {
      key: 'icon',
      label: 'Icône',
      render: (category) => (
        <span className="text-sm text-white/50">
          {category.icon ? <span className="font-mono">{category.icon}</span> : '-'}
        </span>
      ),
    },
    {
      key: 'works',
      label: 'Projets',
      sortable: true,
      render: (category) => (
        <Badge variant="outline" className="border-white/20 text-white/70">
          {category._count?.works ?? 0}
        </Badge>
      ),
    },
    {
      key: 'order',
      label: 'Ordre',
      sortable: true,
      render: (category) => <span className="text-sm text-white/70">{category.order}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (category) => (
        <Badge
          variant={category.isActive ? 'default' : 'outline'}
          className={
            category.isActive
              ? 'bg-[var(--brand-neon)] text-black'
              : 'border-white/30 text-white/50'
          }
        >
          {category.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      sortable: true,
      render: (category) => (
        <span className="text-sm text-white/50">
          {new Date(category.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (category) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push(`/${locale}/admin/categories/${category.id}`)
            }}
            className="h-8 w-8 p-0 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoryToDelete(category)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Catégories</h1>
          <p className="mt-2 text-white/50">
            Gérer les catégories de projets ({filteredCategories.length}{' '}
            {filteredCategories.length > 1 ? 'catégories' : 'catégorie'})
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton entity="categories" />
          <Link href={`/${locale}/admin/categories/nouveau`}>
            <Button className="gap-2 bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]">
              <PlusIcon className="h-4 w-4" />
              Nouvelle catégorie
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FolderIcon className="h-5 w-5 text-white/50" />
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom..."
            />
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
              Toutes
            </Button>
            <Button
              variant={selectedStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedStatus('active')
              }}
              className={
                selectedStatus === 'active'
                  ? 'bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]'
                  : 'border-white/20 text-white hover:bg-white/5'
              }
            >
              Actives
            </Button>
            <Button
              variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedStatus('inactive')
              }}
              className={
                selectedStatus === 'inactive'
                  ? 'bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]'
                  : 'border-white/20 text-white hover:bg-white/5'
              }
            >
              Inactives
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedCategories}
        pagination={{
          page: currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage={
          hasActiveFilters
            ? 'Aucune catégorie ne correspond aux filtres sélectionnés'
            : 'Aucune catégorie pour le moment'
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null)
        }}
      >
        <AlertDialogContent className="border-[var(--brand-neon)]/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer la catégorie "
              {categoryToDelete
                ? locale === 'fr'
                  ? categoryToDelete.nameFr
                  : categoryToDelete.nameEn
                : ''}
              " ? Cette action est irréversible.
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
    </div>
  )
}
