"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ImageUploader } from "./image-uploader"
import type { AdminDictionary } from "@/types/dictionary"
import type { Composer, ComposerTranslation, Asset } from "@prisma/client"

type ComposerWithRelations = {
  translations: ComposerTranslation[]
  image: Asset | null
} & Composer

type ComposerFormProps = {
  dictionary: AdminDictionary
  composer?: ComposerWithRelations
  mode: "create" | "edit"
}

export function ComposerForm({ dictionary, composer, mode }: ComposerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get translations by locale
  const frTranslation = composer?.translations.find((t) => t.locale === "fr")
  const enTranslation = composer?.translations.find((t) => t.locale === "en")

  // Form state
  const [formData, setFormData] = useState({
    slug: composer?.slug ?? "",
    imageId: composer?.imageId ?? null,
    imageUrl: composer?.image?.path ?? null,
    externalUrl: composer?.externalUrl ?? "",
    order: composer?.order ?? 0,
    isActive: composer?.isActive ?? true,
    translations: {
      fr: {
        name: frTranslation?.name ?? "",
        bio: frTranslation?.bio ?? "",
      },
      en: {
        name: enTranslation?.name ?? "",
        bio: enTranslation?.bio ?? "",
      },
    },
  })

  const handleImageUploaded = async (image: { url: string; width: number; height: number; aspectRatio: number; blurDataUrl: string }) => {
    // First, create Asset in database
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
      const asset = await response.json() as { id: string; path: string }
      setFormData((prev) => ({
        ...prev,
        imageId: asset.id,
        imageUrl: asset.path,
      }))
    }
  }

  const handleImageRemoved = () => {
    setFormData((prev) => ({
      ...prev,
      imageId: null,
      imageUrl: null,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const url =
        mode === "create"
          ? "/api/admin/composers"
          : `/api/admin/composers/${composer?.id ?? ''}`

      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: formData.slug,
          imageId: formData.imageId,
          externalUrl: formData.externalUrl || null,
          order: formData.order,
          isActive: formData.isActive,
          translations: formData.translations,
        }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        throw new Error(data.error ?? "Erreur lors de l'enregistrement")
      }

      // Success - redirect to list
      router.push("/admin/compositeurs")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-8">
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
            { setFormData((prev) => ({
              ...prev,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            })); }
          }
          required
          placeholder="maurice-ravel"
          className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
        />
      </div>

      {/* French Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇫🇷 Français</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.composers.fields.nameLabel} *
            </label>
            <input
              type="text"
              value={formData.translations.fr.name}
              onChange={(e) =>
                { setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, name: e.target.value },
                  },
                })); }
              }
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.composers.fields.bioLabel}
            </label>
            <textarea
              value={formData.translations.fr.bio}
              onChange={(e) =>
                { setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, bio: e.target.value },
                  },
                })); }
              }
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* English Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇬🇧 English</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.composers.fields.nameLabel} *
            </label>
            <input
              type="text"
              value={formData.translations.en.name}
              onChange={(e) =>
                { setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, name: e.target.value },
                  },
                })); }
              }
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.composers.fields.bioLabel}
            </label>
            <textarea
              value={formData.translations.en.bio}
              onChange={(e) =>
                { setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, bio: e.target.value },
                  },
                })); }
              }
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium mb-4">
          {dictionary.composers.fields.imageLabel}
        </label>
        <ImageUploader
          dictionary={dictionary.common}
          currentImage={formData.imageUrl}
          onImageUploaded={(img) => { void handleImageUploaded(img) }}
          onImageRemoved={handleImageRemoved}
        />
      </div>

      {/* External URL */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {dictionary.composers.fields.externalUrl}
        </label>
        <input
          type="url"
          value={formData.externalUrl}
          onChange={(e) =>
            { setFormData((prev) => ({ ...prev, externalUrl: e.target.value })); }
          }
          placeholder="https://www.youtube.com/..."
          className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
        />
      </div>

      {/* Order & Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ordre d&apos;affichage</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              { setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 })); }
            }
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Statut</label>
          <label className="flex items-center space-x-3 border-2 border-white/20 px-4 py-3 cursor-pointer hover:border-[#d5ff0a] transition-colors">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                { setFormData((prev) => ({ ...prev, isActive: e.target.checked })); }
              }
              className="w-5 h-5"
            />
            <span>{dictionary.common.active}</span>
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
          onClick={() => { router.push("/admin/compositeurs"); }}
          disabled={isSubmitting}
          className="border-2 border-white/20 px-6 py-3 hover:border-[#d5ff0a] transition-colors disabled:opacity-50"
        >
          {dictionary.common.cancel}
        </button>
      </div>
    </form>
  )
}
