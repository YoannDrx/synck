"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Label as LabelType, LabelTranslation } from "@prisma/client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

type LabelWithTranslations = LabelType & {
  translations: LabelTranslation[];
};

type LabelFormProps = {
  label?: LabelWithTranslations;
  mode: "create" | "edit";
};

export function LabelForm({ label, mode }: LabelFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const frTranslation = label?.translations.find((t) => t.locale === "fr");
  const enTranslation = label?.translations.find((t) => t.locale === "en");

  const [formData, setFormData] = useState({
    nameFr: frTranslation?.name ?? "",
    nameEn: enTranslation?.name ?? "",
    website: label?.website ?? "",
    order: label?.order ?? 0,
    isActive: label?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameFr.trim() || !formData.nameEn.trim()) {
      toast.error("Les noms français et anglais sont requis");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        website: formData.website || null,
        order: formData.order,
        isActive: formData.isActive,
        translations: {
          fr: { name: formData.nameFr },
          en: { name: formData.nameEn },
        },
      };

      let res;
      if (mode === "create") {
        res = await fetchWithAuth("/api/admin/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchWithAuth(`/api/admin/labels/${label?.id ?? ""}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = (await res.json()) as { error: string };
        throw new Error(errorData.error ?? "Failed to save label");
      }

      toast.success(
        mode === "create"
          ? "Label créé avec succès"
          : "Label mis à jour avec succès",
      );

      router.push("/fr/admin/labels");
      router.refresh();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving label:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="space-y-8"
    >
      {/* Translations */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Traductions</h3>

        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-medium text-white/70">Français</h4>
          <div className="space-y-2">
            <Label htmlFor="nameFr" className="text-white">
              Nom *
            </Label>
            <Input
              id="nameFr"
              value={formData.nameFr}
              onChange={(e) => {
                setFormData({ ...formData, nameFr: e.target.value });
              }}
              placeholder="Arte France"
              required
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-medium text-white/70">English</h4>
          <div className="space-y-2">
            <Label htmlFor="nameEn" className="text-white">
              Name *
            </Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) => {
                setFormData({ ...formData, nameEn: e.target.value });
              }}
              placeholder="Arte France"
              required
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Paramètres</h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website" className="text-white">
              Site web (optionnel)
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => {
                setFormData({ ...formData, website: e.target.value });
              }}
              placeholder="https://www.arte.tv"
              className="border-white/20 bg-black text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order" className="text-white">
              Ordre d'affichage
            </Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => {
                setFormData({ ...formData, order: Number(e.target.value) });
              }}
              min={0}
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Statut</h3>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="space-y-1">
            <Label htmlFor="isActive" className="text-white">
              Label actif
            </Label>
            <p className="text-sm text-white/50">
              Les labels inactifs ne sont pas visibles sur le site
            </p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => {
              setFormData({ ...formData, isActive: checked });
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 border-t border-white/10 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.back();
          }}
          disabled={isSubmitting}
          className="border-white/20 text-white hover:bg-white/5"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-lime-300 text-black hover:bg-lime-400"
        >
          {isSubmitting
            ? mode === "create"
              ? "Création..."
              : "Mise à jour..."
            : mode === "create"
              ? "Créer le label"
              : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
}
