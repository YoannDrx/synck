import { getDictionary } from "@/lib/dictionaries"
import { prisma } from "@/lib/prisma"
import { WorkForm } from "@/components/admin/work-form"
import Link from "next/link"
import { notFound } from "next/navigation"

type EditWorkPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditWorkPage({ params }: EditWorkPageProps) {
  const { id } = await params
  const dictionary = await getDictionary("fr")

  // Fetch work with all relations
  const work = await prisma.work.findUnique({
    where: { id },
    include: {
      translations: true,
      category: {
        include: {
          translations: true,
        },
      },
      label: {
        include: {
          translations: true,
        },
      },
      coverImage: true,
      contributions: {
        include: {
          composer: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
      images: true,
    },
  })

  if (!work) {
    notFound()
  }

  const frTitle =
    work.translations.find((t) => t.locale === "fr")?.title ?? "Sans titre"

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="border-b-2 border-white/20 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-[0.3em] text-[#d5ff0a] mb-2">
                {dictionary.admin.projects?.editTitle ?? "Modifier le projet"}
              </h1>
              <p className="text-white/60">{frTitle}</p>
            </div>
            <Link
              href="/admin/projets"
              className="border-2 border-white/20 px-6 py-3 hover:border-[#d5ff0a] transition-colors"
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>

        {/* Form */}
        <WorkForm dictionary={dictionary.admin} work={work} mode="edit" />
      </main>
    </div>
  )
}
