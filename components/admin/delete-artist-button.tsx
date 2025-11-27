'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { fetchWithAuth } from '@/lib/fetch-with-auth'

import type { AdminDictionary } from '@/types/dictionary'

type DeleteArtistButtonProps = {
  artistId: string
  artistName: string
  hasContributions: boolean
  dictionary: AdminDictionary['common']
}

export function DeleteArtistButton({
  artistId,
  hasContributions,
  dictionary,
}: DeleteArtistButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetchWithAuth(`/api/admin/artists/${artistId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        alert(data.error ?? 'Erreur lors de la suppression')
        setIsDeleting(false)
        return
      }

      router.refresh()
    } catch {
      alert('Erreur lors de la suppression')
      setIsDeleting(false)
    }
  }

  if (hasContributions) {
    return (
      <button
        type="button"
        disabled
        className="cursor-not-allowed border-2 border-white/10 px-3 py-2 text-sm text-white/30"
        title="Ce artiste a des contributions"
      >
        {dictionary.delete}
      </button>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => {
            void handleDelete()
          }}
          disabled={isDeleting}
          className="border-2 border-red-500/50 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          {isDeleting ? dictionary.deleting : 'Confirmer'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false)
          }}
          disabled={isDeleting}
          className="border-2 border-white/20 px-3 py-2 text-sm transition-colors hover:border-white/40"
        >
          Annuler
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setShowConfirm(true)
      }}
      className="border-2 border-red-500/50 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
    >
      {dictionary.delete}
    </button>
  )
}
