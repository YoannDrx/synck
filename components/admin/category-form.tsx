"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Category, CategoryTranslation } from "@prisma/client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { ColorPicker } from "@/components/admin/color-picker";
import { IconPicker } from "@/components/admin/icon-picker";

type CategoryWithTranslations = Category & {
  translations: CategoryTranslation[];
};

type CategoryFormProps = {
  category?: CategoryWithTranslations;
  mode: "create" | "edit";
};

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get translations by locale
  const frTranslation = category?.translations.find((t) => t.locale === "fr");
  const enTranslation = category?.translations.find((t) => t.locale === "en");

  // Form state
  const [formData, setFormData] = useState({
    nameFr: frTranslation?.name ?? "",
    nameEn: enTranslation?.name ?? "",
    color: category?.color ?? "#d5ff0a",
    icon: category?.icon ?? "",
    order: category?.order ?? 0,
    isActive: category?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nameFr.trim() || !formData.nameEn.trim()) {
      toast.error("Les noms français et anglais sont requis");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.exec(formData.color)) {
      toast.error("La couleur doit être au format hexadécimal (#RRGGBB)");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        color: formData.color,
        icon: formData.icon || null,
        order: formData.order,
        isActive: formData.isActive,
        translations: {
          fr: {
            name: formData.nameFr,
          },
          en: {
            name: formData.nameEn,
          },
        },
      };

      let res;
      if (mode === "create") {
        res = await fetchWithAuth("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchWithAuth(
          `/api/admin/categories/${category?.id ?? ""}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
      }

      if (!res.ok) {
        const errorData = (await res.json()) as { error: string };
        throw new Error(errorData.error ?? "Failed to save category");
      }

      toast.success(
        mode === "create"
          ? "Catégorie créée avec succès"
          : "Catégorie mise à jour avec succès",
      );

      router.push("/fr/admin/categories");
      router.refresh();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving category:", error);
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
      {/* Translations Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Traductions</h3>

        {/* French */}
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
              placeholder="Musique de film"
              required
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>

        {/* English */}
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
              placeholder="Film Music"
              required
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Affichage</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className="text-white">
              Couleur *
            </Label>
            <ColorPicker
              value={formData.color}
              onChange={(color) => {
                setFormData({ ...formData, color });
              }}
            />
            <p className="text-xs text-white/50">
              Format hexadécimal (#RRGGBB)
            </p>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon" className="text-white">
              Icône (optionnel)
            </Label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => {
                setFormData({ ...formData, icon });
              }}
            />
            <p className="text-xs text-white/50">
              Sélectionnez une icône Lucide
            </p>
          </div>
        </div>

        {/* Order */}
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
          <p className="text-xs text-white/50">
            Plus le nombre est petit, plus la catégorie apparaît en premier
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Statut</h3>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="space-y-1">
            <Label htmlFor="isActive" className="text-white">
              Catégorie active
            </Label>
            <p className="text-sm text-white/50">
              Les catégories inactives ne sont pas visibles sur le site
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
              ? "Créer la catégorie"
              : "Mettre à jour"}
        </Button>
      </div>
    </form>
  );
}
