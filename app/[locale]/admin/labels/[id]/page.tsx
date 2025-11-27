import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'

import { LabelForm } from '@/components/admin/label-form'

async function getLabel(id: string) {
  const label = await prisma.label.findUnique({
    where: { id },
    include: {
      translations: true,
    },
  })

  return label
}

export default async function EditLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const label = await getLabel(id)

  if (!label) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Modifier le label</h1>
        <p className="mt-2 text-white/50">
          {label.translations.find((t) => t.locale === 'fr')?.name ?? label.translations[0]?.name}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-[var(--brand-neon)]/20 bg-black p-6">
        <LabelForm label={label} mode="edit" />
      </div>
    </div>
  )
}
