'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import '@uiw/react-markdown-preview/markdown.css'
import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  height?: number
}

export function MarkdownEditor({ value, onChange, height = 400 }: MarkdownEditorProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (val?: string) => {
    const newValue = val ?? ''
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <div data-color-mode="dark">
      <MDEditor value={localValue} onChange={handleChange} height={height} />
    </div>
  )
}
