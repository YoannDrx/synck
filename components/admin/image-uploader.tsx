"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import type { AdminDictionary } from "@/types/dictionary"

type UploadedImage = {
  url: string
  pathname: string
  width: number
  height: number
  aspectRatio: number
  blurDataUrl: string
}

type ImageUploaderProps = {
  dictionary: AdminDictionary["common"]
  currentImage?: string | null
  onImageUploaded: (image: UploadedImage) => void
  onImageRemoved?: () => void
}

export function ImageUploader({
  dictionary,
  currentImage,
  onImageUploaded,
  onImageRemoved,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB")
      return
    }

    setError(null)
    setIsUploading(true)

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        throw new Error(data.error ?? "Erreur lors de l'upload")
      }

      const uploadedImage = await response.json() as UploadedImage
      onImageUploaded(uploadedImage)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload")
      setPreview(currentImage ?? null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageRemoved?.()
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      {preview && (
        <div className="relative border-2 border-white/20 bg-white/5 p-4">
          <div className="relative aspect-video w-full max-w-md">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="mt-4 border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 px-4 py-2 text-sm transition-colors"
          >
            {dictionary.removeImage}
          </button>
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => { void handleFileChange(e) }}
          disabled={isUploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`inline-block border-2 border-[#d5ff0a] bg-[#d5ff0a]/10 hover:bg-[#d5ff0a]/20 px-6 py-3 cursor-pointer transition-colors ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isUploading
            ? dictionary.uploadingImage
            : preview
            ? dictionary.changeImage
            : dictionary.uploadImage}
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="border-2 border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Info */}
      <p className="text-sm text-white/50">
        Formats acceptés : JPG, PNG, GIF, WebP. Taille max : 5MB
      </p>
    </div>
  )
}
