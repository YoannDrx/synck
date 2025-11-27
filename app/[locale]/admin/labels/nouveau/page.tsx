import { LabelForm } from '@/components/admin/label-form'

export default function NouveauLabelPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Nouveau label</h1>
        <p className="mt-2 text-white/50">Créer un nouveau label de production</p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-[var(--brand-neon)]/20 bg-black p-6">
        <LabelForm mode="create" />
      </div>
    </div>
  )
}
