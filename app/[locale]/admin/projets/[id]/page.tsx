import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { WorkForm } from "@/components/admin/work-form";
import type { Locale } from "@/lib/i18n-config";
import { i18n } from "@/lib/i18n-config";
import { prisma } from "@/lib/prisma";
import { DuplicateButton } from "@/components/admin/duplicate-button";

async function getWork(id: string) {
  const work = await prisma.work.findUnique({
    where: { id },
    include: {
      translations: true,
      coverImage: true,
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
  });

  return work;
}

export default async function EditProjetPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = (
    i18n.locales.includes(rawLocale as Locale) ? rawLocale : i18n.defaultLocale
  ) as Locale;

  const dict = await getDictionary(locale);
  const work = await getWork(id);

  if (!work) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {dict.admin.projects.editTitle}
          </h1>
          <p className="mt-2 text-white/50">
            Modifier le projet{" "}
            {work.translations.find((t) => t.locale === locale)?.title ??
              work.translations[0]?.title}
          </p>
        </div>
        <DuplicateButton workId={id} locale={locale} />
      </div>

      {/* Form */}
      <div className="rounded-lg border border-lime-300/20 bg-black p-6">
        <WorkForm
          dictionary={dict.admin}
          work={work}
          mode="edit"
          locale={locale}
        />
      </div>
    </div>
  );
}
