'use client'

import { useEffect, useRef } from 'react'

type YouTubeModalProps = {
  youtubeUrl: string
  title: string
  isOpen: boolean
  onClose: () => void
}

// Extrait l'ID YouTube de différents formats d'URL
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = regExp.exec(url)
  return match?.[7].length === 11 ? match[7] : null
}

export function YouTubeModal({ youtubeUrl, title, isOpen, onClose }: YouTubeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const videoId = extractYouTubeId(youtubeUrl)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !videoId) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="youtube-modal-title"
    >
      <div className="relative w-full max-w-6xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 -right-4 text-white transition-colors hover:text-[var(--brand-neon)]"
          aria-label="Fermer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Video title */}
        <h2 id="youtube-modal-title" className="mb-4 text-2xl font-bold text-white">
          {title}
        </h2>

        {/* YouTube player - aspect ratio 16:9 */}
        <div
          className="relative overflow-hidden border-4 border-[var(--brand-neon)] bg-black"
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
