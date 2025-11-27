'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { ParallaxCard } from '@/components/motion'

import type { HomeDictionary } from '@/types/dictionary'

import { AnimatedSection, SectionHeader } from './animated-section'

type ExpertiseCard = {
  id: string
  slug: string
  href: string
  title: string
  subtitle: string
  imgHome: string
  description: string
}

type ExpertisesSectionCopy = HomeDictionary['expertises']

type ExpertisesSectionProps = {
  locale: Locale
  copy: ExpertisesSectionCopy
}

const expertiseAccents = [
  {
    gradient: 'from-[#d5ff0a]/30 via-[#9eff00]/20 to-transparent',
    border: 'border-[#d5ff0a]/40',
    hoverBorder: 'hover:border-[#d5ff0a]/80',
    glow: 'hover:shadow-[0_0_40px_rgba(213,255,10,0.25)]',
    badge: 'bg-[#d5ff0a]/20 text-[#d5ff0a] border-[#d5ff0a]/30',
    accent: '#d5ff0a',
  },
  {
    gradient: 'from-[#4ecdc4]/30 via-[#45b7aa]/20 to-transparent',
    border: 'border-[#4ecdc4]/40',
    hoverBorder: 'hover:border-[#4ecdc4]/80',
    glow: 'hover:shadow-[0_0_40px_rgba(78,205,196,0.25)]',
    badge: 'bg-[#4ecdc4]/20 text-[#4ecdc4] border-[#4ecdc4]/30',
    accent: '#4ecdc4',
  },
  {
    gradient: 'from-[#a855f7]/30 via-[#7c3aed]/20 to-transparent',
    border: 'border-[#a855f7]/40',
    hoverBorder: 'hover:border-[#a855f7]/80',
    glow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]',
    badge: 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30',
    accent: '#a855f7',
  },
]

export function ExpertisesSection({ locale, copy }: ExpertisesSectionProps) {
  const [expertises, setExpertises] = useState<ExpertiseCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchExpertises() {
      try {
        const response = await fetch(`/api/expertises?locale=${locale}&limit=3`)
        if (!response.ok) {
          throw new Error('Failed to fetch expertises')
        }
        const data = (await response.json()) as ExpertiseCard[]
        setExpertises(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    void fetchExpertises()
  }, [locale])

  if (loading) {
    return (
      <AnimatedSection id="expertises" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="relative overflow-hidden rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <Skeleton variant="shimmer" className="aspect-[16/10] w-full" />
              <Skeleton variant="shimmer" className="mt-4 h-6 w-3/4" rounded="lg" />
              <Skeleton variant="shimmer" className="mt-3 h-4 w-full" rounded="lg" />
              <Skeleton variant="shimmer" className="mt-2 h-4 w-2/3" rounded="lg" />
            </div>
          ))}
        </div>
      </AnimatedSection>
    )
  }

  if (error) {
    return (
      <AnimatedSection id="expertises" className="space-y-8">
        <div className="py-12 text-center text-[var(--color-error)]">{copy.error}</div>
      </AnimatedSection>
    )
  }

  return (
    <AnimatedSection id="expertises" className="space-y-8 overflow-visible" scrollParallax>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
        <Button asChild variant="outline" className="inline-flex items-center gap-2 rounded-full">
          <Link href={`/${locale}/expertises`}>
            {copy.viewAll}
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="-mx-6 px-6 py-4">
        <div className="grid gap-5 md:grid-cols-3">
          {expertises.map((expertise, index) => {
            const accent = expertiseAccents[index % expertiseAccents.length]
            return (
              <ParallaxCard
                key={expertise.id}
                index={index}
                parallaxSpeed={0.12}
                className="h-full"
              >
                <Link
                  href={expertise.href}
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden',
                    'rounded-2xl border-2',
                    'bg-[var(--color-surface)]',
                    'transition-all duration-300',
                    'hover:-translate-y-1',
                    accent.border,
                    accent.hoverBorder,
                    accent.glow
                  )}
                >
                  {/* Gradient overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-60',
                      'bg-gradient-to-br',
                      accent.gradient
                    )}
                  />

                  {/* Image section */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${expertise.imgHome})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/20 to-transparent" />

                    {/* Badge numéro */}
                    <div
                      className={cn(
                        'absolute top-4 right-4 rounded-full border px-3 py-1',
                        'text-xs font-bold tracking-wider uppercase',
                        'backdrop-blur-sm transition-all duration-300',
                        accent.badge
                      )}
                    >
                      0{index + 1}
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
                    <h3 className="line-clamp-1 text-xl leading-tight font-bold text-[var(--color-text-primary)] transition-colors duration-300">
                      {expertise.title}
                    </h3>

                    <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {expertise.description}
                    </p>

                    <div
                      className="mt-auto flex items-center gap-2 text-sm font-semibold transition-colors duration-300"
                      style={{ color: accent.accent }}
                    >
                      {copy.cardCta}
                      <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </ParallaxCard>
            )
          })}
        </div>
      </div>
    </AnimatedSection>
  )
}
