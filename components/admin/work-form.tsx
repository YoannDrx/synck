"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ImageUploader } from "./image-uploader"
import type { AdminDictionary } from "@/types/dictionary"
import type {
  Work,
  WorkTranslation,
  Asset,
  Category,
  Label,
  Contribution,
  Composer,
  WorkImage,
} from "@prisma/client"

interface WorkWithRelations extends Work {
  translations: WorkTranslation[]
  coverImage: Asset | null
  category: Category & { translations: any[] }
  label: (Label & { translations: any[] }) | null
  contributions: (Contribution & {
    composer: Composer & { translations: any[] }
  })[]
  images: (WorkImage & { image: Asset })[]
}

interface WorkFormProps {
  dictionary: AdminDictionary
  work?: WorkWithRelations
  mode: "create" | "edit"
}

interface ComposerOption {
  id: string
  name: string
}

interface CategoryOption {
  id: string
  name: string
}

interface LabelOption {
  id: string
  name: string
}

export function WorkForm({ dictionary, work, mode }: WorkFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Options for selects
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [labels, setLabels] = useState<LabelOption[]>([])
  const [composers, setComposers] = useState<ComposerOption[]>([])

  // Get translations by locale
  const frTranslation = work?.translations.find((t) => t.locale === "fr")
  const enTranslation = work?.translations.find((t) => t.locale === "en")

  // Form state
  const [formData, setFormData] = useState({
    slug: work?.slug || "",
    categoryId: work?.categoryId || "",
    labelId: work?.labelId || null,
    coverImageId: work?.coverImageId || null,
    coverImageUrl: work?.coverImage?.path || null,
    year: work?.year || null,
    duration: work?.duration || "",
    status: work?.status || "PUBLISHED",
    spotifyUrl: work?.spotifyUrl || "",
    releaseDate: work?.releaseDate || "",
    genre: work?.genre || "",
    isrcCode: work?.isrcCode || "",
    order: work?.order || 0,
    isActive: work?.isActive ?? true,
    isFeatured: work?.isFeatured ?? false,
    translations: {
      fr: {
        title: frTranslation?.title || "",
        description: frTranslation?.description || "",
        role: frTranslation?.role || "",
      },
      en: {
        title: enTranslation?.title || "",
        description: enTranslation?.description || "",
        role: enTranslation?.role || "",
      },
    },
    composers:
      work?.contributions.map((c) => ({
        composerId: c.composerId,
        role: c.role || "",
        order: c.order,
      })) || [],
    imageIds: work?.images.map((wi) => wi.imageId) || [],
    imageUrls: work?.images.map((wi) => wi.image.path) || [],
  })

  // Load categories, labels, and composers
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load categories
        const categoriesRes = await fetch("/api/admin/categories")
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(
            categoriesData.map((cat: any) => ({
              id: cat.id,
              name:
                cat.translations.find((t: any) => t.locale === "fr")?.name ||
                "Sans nom",
            }))
          )
        }

        // Load labels
        const labelsRes = await fetch("/api/admin/labels")
        if (labelsRes.ok) {
          const labelsData = await labelsRes.json()
          setLabels(
            labelsData.map((label: any) => ({
              id: label.id,
              name:
                label.translations.find((t: any) => t.locale === "fr")?.name ||
                "Sans nom",
            }))
          )
        }

        // Load composers
        const composersRes = await fetch("/api/admin/composers")
        if (composersRes.ok) {
          const composersData = await composersRes.json()
          setComposers(
            composersData.map((comp: any) => ({
              id: comp.id,
              name:
                comp.translations.find((t: any) => t.locale === "fr")?.name ||
                "Sans nom",
            }))
          )
        }
      } catch (err) {
        console.error("Error loading options:", err)
      }
    }

    loadOptions()
  }, [])

  const handleCoverImageUploaded = async (image: any) => {
    // Create Asset in database
    const response = await fetch("/api/admin/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: image.url,
        width: image.width,
        height: image.height,
        aspectRatio: image.aspectRatio,
        blurDataUrl: image.blurDataUrl,
      }),
    })

    if (response.ok) {
      const asset = await response.json()
      setFormData((prev) => ({
        ...prev,
        coverImageId: asset.id,
        coverImageUrl: asset.path,
      }))
    }
  }

  const handleCoverImageRemoved = () => {
    setFormData((prev) => ({
      ...prev,
      coverImageId: null,
      coverImageUrl: null,
    }))
  }

  const handleAddComposer = () => {
    setFormData((prev) => ({
      ...prev,
      composers: [
        ...prev.composers,
        { composerId: "", role: "", order: prev.composers.length },
      ],
    }))
  }

  const handleRemoveComposer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      composers: prev.composers.filter((_, i) => i !== index),
    }))
  }

  const handleComposerChange = (
    index: number,
    field: "composerId" | "role" | "order",
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      composers: prev.composers.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      ),
    }))
  }

  const handleWorkImageUploaded = async (image: any) => {
    // Create Asset in database
    const response = await fetch("/api/admin/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: image.url,
        width: image.width,
        height: image.height,
        aspectRatio: image.aspectRatio,
        blurDataUrl: image.blurDataUrl,
      }),
    })

    if (response.ok) {
      const asset = await response.json()
      setFormData((prev) => ({
        ...prev,
        imageIds: [...prev.imageIds, asset.id],
        imageUrls: [...prev.imageUrls, asset.path],
      }))
    }
  }

  const handleRemoveWorkImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageIds: prev.imageIds.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const url =
        mode === "create" ? "/api/admin/works" : `/api/admin/works/${work?.id}`

      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: formData.slug,
          categoryId: formData.categoryId,
          labelId: formData.labelId,
          coverImageId: formData.coverImageId,
          year: formData.year,
          duration: formData.duration || null,
          status: formData.status,
          spotifyUrl: formData.spotifyUrl || null,
          releaseDate: formData.releaseDate || null,
          genre: formData.genre || null,
          isrcCode: formData.isrcCode || null,
          order: formData.order,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          translations: formData.translations,
          composers: formData.composers.filter((c) => c.composerId),
          imageIds: formData.imageIds,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'enregistrement")
      }

      // Success - redirect to list
      router.push("/admin/oeuvres")
      router.refresh()
    } catch (err) {
      console.error("Submit error:", err)
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement"
      )
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="border-2 border-red-500/50 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Slug * <span className="text-white/50">(URL unique)</span>
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            }))
          }
          required
          placeholder="mon-album-2024"
          className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
        />
      </div>

      {/* French Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇫🇷 Français</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titre *</label>
            <input
              type="text"
              value={formData.translations.fr.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, title: e.target.value },
                  },
                }))
              }
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.translations.fr.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: {
                      ...prev.translations.fr,
                      description: e.target.value,
                    },
                  },
                }))
              }
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rôle <span className="text-white/50">(ex: Piano)</span>
            </label>
            <input
              type="text"
              value={formData.translations.fr.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, role: e.target.value },
                  },
                }))
              }
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* English Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇬🇧 English</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.translations.en.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, title: e.target.value },
                  },
                }))
              }
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.translations.en.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: {
                      ...prev.translations.en,
                      description: e.target.value,
                    },
                  },
                }))
              }
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Role <span className="text-white/50">(ex: Piano)</span>
            </label>
            <input
              type="text"
              value={formData.translations.en.role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, role: e.target.value },
                  },
                }))
              }
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category & Label */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Catégorie *</label>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            required
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Label</label>
          <select
            value={formData.labelId || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                labelId: e.target.value || null,
              }))
            }
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          >
            <option value="">Aucun label</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-4">Image de couverture</label>
        <ImageUploader
          dictionary={dictionary.common}
          currentImage={formData.coverImageUrl}
          onImageUploaded={handleCoverImageUploaded}
          onImageRemoved={handleCoverImageRemoved}
        />
      </div>

      {/* Year, Duration, Genre */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Année</label>
          <input
            type="number"
            value={formData.year || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                year: e.target.value ? parseInt(e.target.value) : null,
              }))
            }
            placeholder="2024"
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Durée <span className="text-white/50">(ex: 42:30)</span>
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, duration: e.target.value }))
            }
            placeholder="42:30"
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, genre: e.target.value }))
            }
            placeholder="Classique"
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>
      </div>

      {/* Spotify URL & Release Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Spotify URL</label>
          <input
            type="url"
            value={formData.spotifyUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, spotifyUrl: e.target.value }))
            }
            placeholder="https://open.spotify.com/..."
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date de sortie</label>
          <input
            type="date"
            value={formData.releaseDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, releaseDate: e.target.value }))
            }
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>
      </div>

      {/* ISRC Code & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Code ISRC</label>
          <input
            type="text"
            value={formData.isrcCode}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isrcCode: e.target.value }))
            }
            placeholder="FR-XXX-XX-XXXXX"
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Statut</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>
      </div>

      {/* Composers */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#d5ff0a]">Compositeurs</h3>
          <button
            type="button"
            onClick={handleAddComposer}
            className="border-2 border-[#d5ff0a] text-[#d5ff0a] px-4 py-2 text-sm hover:bg-[#d5ff0a]/10 transition-colors"
          >
            + Ajouter un compositeur
          </button>
        </div>

        <div className="space-y-4">
          {formData.composers.map((composer, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-2 border-white/10 bg-black/20"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Compositeur *
                </label>
                <select
                  value={composer.composerId}
                  onChange={(e) =>
                    handleComposerChange(index, "composerId", e.target.value)
                  }
                  required
                  className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
                >
                  <option value="">Sélectionner un compositeur</option>
                  {composers.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleRemoveComposer(index)}
                  className="w-full border-2 border-red-500/50 text-red-400 px-4 py-3 text-sm hover:bg-red-500/10 transition-colors"
                >
                  Retirer
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Rôle <span className="text-white/50">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={composer.role}
                  onChange={(e) =>
                    handleComposerChange(index, "role", e.target.value)
                  }
                  placeholder="Compositeur principal"
                  className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ordre</label>
                <input
                  type="number"
                  value={composer.order}
                  onChange={(e) =>
                    handleComposerChange(
                      index,
                      "order",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
                />
              </div>
            </div>
          ))}

          {formData.composers.length === 0 && (
            <p className="text-white/50 text-sm italic">
              Aucun compositeur ajouté
            </p>
          )}
        </div>
      </div>

      {/* Work Images */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#d5ff0a]">
            Images supplémentaires
          </h3>
        </div>

        <div className="space-y-4">
          <ImageUploader
            dictionary={dictionary.common}
            currentImage={null}
            onImageUploaded={handleWorkImageUploaded}
            onImageRemoved={() => {}}
          />

          {formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative border-2 border-white/20 p-2"
                >
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveWorkImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.imageUrls.length === 0 && (
            <p className="text-white/50 text-sm italic">Aucune image ajoutée</p>
          )}
        </div>
      </div>

      {/* Order, Active, Featured */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Ordre d'affichage
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                order: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Actif</label>
          <label className="flex items-center space-x-3 border-2 border-white/20 px-4 py-3 cursor-pointer hover:border-[#d5ff0a] transition-colors">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-5 h-5"
            />
            <span>{dictionary.common.active}</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mis en avant</label>
          <label className="flex items-center space-x-3 border-2 border-white/20 px-4 py-3 cursor-pointer hover:border-[#d5ff0a] transition-colors">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isFeatured: e.target.checked,
                }))
              }
              className="w-5 h-5"
            />
            <span>Oui</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 pt-4 border-t-2 border-white/20">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#d5ff0a] text-black font-bold px-6 py-3 hover:bg-[#c5ef00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? dictionary.common.saving
            : mode === "create"
            ? dictionary.common.create
            : dictionary.common.save}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/oeuvres")}
          disabled={isSubmitting}
          className="border-2 border-white/20 px-6 py-3 hover:border-[#d5ff0a] transition-colors disabled:opacity-50"
        >
          {dictionary.common.cancel}
        </button>
      </div>
    </form>
  )
}
