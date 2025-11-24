import { prisma } from "@/lib/prisma";
import { CVEditor } from "@/components/admin/cv/cv-editor";

export default async function CVAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const cv = await prisma.cV.findFirst({
    include: {
      photoAsset: true,
      sections: {
        orderBy: { order: "asc" },
        include: {
          translations: true,
          items: {
            orderBy: { order: "asc" },
            include: {
              translations: true,
            },
          },
        },
      },
      skills: {
        orderBy: { order: "asc" },
        include: {
          translations: true,
        },
      },
      socialLinks: {
        orderBy: { order: "asc" },
      },
    },
  });

  const transformedCV = cv
    ? {
        id: cv.id,
        photo: cv.photoAsset?.path ?? null,
        phone: cv.phone,
        email: cv.email,
        website: cv.website,
        location: cv.location,
        linkedInUrl: cv.linkedInUrl,
        headlineFr: cv.headlineFr,
        headlineEn: cv.headlineEn,
        bioFr: cv.bioFr,
        bioEn: cv.bioEn,
        layout: cv.layout,
        accentColor: cv.accentColor,
        showPhoto: cv.showPhoto,
        sections: cv.sections.map((section) => ({
          id: section.id,
          type: section.type,
          order: section.order,
          isActive: section.isActive,
          translations: section.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
          })),
          items: section.items.map((item) => ({
            id: item.id,
            startDate: item.startDate?.toISOString() ?? null,
            endDate: item.endDate?.toISOString() ?? null,
            isCurrent: item.isCurrent,
            order: item.order,
            isActive: item.isActive,
            translations: item.translations.map((t) => ({
              locale: t.locale,
              title: t.title,
              subtitle: t.subtitle,
              location: t.location,
              description: t.description,
            })),
          })),
        })),
        skills: cv.skills.map((skill) => ({
          id: skill.id,
          category: skill.category,
          level: skill.level,
          showAsBar: skill.showAsBar,
          order: skill.order,
          isActive: skill.isActive,
          translations: skill.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
          })),
        })),
        socialLinks: cv.socialLinks.map((link) => ({
          id: link.id,
          platform: link.platform,
          url: link.url,
          label: link.label,
          order: link.order,
        })),
      }
    : null;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Éditeur de CV</h1>
        <p className="text-white/50">
          Gérez le contenu du CV et prévisualisez le PDF en temps réel.
        </p>
      </div>
      <CVEditor initialData={transformedCV} locale={locale} />
    </div>
  );
}
