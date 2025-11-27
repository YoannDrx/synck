'use client'

import { useRouter } from 'next/navigation'

import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export function DuplicateButton({ workId, locale }: { workId: string; locale: string }) {
  const router = useRouter()

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/admin/projects/${workId}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Failed')

      const { id } = (await res.json()) as { id: string }
      toast.success('Projet dupliqué !')
      router.push(`/${locale}/admin/projets/${id}`)
    } catch {
      toast.error('Erreur lors de la duplication')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        void handleDuplicate()
      }}
      className="gap-2"
    >
      <Copy className="h-4 w-4" />
      Dupliquer
    </Button>
  )
}
