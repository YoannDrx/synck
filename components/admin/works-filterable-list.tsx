'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type {
  Artist,
  ArtistTranslation,
  Asset,
  Category,
  CategoryTranslation,
  Contribution,
  Label,
  LabelTranslation,
  Work,
  WorkTranslation,
} from '@prisma/client'

import type { AdminDictionary } from '@/types/dictionary'

import { DeleteWorkButton } from './delete-work-button'

type WorkWithRelations = Work & {
  translations: WorkTranslation[]
  category: Category & {
    translations: CategoryTranslation[]
  }
  label: (Label & { translations: LabelTranslation[] }) | null
  coverImage: Asset | null
  contributions: (Contribution & {
    artist: Artist & {
      translations: ArtistTranslation[]
    }
  })[]
}

type CategoryWithTranslations = Category & {
  translations: CategoryTranslation[]
}

type WorksFilterableListProps = {
  works: WorkWithRelations[]
  categories: CategoryWithTranslations[]
  dictionary: AdminDictionary['common']
}

export function WorksFilterableList({ works, categories, dictionary }: WorksFilterableListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // Filter works based on selected category
  const filteredWorks = useMemo(() => {
    if (!selectedCategoryId) return works
    return works.filter((work) => work.categoryId === selectedCategoryId)
  }, [works, selectedCategoryId])

  return (
    <>
      {/* Category Filters */}
      <div className="mb-8 border-2 border-white/20 bg-white/5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm text-white/60">Filtrer par type :</span>
          <button
            onClick={() => {
              setSelectedCategoryId(null)
            }}
            className={`border-2 px-4 py-2 text-sm transition-colors ${
              selectedCategoryId === null
                ? 'border-[#d5ff0a] bg-[#d5ff0a] font-bold text-black'
                : 'border-white/20 hover:border-[#d5ff0a]'
            }`}
          >
            Tous ({works.length})
          </button>
          {categories.map((category) => {
            const categoryName =
              category.translations.find((t) => t.locale === 'fr')?.name ?? 'Sans nom'
            const count = works.filter((w) => w.categoryId === category.id).length

            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id)
                }}
                className={`border-2 px-4 py-2 text-sm transition-colors ${
                  selectedCategoryId === category.id
                    ? 'border-[#d5ff0a] bg-[#d5ff0a] font-bold text-black'
                    : 'border-white/20 hover:border-[#d5ff0a]'
                }`}
              >
                {categoryName} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Works Count */}
      <div className="mb-6">
        <p className="text-white/60">
          {filteredWorks.length} projet(s)
          {selectedCategoryId && ' dans cette catégorie'}
        </p>
      </div>

      {/* Works Grid */}
      {filteredWorks.length === 0 ? (
        <div className="border-2 border-white/20 bg-white/5 p-12 text-center">
          <p className="mb-4 text-white/60">
            {selectedCategoryId
              ? 'Aucun projet dans cette catégorie'
              : 'Aucun projet pour le moment'}
          </p>
          <Link
            href="/admin/projets/new"
            className="inline-block bg-[#d5ff0a] px-6 py-3 font-bold text-black transition-colors hover:bg-[#c5ef00]"
          >
            + Ajouter un projet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorks.map((work) => {
            const frTitle = work.translations.find((t) => t.locale === 'fr')?.title ?? 'Sans titre'
            const category = work.category?.translations.find((t) => t.locale === 'fr')?.name
            const artists = work.contributions
              .map((c) => c.artist.translations.find((t) => t.locale === 'fr')?.name)
              .filter(Boolean)
              .join(', ')

            return (
              <div
                key={work.id}
                className="group border-2 border-white/20 bg-white/5 transition-all hover:border-[#d5ff0a]"
              >
                {/* Cover Image */}
                {work.coverImage && (
                  <div className="relative aspect-square w-full bg-white/5">
                    <Image
                      src={work.coverImage.path}
                      alt={work.coverImage.alt ?? frTitle}
                      fill
                      className="object-cover"
                      placeholder={work.coverImage.blurDataUrl ? 'blur' : 'empty'}
                      blurDataURL={work.coverImage.blurDataUrl ?? undefined}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 line-clamp-2 text-lg font-bold">{frTitle}</h3>
                      {category && <p className="mb-1 text-sm text-[#d5ff0a]">{category}</p>}
                      {artists && <p className="line-clamp-1 text-xs text-white/60">{artists}</p>}
                    </div>
                    {!work.isActive && (
                      <span className="border border-white/30 px-2 py-1 text-xs text-white/50">
                        {dictionary.inactive}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 text-sm text-white/50">
                    {work.year && <span>{work.year}</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/projets/${work.id}`}
                      className="flex-1 border-2 border-white/20 px-3 py-2 text-center text-sm transition-colors hover:border-[#d5ff0a]"
                    >
                      {dictionary.edit}
                    </Link>
                    <DeleteWorkButton
                      workId={work.id}
                      workTitle={frTitle}
                      dictionary={dictionary}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
