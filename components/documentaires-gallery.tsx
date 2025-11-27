'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import Masonry from 'react-masonry-css'

import { motion, useInView } from 'framer-motion'

import { cn } from '@/lib/utils'

import { GalleryShell } from '@/components/galleries/gallery-shell'

type Documentaire = {
  title: string
  subtitle: string
  href: string
  src: string
  srcLg: string
  link: string
  category: string
  productionCompanies?: string[]
  year?: number
  height?: string
  width?: number
  imgHeight?: number
  aspectRatio?: number
}

/** Masonry breakpoints configuration */
const masonryBreakpoints = {
  default: 4,
  1280: 3,
  1024: 2,
  640: 1,
}

/** Color accents by category */
const categoryAccents: Record<
  string,
  {
    glow: string
    borderHover: string
    badge: string
    accent: string
  }
> = {
  // Société - Cyan
  société: {
    glow: 'hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]',
    borderHover: 'hover:border-cyan-400',
    badge: 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30',
    accent: '#4ecdc4',
  },
  // Sport - Orange
  sport: {
    glow: 'hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]',
    borderHover: 'hover:border-orange-400',
    badge: 'bg-orange-400/20 text-orange-400 border border-orange-400/30',
    accent: '#fb923c',
  },
  // Histoire - Purple
  histoire: {
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    borderHover: 'hover:border-purple-400',
    badge: 'bg-purple-400/20 text-purple-400 border border-purple-400/30',
    accent: '#a855f7',
  },
  // Culture - Pink
  culture: {
    glow: 'hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]',
    borderHover: 'hover:border-pink-400',
    badge: 'bg-pink-400/20 text-pink-400 border border-pink-400/30',
    accent: '#f472b6',
  },
  // Nature - Emerald
  nature: {
    glow: 'hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]',
    borderHover: 'hover:border-emerald-400',
    badge: 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30',
    accent: '#34d399',
  },
  // Fallback - Lime
  default: {
    glow: 'hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]',
    borderHover: 'hover:border-lime-400',
    badge: 'bg-lime-400/20 text-lime-400 border border-lime-400/30',
    accent: '#a3e635',
  },
}

/** Color accents by production company for filters and cards */
const companyAccents: Record<
  string,
  {
    filterActive: string
    filterInactive: string
    borderHover: string
    glow: string
    badge: string
    accent: string
  }
> = {
  // 13prods - Lime/Vert
  '13prods': {
    filterActive: 'border-lime-400 bg-lime-400 text-[#050505]',
    filterInactive:
      'border-white/10 bg-black/20 text-white/60 hover:border-lime-400 hover:text-lime-400',
    borderHover: 'hover:border-lime-400',
    glow: 'hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]',
    badge: 'bg-lime-400/20 text-lime-400 border border-lime-400/30',
    accent: '#a3e635',
  },
  // Little Big Story - Cyan
  'little-big-story': {
    filterActive: 'border-cyan-400 bg-cyan-400 text-[#050505]',
    filterInactive:
      'border-white/10 bg-black/20 text-white/60 hover:border-cyan-400 hover:text-cyan-400',
    borderHover: 'hover:border-cyan-400',
    glow: 'hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]',
    badge: 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30',
    accent: '#4ecdc4',
  },
  // Pop Films - Purple
  'pop-films': {
    filterActive: 'border-purple-400 bg-purple-400 text-[#050505]',
    filterInactive:
      'border-white/10 bg-black/20 text-white/60 hover:border-purple-400 hover:text-purple-400',
    borderHover: 'hover:border-purple-400',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    badge: 'bg-purple-400/20 text-purple-400 border border-purple-400/30',
    accent: '#a855f7',
  },
  // Via Découverte - Orange
  'via-decouverte': {
    filterActive: 'border-orange-400 bg-orange-400 text-[#050505]',
    filterInactive:
      'border-white/10 bg-black/20 text-white/60 hover:border-orange-400 hover:text-orange-400',
    borderHover: 'hover:border-orange-400',
    glow: 'hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]',
    badge: 'bg-orange-400/20 text-orange-400 border border-orange-400/30',
    accent: '#fb923c',
  },
  // Default - Pink
  default: {
    filterActive: 'border-pink-400 bg-pink-400 text-[#050505]',
    filterInactive:
      'border-white/10 bg-black/20 text-white/60 hover:border-pink-400 hover:text-pink-400',
    borderHover: 'hover:border-pink-400',
    glow: 'hover:shadow-[0_0_30px_rgba(244,114,182,0.3)]',
    badge: 'bg-pink-400/20 text-pink-400 border border-pink-400/30',
    accent: '#f472b6',
  },
}

