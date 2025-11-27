'use client'

import { useRef } from 'react'

import { motion, useInView } from 'framer-motion'

import type { Locale } from '@/lib/i18n-config'
import { cn } from '@/lib/utils'

import { Breadcrumb } from '@/components/breadcrumb'
import { ContactForm } from '@/components/contact-form'
import { PageLayout } from '@/components/layout/page-layout'

import type { ContactFormDictionary } from '@/types/dictionary'

type Service = {
  focus: string
  title: string
  description: string
}

type ContactPageClientProps = {
  locale: Locale
  nav: {
    home: string
    contact: string
  }
  copy: {
    heroDescription: string
    introTitle: string
    introDescription: string
    contactInfoTitle: string
    emailLabel: string
    emailValue: string
    locationLabel: string
    locationValue: string
    linkedinLabel: string
    linkedinUrl: string
    linkedinCta: string
    availabilityLabel: string
    availabilityValue: string
    servicesTitle: string
    services: Service[]
    consultationTitle: string
    consultationDescription: string
  }
  formDictionary: ContactFormDictionary
}

const serviceAccents = [
  {
    border: 'border-[#d5ff0a]/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(213,255,10,0.15)]',
    focusColor: 'text-[#d5ff0a]',
    bg: 'bg-[#d5ff0a]/5',
  },
  {
    border: 'border-[#4ecdc4]/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(78,205,196,0.15)]',
    focusColor: 'text-[#4ecdc4]',
    bg: 'bg-[#4ecdc4]/5',
  },
  {
    border: 'border-[#a855f7]/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
    focusColor: 'text-[#a855f7]',
    bg: 'bg-[#a855f7]/5',
  },
]

export function ContactPageClient({ locale, nav, copy, formDictionary }: ContactPageClientProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <PageLayout orbsConfig="subtle" className="mx-auto max-w-[1600px]">
      <Breadcrumb items={[{ label: nav.home, href: `/${locale}` }, { label: nav.contact }]} />

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
            <span className="text-[#d5ff0a]">{nav.contact.charAt(0)}</span>
            {nav.contact.slice(1)}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/50">{copy.heroDescription}</p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid gap-4 lg:grid-cols-[1fr,0.8fr] lg:gap-6">
          {/* Left Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[24px] border-2 border-white/10 bg-white/[0.02] p-5 sm:p-6 lg:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs tracking-[0.4em] text-white/40 uppercase">
                {copy.introTitle}
              </h2>
              <span className="flex items-center gap-2 text-xs tracking-[0.3em] text-white/40 uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#d5ff0a]" />
                Online
              </span>
            </div>
            <p className="mb-6 text-sm text-white/50">{copy.introDescription}</p>
            <ContactForm dictionary={formDictionary} />
          </motion.div>

          {/* Right Column - Info & Services */}
          <div className="flex flex-col gap-4 lg:gap-6">
            {/* Contact Info Box */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-[24px] border-2 border-white/10 bg-white/[0.02] p-5 sm:p-6"
            >
              <h3 className="mb-5 text-xs tracking-[0.4em] text-white/40 uppercase">
                {copy.contactInfoTitle}
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="group">
                  <p className="mb-1 text-[10px] tracking-[0.3em] text-[#d5ff0a]/70 uppercase">
                    {copy.emailLabel}
                  </p>
                  <a
                    href={`mailto:${copy.emailValue}`}
                    className="text-sm font-medium text-white/90 transition-colors hover:text-[#d5ff0a]"
                  >
                    {copy.emailValue}
                  </a>
                </div>

                {/* Location */}
                <div>
                  <p className="mb-1 text-[10px] tracking-[0.3em] text-[#4ecdc4]/70 uppercase">
                    {copy.locationLabel}
                  </p>
                  <p className="text-sm font-medium text-white/90">{copy.locationValue}</p>
                </div>

                {/* LinkedIn */}
                <div>
                  <p className="mb-1 text-[10px] tracking-[0.3em] text-[#a855f7]/70 uppercase">
                    {copy.linkedinLabel}
                  </p>
                  <a
                    href={copy.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition-colors hover:text-[#a855f7]"
                  >
                    {copy.linkedinCta}
                    <span className="text-xs">↗</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Services Grid - 3 mini cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-[24px] border-2 border-white/10 bg-white/[0.02] p-5 sm:p-6"
            >
              <h3 className="mb-4 text-xs tracking-[0.4em] text-white/40 uppercase">
                {copy.servicesTitle}
              </h3>

              <div className="grid gap-3 sm:grid-cols-3">
                {copy.services.map((service, idx) => {
                  const accent = serviceAccents[idx % serviceAccents.length]
                  return (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                      className={cn(
                        'group rounded-[16px] border p-4 transition-all duration-300',
                        'hover:-translate-y-0.5',
                        accent.border,
                        accent.bg,
                        accent.glow
                      )}
                    >
                      <p
                        className={cn(
                          'mb-2 text-[9px] tracking-[0.25em] uppercase',
                          accent.focusColor
                        )}
                      >
                        {service.focus}
                      </p>
                      <p className="text-xs font-semibold text-white/90">{service.title}</p>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* CTA Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex-1 rounded-[24px] border-2 border-[#d5ff0a]/40 bg-gradient-to-br from-[#d5ff0a]/10 via-[#9eff00]/5 to-transparent p-5 sm:p-6"
            >
              <div className="flex h-full flex-col justify-center">
                <p className="mb-2 text-[10px] tracking-[0.3em] text-[#d5ff0a] uppercase">
                  {copy.availabilityLabel}
                </p>
                <h3 className="mb-2 text-lg font-bold text-white">{copy.consultationTitle}</h3>
                <p className="text-xs leading-relaxed text-white/60">
                  {copy.consultationDescription}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </PageLayout>
  )
}
