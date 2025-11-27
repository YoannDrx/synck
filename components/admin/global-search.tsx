'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import {
  FileTextIcon,
  FolderIcon,
  LayoutDashboardIcon,
  MusicIcon,
  TagIcon,
  UsersIcon,
} from 'lucide-react'

import { fetchWithAuth } from '@/lib/fetch-with-auth'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

type SearchResult = {
  id: string
  type: 'work' | 'artist' | 'category' | 'label' | 'action'
  title: string
  description?: string
  url: string
}

type GlobalSearchProps = {
  locale: string
}

export function GlobalSearch({ locale }: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', down)
    return () => {
      document.removeEventListener('keydown', down)
    }
  }, [])

  // Search function
  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const [worksRes, artistsRes, categoriesRes, labelsRes] = await Promise.all([
          fetchWithAuth(`/api/admin/projects?search=${encodeURIComponent(searchQuery)}`),
          fetchWithAuth(`/api/admin/artists?search=${encodeURIComponent(searchQuery)}`),
          fetchWithAuth(`/api/admin/categories?search=${encodeURIComponent(searchQuery)}`),
          fetchWithAuth(`/api/admin/labels?search=${encodeURIComponent(searchQuery)}`),
        ])

        const [works, artists, categories, labels] = await Promise.all([
          worksRes.ok
            ? (worksRes.json() as Promise<{ id: string; titleFr: string; titleEn: string }[]>)
            : Promise.resolve([]),
          artistsRes.ok
            ? (artistsRes.json() as Promise<{ id: string; nameFr: string; nameEn: string }[]>)
            : Promise.resolve([]),
          categoriesRes.ok
            ? (categoriesRes.json() as Promise<{ id: string; nameFr: string; nameEn: string }[]>)
            : Promise.resolve([]),
          labelsRes.ok
            ? (labelsRes.json() as Promise<{ id: string; name: string }[]>)
            : Promise.resolve([]),
        ])

        const searchResults: SearchResult[] = [
          // Works
          ...works.map((work) => ({
            id: work.id,
            type: 'work' as const,
            title: locale === 'fr' ? work.titleFr : work.titleEn,
            url: `/${locale}/admin/projets/${work.id}`,
          })),
          // Artists
          ...artists.map((artist) => ({
            id: artist.id,
            type: 'artist' as const,
            title: locale === 'fr' ? artist.nameFr : artist.nameEn,
            url: `/${locale}/admin/artistes/${artist.id}`,
          })),
          // Categories
          ...categories.map((category) => ({
            id: category.id,
            type: 'category' as const,
            title: locale === 'fr' ? category.nameFr : category.nameEn,
            url: `/${locale}/admin/categories`,
          })),
          // Labels
          ...labels.map((label) => ({
            id: label.id,
            type: 'label' as const,
            title: label.name,
            url: `/${locale}/admin/labels`,
          })),
        ]

        setResults(searchResults)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [locale]
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      void search(query)
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [query, search])

  // Quick actions (always visible)
  const quickActions: SearchResult[] = [
    {
      id: 'dashboard',
      type: 'action',
      title: 'Dashboard',
      url: `/${locale}/admin`,
    },
    {
      id: 'new-work',
      type: 'action',
      title: 'Nouveau projet',
      url: `/${locale}/admin/projets/nouveau`,
    },
    {
      id: 'new-artist',
      type: 'action',
      title: 'Nouveau artiste',
      url: `/${locale}/admin/artistes/nouveau`,
    },
    {
      id: 'medias',
      type: 'action',
      title: 'Médiathèque',
      url: `/${locale}/admin/medias`,
    },
    {
      id: 'categories',
      type: 'action',
      title: 'Catégories',
      url: `/${locale}/admin/categories`,
    },
    {
      id: 'labels',
      type: 'action',
      title: 'Labels',
      url: `/${locale}/admin/labels`,
    },
    {
      id: 'expertises',
      type: 'action',
      title: 'Expertises',
      url: `/${locale}/admin/expertises`,
    },
  ]

  const handleSelect = (url: string) => {
    setOpen(false)
    setQuery('')
    router.push(url)
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'work':
        return MusicIcon
      case 'artist':
        return UsersIcon
      case 'category':
        return FolderIcon
      case 'label':
        return TagIcon
      case 'action':
        return LayoutDashboardIcon
      default:
        return FileTextIcon
    }
  }

  const getGroupLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'work':
        return 'Projets'
      case 'artist':
        return 'Artistes'
      case 'category':
        return 'Catégories'
      case 'label':
        return 'Labels'
      case 'action':
        return 'Actions rapides'
      default:
        return 'Autres'
    }
  }

  // Group results by type
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<SearchResult['type'], SearchResult[]>
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Recherche globale"
      description="Rechercher parmi les projets, artistes, catégories et labels"
    >
      <CommandInput placeholder="Rechercher..." value={query} onValueChange={setQuery} />
      <CommandList>
        {!query && (
          <CommandGroup heading="Actions rapides">
            {quickActions.map((action) => {
              const Icon = getIcon(action.type)
              return (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    handleSelect(action.url)
                  }}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {action.title}
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {query && isLoading && <CommandEmpty>Recherche en cours...</CommandEmpty>}

        {query && !isLoading && results.length === 0 && (
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
        )}

        {query &&
          !isLoading &&
          Object.entries(groupedResults).map(([type, items], index) => {
            const Icon = getIcon(type as SearchResult['type'])
            return (
              <div key={type}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={getGroupLabel(type as SearchResult['type'])}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        handleSelect(item.url)
                      }}
                      className="cursor-pointer"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                      {item.description && (
                        <span className="ml-2 text-xs text-white/50">{item.description}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            )
          })}
      </CommandList>
    </CommandDialog>
  )
}
