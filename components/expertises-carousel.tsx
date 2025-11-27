'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { motion } from 'framer-motion'

type ExpertiseCard = {
  id: string
  slug: string
  href: string
  title: string
  subtitle: string
  imgHome: string
}

type ExpertisesCarouselProps = {
  expertises: ExpertiseCard[]
  currentSlug: string
  locale: string
  title?: string
  description?: string
}

export function ExpertisesCarousel({
  expertises,
  currentSlug,
  title = 'Découvrez nos autres expertises',
  description = "Explorez l'ensemble de nos domaines d'intervention",
}: ExpertisesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter out current expertise
  const otherExpertises = expertises.filter((exp) => exp.slug !== currentSlug)

  if (otherExpertises.length === 0) {
    return null
  }

  // Number of items to show at once (responsive)
  const itemsPerPage = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }

  const maxIndex = Math.max(0, otherExpertises.length - itemsPerPage.desktop)

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < maxIndex

  return (
    <div className="mt-20 rounded-[32px] border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)] md:p-12">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white uppercase md:text-4xl lg:text-5xl">
          <span className="bg-[var(--gradient-brand-short)] bg-clip-text text-transparent">
            {title.charAt(0)}
          </span>
          <span>{title.slice(1)}</span>
        </h2>
        {description && <p className="max-w-2xl text-lg text-white/70">{description}</p>}
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`group flex items-center gap-2 border-2 px-4 py-2 text-sm font-bold uppercase transition-all duration-200 ${
              canGoPrev
                ? 'cursor-pointer border-[var(--brand-neon)] text-[var(--brand-neon)] hover:bg-[var(--brand-neon)] hover:text-black'
                : 'cursor-not-allowed border-white/20 text-white/30'
            } `}
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Précédent</span>
          </button>

          <div className="text-sm text-white/50">
            {currentIndex + 1} / {maxIndex + 1}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`group flex items-center gap-2 border-2 px-4 py-2 text-sm font-bold uppercase transition-all duration-200 ${
              canGoNext
                ? 'cursor-pointer border-[var(--brand-neon)] text-[var(--brand-neon)] hover:bg-[var(--brand-neon)] hover:text-black'
                : 'cursor-not-allowed border-white/20 text-white/30'
            } `}
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="text-xl">→</span>
          </button>
        </div>

        {/* Cards Container */}
        <div className="overflow-hidden">
          <motion.div
            animate={{
              x: `-${String(currentIndex * (100 / itemsPerPage.desktop))}%`,
            }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="flex"
          >
            {otherExpertises.map((expertise) => (
              <div
                key={expertise.slug}
                className="w-full flex-shrink-0 px-2 md:w-1/2 md:px-3 lg:w-1/3"
              >
                <Link
                  href={expertise.href}
                  className="group flex h-full flex-col overflow-hidden border-4 border-white/10 bg-black/40 transition-all duration-300 hover:border-[var(--brand-neon)] hover:shadow-[0_0_30px_rgba(213,255,10,0.3)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] flex-shrink-0 overflow-hidden">
                    {expertise.imgHome ? (
                      <>
                        <Image
                          src={expertise.imgHome}
                          alt={expertise.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-grow flex-col p-6">
                    <h3 className="mb-2 text-xl font-bold tracking-tight text-white uppercase transition-colors group-hover:text-[var(--brand-neon)] md:text-2xl">
                      {expertise.title}
                    </h3>
                    <p className="line-clamp-2 flex-grow text-sm text-white/70 md:text-base">
                      {expertise.subtitle}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[var(--brand-neon)] uppercase">
                      <span>En savoir plus</span>
                      <span className="transition-transform group-hover:translate-x-2">→</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-[var(--brand-neon)]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              } `}
              aria-label={`Aller à la page ${String(index + 1)}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
