import { getDictionary } from "@/lib/dictionaries"
import { ComposerForm } from "@/components/admin/composer-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function EditComposerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dictionary = await getDictionary("fr")

  const composer = await prisma.composer.findUnique({
    where: { id },
    include: {
      translations: true,
      image: true,
    },
  })

  if (!composer) {
    notFound()
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[900px] mx-auto px-4 py-8 sm:px-8">
        {/* Header */}
        <div className="border-b-2 border-white/20 pb-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-[0.3em] text-[#d5ff0a] mb-2">
                {dictionary.admin.composers.editTitle}
              </h1>
              <p className="text-white/60">
                {composer.translations.find((t) => t.locale === "fr")?.name ?? "Sans nom"}
              </p>
            </div>
            <Link
              href="/admin/compositeurs"
              className="border-2 border-white/20 px-4 py-2 hover:border-[#d5ff0a] transition-colors text-sm"
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>

        {/* Form */}
        <ComposerForm dictionary={dictionary.admin} composer={composer} mode="edit" />
      </main>
    </div>
  )
}
