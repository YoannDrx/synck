import { getDictionary } from "@/lib/dictionaries";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering (no SSG) for admin pages
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const dictionary = await getDictionary("fr"); // Default to French for admin

  // Get some stats
  const stats = await Promise.all([
    prisma.work.count({ where: { isActive: true } }),
    prisma.composer.count({ where: { isActive: true } }),
    prisma.expertise.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
  ]);

  const [totalWorks, totalComposers, totalExpertises, activeCategories] = stats;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(213,255,10,0.15),transparent_55%)]" />
        <div className="absolute inset-0 noise-layer" />
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 py-8 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="border-b-2 border-white/20 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-[0.3em] text-[#d5ff0a] mb-2">
                {dictionary.admin.dashboard.title}
              </h1>
              <p className="text-white/60">
                {dictionary.admin.dashboard.welcome}
              </p>
            </div>
            <form action="/api/auth/sign-out" method="POST">
              <button
                type="submit"
                className="border-2 border-white/20 hover:border-[#d5ff0a] px-4 py-2 transition-colors"
              >
                {dictionary.admin.nav.logout}
              </button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard
            label={dictionary.admin.dashboard.stats.totalWorks}
            value={totalWorks}
          />
          <StatCard
            label={dictionary.admin.dashboard.stats.totalComposers}
            value={totalComposers}
          />
          <StatCard
            label={dictionary.admin.dashboard.stats.totalExpertises}
            value={totalExpertises}
          />
          <StatCard
            label={dictionary.admin.dashboard.stats.activeCategories}
            value={activeCategories}
          />
        </div>

        {/* Navigation */}
        <div className="border-2 border-white/20 bg-white/5 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 tracking-wider">Gestion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionButton
              label="📚 Gestion des projets"
              href="/admin/projets"
            />
            <QuickActionButton
              label="🎵 Gestion des compositeurs"
              href="/admin/compositeurs"
            />
            <QuickActionButton
              label="💼 Gestion des expertises"
              href="/admin/expertises"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-2 border-white/20 bg-white/5 p-6">
          <h2 className="text-xl font-bold mb-4 tracking-wider">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              label="+ Ajouter un projet"
              href="/admin/projets/new"
            />
            <QuickActionButton
              label="+ Ajouter un compositeur"
              href="/admin/compositeurs/new"
            />
            <QuickActionButton
              label="+ Ajouter une expertise"
              href="/admin/expertises/new"
            />
            <QuickActionButton
              label="📨 Inviter un admin"
              href="/admin/invitations"
            />
          </div>
        </div>

        {/* Development notice */}
        <div className="mt-8 border-2 border-[#d5ff0a]/50 bg-[#d5ff0a]/10 p-4 text-sm">
          <p className="text-[#d5ff0a]">
            <strong>🚧 En développement</strong> - Les fonctionnalités CRUD
            seront implémentées dans les prochaines étapes.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-white/20 bg-white/5 p-6 backdrop-blur-sm">
      <div className="text-4xl font-bold text-[#d5ff0a] mb-2">{value}</div>
      <div className="text-sm text-white/60 tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
}

function QuickActionButton({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="border-2 border-white/20 hover:border-[#d5ff0a] hover:bg-[#d5ff0a]/10 p-4 text-center transition-all block"
    >
      <span className="text-sm tracking-wide">{label}</span>
    </a>
  );
}
