'use client'

import { type PointerEvent, useRef, useState } from 'react'

import { motion, useInView, useScroll, useTransform } from 'framer-motion'

import { Button } from '@/components/ui/button'

import { InfoCard } from '@/components/cards/info-card'

import type { HomeDictionary } from '@/types/dictionary'

type ContactSectionProps = {
  copy: HomeDictionary['contactSection']
}

function AnimatedInfoCard({
  card,
  index,
}: {
  card: { label: string; content: string; href?: string }
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.4 + index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-[var(--radius-xl)] transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(213,255,10,0.15)]"
    >
      <InfoCard label={card.label} content={card.content} href={card.href} />
    </motion.div>
  )
}

export function ContactSection({ copy }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const handleGlow = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setGlow({ x, y })
  }

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 1, 1, 0.5])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [80, 0, 0, -20])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0.92, 1, 1, 0.98])

  // Parallax for decorative elements
  const orbY1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const orbY2 = useTransform(scrollYProgress, [0, 1], [0, -60])

  return (
    <motion.section
      ref={sectionRef}
      id="contact"
      style={{ opacity, y, scale }}
      className="relative overflow-hidden rounded-[32px] border-4 border-white/15 bg-gradient-to-br from-[#151515] via-[#0b0b0f] to-[#1a021d] p-6 will-change-transform sm:p-10"
      onPointerMove={handleGlow}
    >
      {/* Mouse-following glow effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${String(glow.x)}% ${String(glow.y)}%, rgba(213,255,10,0.25), transparent 50%), radial-gradient(circle at 90% 80%, rgba(217,70,239,0.2), transparent 50%)`,
        }}
      />

      {/* Animated decorative orbs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: orbY1 }}
          className="absolute top-6 left-10 h-52 w-52 rounded-full bg-[var(--brand-neon)]/30 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          style={{ y: orbY2 }}
          className="absolute right-20 bottom-10 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-[120px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 grid gap-10 md:grid-cols-[2fr,1fr]">
        {/* Left content */}
        <div className="space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs tracking-[0.5em] text-white/55 uppercase"
          >
            {copy.eyebrow}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-black"
          >
            {copy.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-sm text-white/75"
          >
            {copy.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 text-xs font-semibold tracking-[0.4em] uppercase"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="rounded-full">
                <a href={copy.primaryCta.href}>{copy.primaryCta.label}</a>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full hover:border-fuchsia-400 hover:text-fuchsia-200"
              >
                <a href={copy.secondaryCta.href}>{copy.secondaryCta.label}</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right - Info cards */}
        <div className="grid gap-4 text-sm">
          {copy.infoCards.map((card, index) => (
            <AnimatedInfoCard key={card.label} card={card} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
