'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { ParallaxCard } from '@/components/motion'

import type { HomeDictionary } from '@/types/dictionary'

import { AnimatedSection, SectionHeader } from './animated-section'

type GalleryWork = {
  id: string
  slug: string
  title: string
  subtitle?: string
  category: string
  coverImage: string
  coverImageAlt: string
  artists: string[]
}

type ProjectsCopy = HomeDictionary['projects']

type ProjectsSectionProps = {
  locale: Locale
  copy: ProjectsCopy
}

const accentColors = [
  {
    gradient: 'from-[#d5ff0a]/25 via-[#9eff00]/15 to-transparent',
    border: 'border-[#d5ff0a]/30',
    hoverBorder: 'hover:border-[#d5ff0a]/70',
    glow: 'hover:shadow-[0_0_30px_rgba(213,255,10,0.3)]',
  },
  {
    gradient: 'from-[#ff6b6b]/25 via-[#ff8e53]/15 to-transparent',
    border: 'border-[#ff6b6b]/30',
    hoverBorder: 'hover:border-[#ff6b6b]/70',
    glow: 'hover:shadow-[0_0_30px_rgba(255,107,107,0.3)]',
  },
  {
    gradient: 'from-[#4ecdc4]/25 via-[#45b7aa]/15 to-transparent',
    border: 'border-[#4ecdc4]/30',
    hoverBorder: 'hover:border-[#4ecdc4]/70',
    glow: 'hover:shadow-[0_0_30px_rgba(78,205,196,0.3)]',
  },
  {
    gradient: 'from-[#a855f7]/25 via-[#7c3aed]/15 to-transparent',
    border: 'border-[#a855f7]/30',
    hoverBorder: 'hover:border-[#a855f7]/70',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
  },
]

export function ProjectsSection({ locale, copy }: ProjectsSectionProps) {
  const [works, setWorks] = useState<GalleryWork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorks() {
      try {
        const response = await fetch(`/api/projets?locale=${locale}&limit=4`)
        if (!response.ok) {
          throw new Error('Failed to fetch projets')
        }
        const data = (await response.json()) as GalleryWork[]
        setWorks(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    void fetchWorks()
  }, [locale])

  if (loading) {
    return (
      <AnimatedSection id="projects" className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((id) => (
            <div
              key={id}
              className="relative overflow-hidden rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <Skeleton variant="shimmer" className="aspect-[4/3] w-full" />
              <Skeleton variant="shimmer" className="mt-3 h-5 w-3/4" rounded="lg" />
              <Skeleton variant="shimmer" className="mt-2 h-4 w-1/2" rounded="lg" />
            </div>
          ))}
        </div>
      </AnimatedSection>
    )
  }

  if (error) {
    return (
      <AnimatedSection id="projects" className="space-y-8">
        <div className="py-12 text-center text-[var(--color-error)]">{copy.error}</div>
      </AnimatedSection>
    )
  }

  return (
    <AnimatedSection id="projects" className="space-y-8 overflow-visible" scrollParallax>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
        <Button asChild variant="outline" className="inline-flex items-center gap-2 rounded-full">
          <Link href={`/${locale}/projets`}>
            {copy.viewAll}
            <span aria-hidden>↗</span>
          </Link>
        </Button>
      </div>

      <div className="-mx-6 px-6 py-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {works.map((work, index) => {
            const accent = accentColors[index % accentColors.length]
            return (
              <ParallaxCard key={work.id} index={index} parallaxSpeed={0.15}>
                <Link
                  href={`/${locale}/projets/${work.slug}`}
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden',
                    'rounded-[var(--radius-xl)] border-2',
                    'bg-[var(--color-surface)] p-4',
                    'transition-all duration-300',
                    'hover:-translate-y-1',
                    accent.border,
                    accent.hoverBorder,
                    accent.glow
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-80',
                      'bg-gradient-to-br',
                      accent.gradient
                    )}
                  />
                  <div className="relative z-10 flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between text-[0.6rem] font-semibold tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
                      <span className="truncate">{work.category}</span>
                      <span className="shrink-0">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={work.coverImage}
                        alt={work.coverImageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <h3 className="line-clamp-1 text-base leading-tight font-bold text-[var(--color-text-primary)]">
                      {work.title}
                    </h3>

                    <div className="mt-auto flex min-h-[26px] flex-wrap items-start gap-1.5">
                      {work.artists.slice(0, 2).map((artist) => (
                        <Badge
                          key={artist}
                          variant="outline"
                          size="sm"
                          className="text-[0.55rem] tracking-[0.15em] uppercase"
                        >
                          {artist}
                        </Badge>
                      ))}
                      {work.artists.length > 2 && (
                        <Badge variant="outline" size="sm" className="text-[0.55rem]">
                          +{work.artists.length - 2}
                        </Badge>
                      )}
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