/** Get category accent */
const getCategoryAccent = (category: string) => {
  const key = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return categoryAccents[key] ?? categoryAccents.default
}

/** Get company accent for filters */
const getCompanyAccent = (company: string) => {
  // Normalize: lowercase, remove accents, replace spaces with hyphens
  const key = company
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with hyphens

  return companyAccents[key] ?? companyAccents.default
}

type DocumentairesGalleryProps = {
  documentaires: Documentaire[]
  copy: {
    title: string
    filterAll: string
    searchPlaceholder: string
    empty: string
    noResults: string
    statsDocumentaries: string
    statsCategories: string
    statsProducers: string
    sortByDate: string
    sortByTitle: string
    sortOrderTitleAsc: string
    sortOrderTitleDesc: string
    sortOrderDateAsc: string
    sortOrderDateDesc: string
  }
}

export function DocumentairesGallery({ documentaires, copy }: DocumentairesGalleryProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  // Extract unique production companies
  const productionCompanies = Array.from(
    new Set(documentaires.flatMap((doc) => doc.productionCompanies ?? []))
  ).sort()

  // Extract unique categories
  const categories = Array.from(new Set(documentaires.map((doc) => doc.category))).sort()

  const [selectedProductionCompany, setSelectedProductionCompany] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const getToggleOptions = (): [string, string] => {
    if (sortBy === 'title') {
      return [copy.sortOrderTitleAsc, copy.sortOrderTitleDesc]
    } else {
      return [copy.sortOrderDateAsc, copy.sortOrderDateDesc]
    }
  }

  const filteredDocs = documentaires
    .filter(
      (doc) =>
        selectedProductionCompany === 'all' ||
        doc.productionCompanies?.includes(selectedProductionCompany)
    )
    .filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = (a.year ?? 0) - (b.year ?? 0)
      } else {
        comparison = a.title.localeCompare(b.title)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Group filtered docs by category for display
  const groupedDocs = filteredDocs.reduce<Record<string, Documentaire[]>>((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {})

  return (
    <GalleryShell
      title={copy.title}
      highlightColor="#d5ff0a"
      stats={[
        { value: documentaires.length, label: copy.statsDocumentaries },
        {
          value: categories.length,
          label: copy.statsCategories,
          valueClassName: 'text-cyan-400',
        },
        ...(productionCompanies.length > 0
          ? [
              {
                value: productionCompanies.length,
                label: copy.statsProducers,
                valueClassName: 'text-[#d5ff0a]',
              },
            ]
          : []),
      ]}
      search={{
        value: searchQuery,
        onChange: (value) => {
          setSearchQuery(value)
        },
        onClear: () => {
          setSearchQuery('')
        },
        placeholder: copy.searchPlaceholder,
        inputAccentClassName: 'focus:border-[#d5ff0a]/50',
        clearButtonAccentClassName: 'hover:text-[#d5ff0a]',
      }}
      sort={{
        sortBy,
        sortByOptions: [
          { value: 'date', label: copy.sortByDate },
          { value: 'title', label: copy.sortByTitle },
        ],
        onSortByChange: (value) => {
          setSortBy(value)
        },
        sortOrder,
        sortOrderLabels: getToggleOptions(),
        onSortOrderChange: (value) => {
          setSortOrder(value)
        },
      }}
      filters={
        productionCompanies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedProductionCompany('all')
              }}
              className={cn(
                'border-2 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all',
                selectedProductionCompany === 'all'
                  ? 'border-[#d5ff0a] bg-[#d5ff0a] text-[#050505]'
                  : 'border-white/10 bg-black/20 text-white/60 hover:border-[#d5ff0a] hover:text-[#d5ff0a]'
              )}
            >
              {copy.filterAll}
              <span className="ml-1.5 opacity-70">({documentaires.length})</span>
            </button>
            {productionCompanies.map((company) => {
              const count = documentaires.filter((d) =>
                d.productionCompanies?.includes(company)
              ).length
              const displayName = company
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
              const companyAccent = getCompanyAccent(company)
              return (
                <button
                  key={company}
                  onClick={() => {
                    setSelectedProductionCompany(company)
                  }}
                  className={cn(
                    'border-2 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all',
                    selectedProductionCompany === company
                      ? companyAccent.filterActive
                      : companyAccent.filterInactive
                  )}
                >
                  {displayName}
                  <span className="ml-1.5 opacity-70">({count})</span>
                </button>
              )
            })}
          </div>
        ) : undefined
      }
      hasItems={filteredDocs.length > 0}
      emptyContent={<p className="text-white/40">{searchQuery ? copy.noResults : copy.empty}</p>}
      isInView={isInView}
      containerRef={sectionRef}
      className="mt-12"
    >
      {Object.entries(groupedDocs).map(([category, docs]) => {
        const catAccent = getCategoryAccent(category)
        return (
          <div key={category} className="mb-10 last:mb-0">
            <h4 className="mb-6 flex items-center gap-3 text-lg font-bold tracking-wide uppercase">
              <span style={{ color: catAccent.accent }}>{category}</span>
              <span className="text-white/30">({docs.length})</span>
            </h4>
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="-ml-4 flex w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {docs.map((doc, index) => (
                <DocumentaireCard key={index} doc={doc} index={index} />
              ))}
            </Masonry>
          </div>
        )
      })}
    </GalleryShell>
  )
}

