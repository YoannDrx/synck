'use client'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

type ProjectCardProps = {
  name: string
  subtitle: string
  description: string
  cycle: string
  accent?: 'neon' | 'teal' | 'emerald'
  tags: string[]
  className?: string
}

const accentGradients = {
  neon: 'from-[var(--brand-neon)]/10 via-[var(--brand-green)]/5 to-transparent',
  teal: 'from-[var(--brand-teal)]/10 via-[var(--brand-ocean)]/5 to-transparent',
  emerald: 'from-[var(--brand-emerald)]/10 via-[var(--brand-teal)]/5 to-transparent',
}

export function ProjectCard({
  name,
  subtitle,
  description,
  cycle,
  accent = 'neon',
  tags,
  className,
}: ProjectCardProps) {
  return (
    <Card
      variant="default"
      hover="lift"
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-2xl)] border-2 p-6',
        'transition-all duration-[var(--duration-normal)]',
        'hover:border-[var(--brand-neon)]/50 hover:shadow-[var(--shadow-glow-neon-sm)]',
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-[var(--duration-normal)] group-hover:opacity-100',
          'bg-gradient-to-br',
          accentGradients[accent]
        )}
      />
      <div className="relative z-10 flex h-full flex-col gap-6">
        <div className="flex items-center justify-between text-[0.65rem] font-semibold tracking-[0.35em] text-[var(--color-text-muted)] uppercase">
          <span>{subtitle}</span>
          <span>{cycle}</span>
        </div>
        <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{name}</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              size="sm"
              className="text-[0.6rem] tracking-[0.3em] uppercase"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
