'use client'

import { useRef } from 'react'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

type InfiniteMarqueeProps = {
  items: string[]
  className?: string
}

export function InfiniteMarquee({ items, className }: InfiniteMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll()

  // Smooth spring for parallax effect
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
  })

  // Parallax transforms - softer travel for a calmer feeling
  const line1X = useTransform(smoothProgress, [0, 1], [0, -200])
  const line2X = useTransform(smoothProgress, [0, 1], [0, 120])

  // Subtle 3D perspective rotation on scroll
  const rotateX = useTransform(smoothProgress, [0, 0.5, 1], [1, 0, -1])

  const palette = [
    {
      border: 'border-lime-300/40',
      bg: 'from-[#d5ff0a]/15 via-[#c7ff7a]/10 to-[#22d3ee]/10',
      dot: 'bg-[#d5ff0a] shadow-[0_0_12px_rgba(213,255,10,0.8)]',
    },
    {
      border: 'border-cyan-300/40',
      bg: 'from-[#22d3ee]/15 via-[#67e8f9]/10 to-[#a855f7]/10',
      dot: 'bg-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.8)]',
    },
    {
      border: 'border-pink-300/40',
      bg: 'from-[#f472b6]/15 via-[#fb7185]/10 to-[#f59e0b]/10',
      dot: 'bg-[#f472b6] shadow-[0_0_12px_rgba(244,114,182,0.8)]',
    },
  ]

  // Repeat items many times for seamless infinite loop
  const repeatedItems = Array.from({ length: 6 }, () => items).flat()

  // Reverse for second line
  const reversedItems = [...repeatedItems].reverse()

  return (
    <div
      ref={containerRef}
      className={`marquee-container relative overflow-hidden py-2 sm:py-3 lg:py-4 ${className ?? ''}`}
      style={{
        perspective: '1000px',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
      }}
    >
      {/* Gradient masks for fade effect on edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050505] to-transparent sm:w-40 lg:w-64" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050505] to-transparent sm:w-40 lg:w-64" />

      {/* Thin guide line to anchor the band without halo */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <motion.div className="space-y-3 sm:space-y-4 lg:space-y-5" style={{ rotateX }}>
        {/* Line 1 - scrolls left */}
        <motion.div className="flex w-max items-center" style={{ x: line1X }}>
          <div className="animate-marquee-left flex items-center">
            {repeatedItems.map((item, index) => {
              const accent = palette[index % palette.length]
              return (
                <span key={`line1-${String(index)}`} className="mr-3 flex shrink-0 items-center">
                  <span
                    className={`group relative flex items-center gap-3 rounded-full border bg-gradient-to-r px-4 py-2 text-xs tracking-[0.08em] text-white/80 uppercase backdrop-blur-sm transition-all duration-300 hover:translate-y-[-1px] hover:text-white sm:px-5 sm:py-2.5 sm:text-sm lg:px-6 lg:py-3 lg:text-base ${accent.border} ${accent.bg}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${accent.dot} transition-transform duration-300 group-hover:scale-110`}
                    />
                    <span className="whitespace-nowrap">{item}</span>
                    <span className="text-white/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white">
                      ↺
                    </span>
                  </span>
                </span>
              )
            })}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="animate-marquee-left flex items-center" aria-hidden>
            {repeatedItems.map((item, index) => {
              const accent = palette[index % palette.length]
              return (
                <span
                  key={`line1-dup-${String(index)}`}
                  className="mr-3 flex shrink-0 items-center"
                >
                  <span
                    className={`group relative flex items-center gap-3 rounded-full border bg-gradient-to-r px-4 py-2 text-xs tracking-[0.08em] text-white/80 uppercase backdrop-blur-sm transition-all duration-300 hover:translate-y-[-1px] hover:text-white sm:px-5 sm:py-2.5 sm:text-sm lg:px-6 lg:py-3 lg:text-base ${accent.border} ${accent.bg}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${accent.dot} transition-transform duration-300 group-hover:scale-110`}
                    />
                    <span className="whitespace-nowrap">{item}</span>
                    <span className="text-white/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-white">
                      ↺
                    </span>
                  </span>
                </span>
              )
            })}
          </div>
        </motion.div>

        {/* Line 2 - scrolls right (opposite direction) */}
        <motion.div className="flex w-max items-center" style={{ x: line2X }}>
          <div className="animate-marquee-right flex items-center">
            {reversedItems.map((item, index) => {
              const accent = palette[(index + 1) % palette.length]
              return (
                <span key={`line2-${String(index)}`} className="mr-3 flex shrink-0 items-center">
                  <span
                    className={`group relative flex items-center gap-3 rounded-full border bg-gradient-to-r px-4 py-2 text-xs tracking-[0.08em] text-white/70 uppercase backdrop-blur-sm transition-all duration-300 hover:translate-y-[-1px] hover:text-white sm:px-5 sm:py-2.5 sm:text-sm lg:px-6 lg:py-3 lg:text-base ${accent.border} ${accent.bg}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${accent.dot} transition-transform duration-300 group-hover:scale-110`}
                    />
                    <span className="whitespace-nowrap">{item}</span>
                    <span className="text-white/30 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-white">
                      ↻
                    </span>
                  </span>
                </span>
              )
            })}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="animate-marquee-right flex items-center" aria-hidden>
            {reversedItems.map((item, index) => {
              const accent = palette[(index + 1) % palette.length]
              return (
                <span
                  key={`line2-dup-${String(index)}`}
                  className="mr-3 flex shrink-0 items-center"
                >
                  <span
                    className={`group relative flex items-center gap-3 rounded-full border bg-gradient-to-r px-4 py-2 text-xs tracking-[0.08em] text-white/70 uppercase backdrop-blur-sm transition-all duration-300 hover:translate-y-[-1px] hover:text-white sm:px-5 sm:py-2.5 sm:text-sm lg:px-6 lg:py-3 lg:text-base ${accent.border} ${accent.bg}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${accent.dot} transition-transform duration-300 group-hover:scale-110`}
                    />
                    <span className="whitespace-nowrap">{item}</span>
                    <span className="text-white/30 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-white">
                      ↻
                    </span>
                  </span>
                </span>
              )
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
