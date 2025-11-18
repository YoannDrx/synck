'use client'

import { useRef } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { motion, useInView } from 'framer-motion'

export type AlternatingSectionProps = {
  content: string
  image?: string | null
  imagePosition?: 'left' | 'right' | 'auto'
  index: number
  isLast?: boolean
}

export function AlternatingSection({
  content,
  image,
  imagePosition = 'auto',
  index,
  isLast = false,
}: AlternatingSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Determine actual position
  const position = imagePosition === 'auto'
    ? index % 2 === 0 ? 'right' : 'left'
    : imagePosition

  const isImageLeft = position === 'left'

  // Animation variants
  const imageVariants = {
    hidden: {
      opacity: 0,
      x: isImageLeft ? -60 : 60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
  } as const

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
      },
    },
  } as const

  // Render with float layout (text wraps around image)
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={isLast ? '' : 'mb-16 md:mb-20 lg:mb-24'}
    >
      <div>
        {/* Image with float */}
        {image && (
          <motion.div
            variants={imageVariants}
            className={`
              ${isImageLeft ? 'float-left mr-6 md:mr-10 lg:mr-12' : 'float-right ml-6 md:ml-10 lg:ml-12'}
              mb-6
              w-full sm:w-[300px] md:w-[400px] lg:w-[500px]
            `}
          >
            <div className="relative w-full border-4 border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.65)] overflow-hidden">
              <Image
                src={image}
                alt="Illustration"
                width={500}
                height={375}
                className="w-full h-auto object-contain"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 300px, (max-width: 1024px) 400px, 500px"
              />
            </div>
          </motion.div>
        )}

        {/* Content that flows around the image */}
        <motion.div
          variants={contentVariants}
          className="prose prose-invert max-w-none"
        >
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-white uppercase tracking-tight">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xl md:text-2xl font-bold mb-4 text-lime-300 uppercase">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-6">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="space-y-3 mb-6 list-none">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-base md:text-lg text-gray-300 pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-lime-300 before:font-bold">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="text-white font-bold">
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-lime-300 pl-6 italic text-gray-400 my-6">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </motion.div>

        {/* Clear float to ensure next section starts below */}
        <div className="clear-both" />
      </div>
    </motion.div>
  )
}
