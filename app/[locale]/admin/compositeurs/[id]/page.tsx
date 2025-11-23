import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { ComposerForm } from "@/components/admin/composer-form";
import type { Locale } from "@/lib/i18n-config";
import { i18n } from "@/lib/i18n-config";
import { prisma } from "@/lib/prisma";

async function getComposer(id: string) {
  const composer = await prisma.composer.findUnique({
    where: { id },
    include: {
      translations: true,
      image: true,
      links: true,
    },
  });

  return composer;
}

export default async function EditCompositeurPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = (
    i18n.locales.includes(rawLocale as Locale) ? rawLocale : i18n.defaultLocale
  ) as Locale;

  const dict = await getDictionary(locale);
  const composer = await getComposer(id);

  if (!composer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {dict.admin.composers.editTitle}
        </h1>
        <p className="mt-2 text-white/50">
          Modifier le compositeur{" "}
          {composer.translations.find((t) => t.locale === locale)?.name ??
            composer.translations[0]?.name}
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-lime-300/20 bg-black p-6">
        <ComposerForm
          dictionary={dict.admin}
          composer={composer}
          mode="edit"
          locale={locale}
        />
      </div>
    </div>
  );
}
