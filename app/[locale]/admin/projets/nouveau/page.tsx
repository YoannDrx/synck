import { getDictionary } from "@/lib/dictionaries";
import { WorkForm } from "@/components/admin/work-form";
import type { Locale } from "@/lib/i18n-config";
import { i18n } from "@/lib/i18n-config";

export default async function NouveauProjetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (
    i18n.locales.includes(rawLocale as Locale) ? rawLocale : i18n.defaultLocale
  ) as Locale;

  const dict = await getDictionary(locale);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {dict.admin.projects.createNew}
        </h1>
        <p className="mt-2 text-white/50">Créer un nouveau projet musical</p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-lime-300/20 bg-black p-6">
        <WorkForm dictionary={dict.admin} mode="create" />
      </div>
    </div>
  );
}
