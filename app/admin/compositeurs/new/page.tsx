import { getDictionary } from "@/lib/dictionaries";
import { ComposerForm } from "@/components/admin/composer-form";
import Link from "next/link";

// Force dynamic rendering (no SSG) for admin pages
export const dynamic = "force-dynamic";

export default async function NewComposerPage() {
  const dictionary = await getDictionary("fr");

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
            <h1 className="text-3xl font-bold tracking-[0.3em] text-[#d5ff0a]">
              {dictionary.admin.composers.createNew}
            </h1>
            <Link
              href="/admin/compositeurs"
              className="border-2 border-white/20 px-4 py-2 hover:border-[#d5ff0a] transition-colors text-sm"
            >
              ← Retour à la liste
            </Link>
          </div>
        </div>

        {/* Form */}
        <ComposerForm dictionary={dictionary.admin} mode="create" />
      </main>
    </div>
  );
}