/** Documentaire Card Component */
function DocumentaireCard({ doc, index }: { doc: Documentaire; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, {
    once: true,
    margin: '0px 0px -30px 0px',
  })

  // Get accent based on production company for border/glow
  const primaryCompany = doc.productionCompanies?.[0] ?? ''
  const companyAccent = getCompanyAccent(primaryCompany)
  const primaryCompanyLabel = primaryCompany
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  // Stagger delay based on column position (max 4 columns)
  const columnPosition = index % 4
  const staggerDelay = columnPosition * 0.03

  const cardClasses = cn(
    'group relative flex h-full flex-col overflow-hidden',
    'border-2 border-white/10 bg-black/20',
    'transition-all duration-300',
    'hover:-translate-y-1',
    companyAccent.glow,
    companyAccent.borderHover
  )

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mb-4"
    >
      <a href={doc.link} target="_blank" rel="noopener noreferrer" className={cardClasses}>
        {/* Image */}
        <div className="relative overflow-hidden">
          {doc.srcLg ? (
            <Image
              src={doc.srcLg}
              alt={doc.title}
              width={doc.width ?? 400}
              height={doc.imgHeight ?? 300}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="h-auto w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <div className="flex aspect-[4/3] h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
              <span className="text-5xl font-black text-white/10 uppercase">
                {doc.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-white">
            {doc.title}
          </h3>

          {/* Production companies tags */}
          {/* Removed inline production chips to keep only footer badge */}

          <div className="mt-auto">
            {(primaryCompany || doc.year) && (
              <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                {primaryCompany ? (
                  <div
                    className={cn(
                      'rounded-sm px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase',
                      companyAccent.badge
                    )}
                  >
                    {primaryCompanyLabel}
                  </div>
                ) : (
                  <div />
                )}
                {doc.year && (
                  <div className="rounded-sm bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70">
                    {doc.year}
                  </div>
                )}
              </div>
            )}

            {/* Hover CTA */}
            <div
              className={cn(
                'mt-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase opacity-0 transition-all duration-300 group-hover:opacity-100',
                !doc.year && 'mt-0'
              )}
              style={{ color: companyAccent.accent }}
            >
              Voir le documentaire
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}
