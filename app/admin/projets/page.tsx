import { getDictionary } from "@/lib/dictionaries"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { WorksFilterableList } from "@/components/admin/works-filterable-list"

export default async function WorksPage() {
  const dictionary = await getDictionary("fr")

  // Fetch all categories
  const categories = await prisma.category.findMany({
    include: {
      translations: true,
    },
    orderBy: { order: "asc" },
  })

  // Fetch all works
  const works = await prisma.work.findMany({
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
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 py-8 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="border-b-2 border-white/20 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[0.3em] text-[#d5ff0a] mb-2">
              {dictionary.admin.projects.title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/projets/new"
              className="bg-[#d5ff0a] text-black font-bold px-6 py-3 hover:bg-[#c5ef00] transition-colors"
            >
              + {dictionary.admin.projects.createNew}
            </Link>
            <Link
              href="/admin"
              className="border-2 border-white/20 px-6 py-3 hover:border-[#d5ff0a] transition-colors"
            >
              ← {dictionary.admin.nav.dashboard}
            </Link>
          </div>
        </div>

        {/* Filterable Works List */}
        <WorksFilterableList
          works={works}
          categories={categories}
          dictionary={dictionary.admin.common}
        />
      </main>
    </div>
  )
}
