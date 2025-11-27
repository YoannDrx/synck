'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

// Hook to safely check if we're on the client
const emptySubscribe = () => () => undefined
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  if (!isMounted) {
    return <div className={cn('h-10 w-10 rounded-md bg-neutral-800/50', className)} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark')
      }}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-md',
        'bg-neutral-800/50 hover:bg-neutral-700/50',
        'border border-neutral-700/50 hover:border-neutral-600/50',
        'transition-colors duration-200',
        'focus-visible:ring-2 focus-visible:ring-[var(--brand-neon)]/50 focus-visible:outline-none',
        className
      )}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {/* Sun icon */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-5 w-5 text-[var(--brand-neon)]"
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
          rotate: isDark ? -90 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <circle cx={12} cy={12} r={4} />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </motion.svg>

      {/* Moon icon */}
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-5 w-5 text-[var(--brand-neon)]"
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
          rotate: isDark ? 0 : 90,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </motion.svg>
    </button>
  )
}

/**
 * Compact version for mobile or tight spaces
 */
export function ThemeToggleCompact({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  if (!isMounted) {
    return <div className={cn('h-8 w-8 rounded-full bg-neutral-800/50', className)} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark')
      }}
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-full',
        'bg-neutral-800/50 hover:bg-neutral-700/50',
        'transition-colors duration-200',
        className
      )}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 text-[var(--brand-neon)]"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 text-[var(--neon-600)]"
          >
            <circle cx={12} cy={12} r={4} />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </motion.div>
    </button>
  )
}
