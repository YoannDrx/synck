'use client'

type ProgressBarProps = {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 z-30 h-1 w-full bg-white/10">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-[var(--brand-neon)] via-fuchsia-400 to-sky-400 transition-[width] duration-300"
        style={{ width: `${String(progress)}%` }}
      />
    </div>
  )
}
