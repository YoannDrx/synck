"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { DeleteWorkButton } from "./delete-work-button"
import type {
  Work,
  WorkTranslation,
  Category,
  CategoryTranslation,
  Label,
  LabelTranslation,
  Contribution,
  Composer,
  ComposerTranslation,
  Asset,
} from "@prisma/client"

type WorkWithRelations = Work & {
  translations: WorkTranslation[]
  category: Category & {
    translations: CategoryTranslation[]
  }
  label: (Label & { translations: LabelTranslation[] }) | null
  coverImage: Asset | null
  contributions: (Contribution & {
    composer: Composer & {
      translations: ComposerTranslation[]
    }
  })[]
}

type CategoryWithTranslations = Category & {
  translations: CategoryTranslation[]
}

interface WorksFilterableListProps {
  works: WorkWithRelations[]
  categories: CategoryWithTranslations[]
  dictionary: any
}

export function WorksFilterableList({
  works,
  categories,
  dictionary,
}: WorksFilterableListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )

  // Filter works based on selected category
  const filteredWorks = useMemo(() => {
    if (!selectedCategoryId) return works
    return works.filter((work) => work.categoryId === selectedCategoryId)
  }, [works, selectedCategoryId])

  return (
    <>
      {/* Category Filters */}
      <div className="border-2 border-white/20 bg-white/5 p-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-white/60 mr-2">Filtrer par type :</span>
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 text-sm border-2 transition-colors ${
              selectedCategoryId === null
                ? "border-[#d5ff0a] bg-[#d5ff0a] text-black font-bold"
                : "border-white/20 hover:border-[#d5ff0a]"
            }`}
          >
            Tous ({works.length})
          </button>
          {categories.map((category) => {
            const categoryName =
              category.translations.find((t) => t.locale === "fr")?.name ||
              "Sans nom"
            const count = works.filter((w) => w.categoryId === category.id).length

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-4 py-2 text-sm border-2 transition-colors ${
                  selectedCategoryId === category.id
                    ? "border-[#d5ff0a] bg-[#d5ff0a] text-black font-bold"
                    : "border-white/20 hover:border-[#d5ff0a]"
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
          {selectedCategoryId && " dans cette catégorie"}
        </p>
      </div>

      {/* Works Grid */}
      {filteredWorks.length === 0 ? (
        <div className="border-2 border-white/20 bg-white/5 p-12 text-center">
          <p className="text-white/60 mb-4">
            {selectedCategoryId
              ? "Aucun projet dans cette catégorie"
              : "Aucun projet pour le moment"}
          </p>
          <Link
            href="/admin/projets/new"
            className="inline-block bg-[#d5ff0a] text-black font-bold px-6 py-3 hover:bg-[#c5ef00] transition-colors"
          >
            + Ajouter un projet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorks.map((work) => {
            const frTitle =
              work.translations.find((t) => t.locale === "fr")?.title ||
              "Sans titre"
            const category = work.category?.translations.find(
              (t) => t.locale === "fr"
            )?.name
            const composers = work.contributions
              .map(
                (c) =>
                  c.composer.translations.find((t) => t.locale === "fr")?.name
              )
              .filter(Boolean)
              .join(", ")

            return (
              <div
                key={work.id}
                className="border-2 border-white/20 bg-white/5 hover:border-[#d5ff0a] transition-all group"
              >
                {/* Cover Image */}
                {work.coverImage && (
                  <div className="relative aspect-square w-full bg-white/5">
                    <Image
                      src={work.coverImage.path}
                      alt={work.coverImage.alt || frTitle}
                      fill
                      className="object-cover"
                      placeholder={
                        work.coverImage.blurDataUrl ? "blur" : "empty"
                      }
                      blurDataURL={work.coverImage.blurDataUrl || undefined}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">
                        {frTitle}
                      </h3>
                      {category && (
                        <p className="text-sm text-[#d5ff0a] mb-1">
                          {category}
                        </p>
                      )}
                      {composers && (
                        <p className="text-xs text-white/60 line-clamp-1">
                          {composers}
                        </p>
                      )}
                    </div>
                    {!work.isActive && (
                      <span className="text-xs border border-white/30 px-2 py-1 text-white/50">
                        {dictionary.inactive}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-white/50 mb-4">
                    {work.year && <span>{work.year}</span>}
                    {work.year && work.duration && <span> • </span>}
                    {work.duration && <span>{work.duration}</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/projets/${work.id}`}
                      className="flex-1 text-center border-2 border-white/20 hover:border-[#d5ff0a] px-3 py-2 text-sm transition-colors"
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
