"use client";

import { useParams } from "next/navigation";
import { ExpertiseFormAdvanced } from "@/components/admin/expertises/expertise-form-advanced";

export default function NewExpertisePage() {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Nouvelle expertise</h1>
        <p className="text-white/70">Créer une nouvelle page d'expertise</p>
      </div>

      <ExpertiseFormAdvanced locale={locale} />
    </div>
  );
}
