'use client'

import { useState } from 'react'

import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { detectFormat, parseFile } from '@/lib/import'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type ImportDialogProps = {
  entity: 'projects' | 'artists'
  onSuccess?: () => void
}

export function ImportDialog({ entity, onSuccess }: ImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  const handleImport = async () => {
    if (!file) return

    const format = detectFormat(file.name)
    if (!format) {
      toast.error('Format de fichier non supporté')
      return
    }

    setIsImporting(true)

    try {
      const data = await parseFile(file, format)

      const response = await fetch(`/api/admin/import/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, updateExisting }),
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Import failed')

      const result = (await response.json()) as {
        created: number
        updated: number
        errors: { row: number; error: string }[]
      }

      if (result.errors.length > 0) {
        toast.error(
          `${String(result.errors.length)} erreurs. ${String(result.created)} créés, ${String(result.updated)} mis à jour.`
        )
      } else {
        toast.success(
          `Import réussi ! ${String(result.created)} créés, ${String(result.updated)} mis à jour.`
        )
        setOpen(false)
        setFile(null)
        onSuccess?.()
      }
    } catch {
      toast.error("Erreur lors de l'import")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importer
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[var(--brand-neon)]/20 bg-black">
        <DialogHeader>
          <DialogTitle className="text-white">Importer des données</DialogTitle>
          <DialogDescription className="text-white/70">
            Importez des {entity === 'projects' ? 'projets' : 'artistes'} depuis un fichier CSV ou
            JSON
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-white">Fichier (CSV ou JSON)</Label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="mt-2 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white file:mr-4 file:rounded file:border-0 file:bg-[var(--brand-neon)] file:px-3 file:py-1 file:text-xs file:font-medium file:text-black hover:file:bg-[var(--neon-400)]"
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
                <span>{file.name}</span>
                <button
                  onClick={() => {
                    setFile(null)
                  }}
                  className="text-white/50 hover:text-white"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="update" checked={updateExisting} onCheckedChange={setUpdateExisting} />
            <Label htmlFor="update" className="text-white">
              Mettre à jour si existe déjà
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false)
              }}
              className="border-white/20 text-white hover:bg-white/5"
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                void handleImport()
              }}
              disabled={!file || isImporting}
              className="bg-[var(--brand-neon)] text-black hover:bg-[var(--neon-400)]"
            >
              {isImporting ? 'Import...' : 'Importer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
