'use client'

import { HexColorPicker } from 'react-colorful'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-12 border-2 p-0"
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        className="flex-1"
        placeholder="#000000"
      />
    </div>
  )
}
