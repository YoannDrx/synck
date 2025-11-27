'use client'

import { useEffect, useState } from 'react'

import { SearchIcon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, debounceMs)

    return () => {
      clearTimeout(timer)
    }
  }, [localValue, onChange, debounceMs])

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className="relative">
      <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
        }}
        placeholder={placeholder}
        className="border-white/20 bg-black pr-10 pl-10 text-white placeholder:text-white/30 focus-visible:border-[var(--brand-neon)] focus-visible:ring-[var(--brand-neon)]/20"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
