"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExpertiseFormAdvanced } from "@/components/admin/expertises/expertise-form-advanced";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

type ExpertiseTranslation = {
  locale: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: string;
};

type Expertise = {
  id: string;
  slug: string;
  coverImageId: string | null;
  order: number;
  isActive: boolean;
  translations: ExpertiseTranslation[];
};

export default function EditExpertisePage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;

  const [expertise, setExpertise] = useState<Expertise | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const res = await fetchWithAuth(`/api/admin/expertises/${id}`);
        if (res.ok) {
          const data = (await res.json()) as Expertise;
          setExpertise(data);
        } else {
          toast.error("Expertise non trouvée");
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching expertise:", error);
        toast.error("Erreur lors du chargement");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchExpertise();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Modifier l'expertise
          </h1>
        </div>
        <div className="text-center text-white/70">Chargement...</div>
      </div>
    );
  }

  if (!expertise) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Expertise non trouvée
          </h1>
          <p className="text-white/70">Cette expertise n'existe pas.</p>
        </div>
      </div>
    );
  }

  // Transform expertise data to match form structure
  const formData = {
    id: expertise.id,
    slug: expertise.slug,
    coverImageId: expertise.coverImageId,
    order: expertise.order,
    isActive: expertise.isActive,
    translations: {
      fr: {
        title:
          expertise.translations.find((t) => t.locale === "fr")?.title ?? "",
        subtitle:
          expertise.translations.find((t) => t.locale === "fr")?.subtitle ?? "",
        description:
          expertise.translations.find((t) => t.locale === "fr")?.description ??
          "",
        content:
          expertise.translations.find((t) => t.locale === "fr")?.content ?? "",
      },
      en: {
        title:
          expertise.translations.find((t) => t.locale === "en")?.title ?? "",
        subtitle:
          expertise.translations.find((t) => t.locale === "en")?.subtitle ?? "",
        description:
          expertise.translations.find((t) => t.locale === "en")?.description ??
          "",
        content:
          expertise.translations.find((t) => t.locale === "en")?.content ?? "",
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Modifier l'expertise</h1>
        <p className="text-white/70">
          {formData.translations[locale === "fr" ? "fr" : "en"].title}
        </p>
      </div>

      <ExpertiseFormAdvanced locale={locale} initialData={formData} isEdit />
    </div>
  );
}
