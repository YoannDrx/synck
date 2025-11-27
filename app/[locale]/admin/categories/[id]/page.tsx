import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'

import { CategoryForm } from '@/components/admin/category-form'

async function getCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      translations: true,
    },
  })

  return category
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await getCategory(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Modifier la catégorie</h1>
        <p className="mt-2 text-white/50">
          {category.translations.find((t) => t.locale === 'fr')?.name ??
            category.translations[0]?.name}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-[var(--brand-neon)]/20 bg-black p-6">
        <CategoryForm category={category} mode="edit" />
      </div>
    </div>
  )
}
