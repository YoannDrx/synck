import { getDictionary } from "@/lib/dictionaries"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { DeleteComposerButton } from "@/components/admin/delete-composer-button"

export default async function ComposersPage() {
  const dictionary = await getDictionary("fr")

  const composers = await prisma.composer.findMany({
    include: {
      translations: true,
      image: true,
      _count: {
        select: { contributions: true },
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

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 py-8 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="border-b-2 border-white/20 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[0.3em] text-[#d5ff0a] mb-2">
              {dictionary.admin.composers.title}
            </h1>
            <p className="text-white/60">{composers.length} compositeur(s)</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/compositeurs/new"
              className="bg-[#d5ff0a] text-black font-bold px-6 py-3 hover:bg-[#c5ef00] transition-colors"
            >
              {dictionary.admin.composers.createNew}
            </Link>
            <Link
              href="/admin"
              className="border-2 border-white/20 px-6 py-3 hover:border-[#d5ff0a] transition-colors"
            >
              ← {dictionary.admin.nav.dashboard}
            </Link>
          </div>
        </div>

        {/* Composers Grid */}
        {composers.length === 0 ? (
          <div className="border-2 border-white/20 bg-white/5 p-12 text-center">
            <p className="text-white/60 mb-4">Aucun compositeur pour le moment</p>
            <Link
              href="/admin/compositeurs/new"
              className="inline-block bg-[#d5ff0a] text-black font-bold px-6 py-3 hover:bg-[#c5ef00] transition-colors"
            >
              Créer le premier compositeur
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {composers.map((composer) => {
              const frName =
                composer.translations.find((t) => t.locale === "fr")?.name ??
                "Sans nom"
              const enName = composer.translations.find((t) => t.locale === "en")?.name

              return (
                <div
                  key={composer.id}
                  className="border-2 border-white/20 bg-white/5 hover:border-[#d5ff0a] transition-all group"
                >
                  {/* Image */}
                  {composer.image && (
                    <div className="relative aspect-square w-full bg-white/5">
                      <Image
                        src={composer.image.path}
                        alt={composer.image.alt ?? frName}
                        fill
                        className="object-cover"
                        placeholder={composer.image.blurDataUrl ? "blur" : "empty"}
                        blurDataURL={composer.image.blurDataUrl ?? undefined}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{frName}</h3>
                        {enName && enName !== frName && (
                          <p className="text-sm text-white/60">{enName}</p>
                        )}
                      </div>
                      {!composer.isActive && (
                        <span className="text-xs border border-white/30 px-2 py-1 text-white/50">
                          {dictionary.admin.common.inactive}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-white/50 mb-4">
                      {composer._count.contributions} œuvre(s)
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/compositeurs/${composer.id}`}
                        className="flex-1 text-center border-2 border-white/20 hover:border-[#d5ff0a] px-3 py-2 text-sm transition-colors"
                      >
                        {dictionary.admin.common.edit}
                      </Link>
                      <DeleteComposerButton
                        composerId={composer.id}
                        composerName={frName}
                        hasContributions={composer._count.contributions > 0}
                        dictionary={dictionary.admin.common}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
