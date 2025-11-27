import { CategoryForm } from '@/components/admin/category-form'

export default function NouvelleCategoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Nouvelle catégorie</h1>
        <p className="mt-2 text-white/50">Créer une nouvelle catégorie de projets</p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-[var(--brand-neon)]/20 bg-black p-6">
        <CategoryForm mode="create" />
      </div>
    </div>
  )
}
