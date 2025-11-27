'use client'

import Image from 'next/image'
import { useRef } from 'react'
import ReactMarkdown from 'react-markdown'

import { motion, useInView } from 'framer-motion'

import { cn } from '@/lib/utils'

export type ParallaxSectionProps = {
  content: string
  image?: string | null
  imagePosition?: 'left' | 'right' | 'auto'
  index: number
  isLast?: boolean
  accentColor?: 'lime' | 'cyan' | 'purple' | 'orange'
}

/** Accent color configurations */
const accentColors = {
  lime: {
    heading: 'text-[#d5ff0a]',
    bullet: 'text-[#d5ff0a]',
    blockquote: 'bg-[#d5ff0a]',
  },
  cyan: {
    heading: 'text-[#00d9ff]',
    bullet: 'text-[#00d9ff]',
    blockquote: 'bg-[#00d9ff]',
  },
  purple: {
    heading: 'text-[#a855f7]',
    bullet: 'text-[#a855f7]',
    blockquote: 'bg-[#a855f7]',
  },
  orange: {
    heading: 'text-[#ff6b35]',
    bullet: 'text-[#ff6b35]',
    blockquote: 'bg-[#ff6b35]',
  },
}

export function ParallaxSection({
  content,
  image,
  imagePosition = 'auto',
  index,
  isLast = false,
  accentColor = 'lime',
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })

  // Determine actual position
  const position = imagePosition === 'auto' ? (index % 2 === 0 ? 'right' : 'left') : imagePosition

  const isImageLeft = position === 'left'
  const colors = accentColors[accentColor]

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  } as const

  return (
    <motion.div
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={contentVariants}
      className={cn(
        'clearfix relative mb-8 rounded-[24px] border border-white/5 bg-white/[0.02] p-6 sm:p-8',
        isLast ? '' : 'mb-8'
      )}
    >
      {/* Floating Image */}
      {image && (
        <div
          className={cn(
            'mb-6 w-full sm:w-[40%] lg:w-[35%]',
            isImageLeft ? 'sm:float-left sm:mr-8 lg:mr-10' : 'sm:float-right sm:ml-8 lg:ml-10'
          )}
        >
          <div className="relative overflow-hidden rounded-[16px] border-2 border-white/10 shadow-lg">
            <Image
              src={image}
              alt="Illustration"
              width={500}
              height={375}
              className="h-auto w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 35vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/30 to-transparent" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="mb-6 text-2xl font-bold tracking-tight text-white uppercase md:text-3xl">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className={cn('mb-4 text-xl font-bold uppercase', colors.heading)}>{children}</h4>
            ),
            p: ({ children }) => (
              <p className="mb-4 text-base leading-relaxed text-gray-300/90">{children}</p>
            ),
            ul: ({ children }) => <ul className="mb-6 list-none space-y-2 pl-2">{children}</ul>,
            li: ({ children }) => (
              <li className="flex items-start gap-3 text-base text-gray-300/90">
                <span
                  className={cn(
                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60',
                    colors.bullet
                  )}
                />
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="my-6 flex items-start gap-4 rounded-r-lg border-l-2 border-white/10 bg-white/5 p-4">
                <span className={cn('w-1 shrink-0 self-stretch rounded-full', colors.blockquote)} />
                <span className="flex-1 text-gray-400 italic">{children}</span>
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  )
}

/** Simple section without image - just animated content */
export function ContentSection({
  content,
  index,
  isLast = false,
  accentColor = 'lime',
}: {
  content: string
  index: number
  isLast?: boolean
  accentColor?: 'lime' | 'cyan' | 'purple' | 'orange'
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })
  const colors = accentColors[accentColor]

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        'relative mb-8 rounded-[24px] border border-white/5 bg-white/[0.02] p-6 sm:p-8',
        isLast ? '' : 'mb-8'
      )}
    >
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="mb-6 text-2xl font-bold tracking-tight text-white uppercase md:text-3xl">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className={cn('mb-4 text-xl font-bold uppercase', colors.heading)}>{children}</h4>
            ),
            p: ({ children }) => (
              <p className="mb-4 text-base leading-relaxed text-gray-300/90">{children}</p>
            ),
            ul: ({ children }) => <ul className="mb-6 list-none space-y-2 pl-2">{children}</ul>,
            li: ({ children }) => (
              <li className="flex items-start gap-3 text-base text-gray-300/90">
                <span
                  className={cn(
                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60',
                    colors.bullet
                  )}
                />
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="my-6 flex items-start gap-4 rounded-r-lg border-l-2 border-white/10 bg-white/5 p-4">
                <span className={cn('w-1 shrink-0 self-stretch rounded-full', colors.blockquote)} />
                <span className="flex-1 text-gray-400 italic">{children}</span>
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  )
}
