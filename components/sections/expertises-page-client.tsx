'use client'

import Link from 'next/link'
import { useRef } from 'react'

import { motion, useInView } from 'framer-motion'

import type { Locale } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'

import { Breadcrumb } from '@/components/breadcrumb'
import { PageLayout } from '@/components/layout/page-layout'

type Expertise = {
  slug: string
  title: string
  description: string
  imgHome: string
}

type ExpertisesPageClientProps = {
  locale: Locale
  expertises: Expertise[]
  nav: {
    home: string
    expertises: string
  }
  copy: {
    description: string
    cardCta: string
  }
}

const expertiseAccents = [
  {
    border: 'border-[#d5ff0a]/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(213,255,10,0.15)]',
    focusColor: 'text-[#d5ff0a]',
    bg: 'bg-[#d5ff0a]/5',
    badge: 'bg-[#d5ff0a]/20 text-[#d5ff0a]',
  },
  {
    border: 'border-[#4ecdc4]/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(78,205,196,0.15)]',
    focusColor: 'text-[#4ecdc4]',
    bg: 'bg-[#4ecdc4]/5',
    badge: 'bg-[#4ecdc4]/20 text-[#4ecdc4]',
  },
  {
    border: 'border-[#a855f7]/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    focusColor: 'text-[#a855f7]',
    bg: 'bg-[#a855f7]/5',
    badge: 'bg-[#a855f7]/20 text-[#a855f7]',
  },
  {
    border: 'border-[#ff6b6b]/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(255,107,107,0.15)]',
    focusColor: 'text-[#ff6b6b]',
    bg: 'bg-[#ff6b6b]/5',
    badge: 'bg-[#ff6b6b]/20 text-[#ff6b6b]',
  },
  {
    border: 'border-[#f472b6]/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(244,114,182,0.15)]',
    focusColor: 'text-[#f472b6]',
    bg: 'bg-[#f472b6]/5',
    badge: 'bg-[#f472b6]/20 text-[#f472b6]',
  },
  {
    border: 'border-[#fb923c]/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(251,146,60,0.15)]',
    focusColor: 'text-[#fb923c]',
    bg: 'bg-[#fb923c]/5',
    badge: 'bg-[#fb923c]/20 text-[#fb923c]',
  },
]

export function ExpertisesPageClient({ locale, expertises, nav, copy }: ExpertisesPageClientProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1600px]">
      <Breadcrumb items={[{ label: nav.home, href: `/${locale}` }, { label: nav.expertises }]} />

      {/* Main Bento Container */}
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6 lg:p-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 lg:mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-[#d5ff0a]">{nav.expertises.charAt(0)}</span>
            {nav.expertises.slice(1)}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/50">{copy.description}</p>
        </motion.div>

        {/* Expertises Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {expertises.map((expertise, idx) => (
            <motion.div
              key={expertise.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
            >
              <ExpertiseCard
                expertise={expertise}
                index={idx}
                locale={locale}
                cardCta={copy.cardCta}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </PageLayout>
  )
}

/** Expertise Card Component */
function ExpertiseCard({
  expertise,
  index,
  locale,
  cardCta,
}: {
  expertise: Expertise
  index: number
  locale: Locale
  cardCta: string
}) {
  const accent = expertiseAccents[index % expertiseAccents.length]

  return (
    <Link
      data-testid="expertise-card"
      href={`/${locale}/expertises/${expertise.slug}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden',
        'rounded-[24px] border-2 border-white/10 bg-white/[0.02]',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:border-white/20',
        accent.glow
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${expertise.imgHome})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />

        {/* Badge */}
        <div
          className={cn(
            'absolute top-3 right-3 rounded-full px-2.5 py-1',
            'text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm',
            accent.badge
          )}
        >
          0{index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold text-white transition-colors duration-300">
          {expertise.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-white/50">
          {expertise.description}
        </p>

        <div
          className={cn(
            'mt-auto flex items-center gap-2 text-sm font-semibold transition-colors duration-300',
            accent.focusColor
          )}
        >
          {cardCta}
          <span className="transform transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
