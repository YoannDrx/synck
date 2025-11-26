"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import type { AdminDictionary } from "@/types/dictionary";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import type { Artist, ArtistTranslation, Asset } from "@prisma/client";

const assetPathToUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("public/")) return `/${path.substring("public/".length)}`;
  if (path.startsWith("/")) return path;
  return `/${path}`;
};

type ArtistWithRelations = {
  translations: ArtistTranslation[];
  image: Asset | null;
  links?: {
    id: string;
    platform: string;
    url: string;
    label: string | null;
    order: number;
  }[];
} & Artist;

type ArtistFormProps = {
  dictionary: AdminDictionary;
  artist?: ArtistWithRelations;
  mode: "create" | "edit";
  locale: string;
};

type LinkInput = {
  id?: string;
  platform: string;
  url: string;
  label?: string | null;
  order: number;
};

type FormState = {
  slug: string;
  imageId: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  translations: {
    fr: { name: string; bio: string };
    en: { name: string; bio: string };
  };
  links: LinkInput[];
};

export function ArtistForm({
  dictionary,
  artist,
  mode,
  locale,
}: ArtistFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get translations by locale
  const frTranslation = artist?.translations.find((t) => t.locale === "fr");
  const enTranslation = artist?.translations.find((t) => t.locale === "en");

  const initialLinks: LinkInput[] =
    artist?.links?.map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      label: link.label,
      order: link.order ?? 0,
    })) ?? [];

  // Form state
  const [formData, setFormData] = useState<FormState>({
    slug: artist?.slug ?? "",
    imageId: artist?.imageId ?? null,
    imageUrl: assetPathToUrl(artist?.image?.path),
    order: artist?.order ?? 0,
    isActive: artist?.isActive ?? true,
    translations: {
      fr: {
        name: frTranslation?.name ?? "",
        bio: frTranslation?.bio ?? "",
      },
      en: {
        name: enTranslation?.name ?? "",
        bio: enTranslation?.bio ?? "",
      },
    },
    links: initialLinks,
  });

  const handleImageUploaded = async (image: {
    url: string;
    width: number;
    height: number;
    aspectRatio: number;
    blurDataUrl: string;
  }) => {
    // First, create Asset in database
    const response = await fetchWithAuth("/api/admin/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: image.url,
        width: image.width,
        height: image.height,
        aspectRatio: image.aspectRatio,
        blurDataUrl: image.blurDataUrl,
      }),
    });

    if (response.ok) {
      const asset = (await response.json()) as { id: string; path: string };
      setFormData((prev) => ({
        ...prev,
        imageId: asset.id,
        imageUrl: asset.path,
      }));
    }
  };

  const handleImageRemoved = () => {
    setFormData((prev) => ({
      ...prev,
      imageId: null,
      imageUrl: null,
    }));
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        { platform: "website", url: "", label: "", order: prev.links.length },
      ],
    }));
  };

  const updateLink = (
    index: number,
    field: keyof LinkInput,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/artists"
          : `/api/admin/artists/${artist?.id ?? ""}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: formData.slug,
          imageId: formData.imageId,
          externalUrl: null,
          order: formData.order,
          isActive: formData.isActive,
          translations: formData.translations,
          links: formData.links.filter((l) => l.url && l.platform),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'enregistrement");
      }

      // Success - redirect to list
      router.push(`/${locale}/admin/artistes`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement",
      );
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
      {error && (
        <div className="border-2 border-red-500/50 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Slug * <span className="text-white/50">(URL unique)</span>
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            }));
          }}
          required
          placeholder="maurice-ravel"
          className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
        />
      </div>

      {/* French Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇫🇷 Français</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.artists.fields.nameLabel} *
            </label>
            <input
              type="text"
              value={formData.translations.fr.name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, name: e.target.value },
                  },
                }));
              }}
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.artists.fields.bioLabel}
            </label>
            <textarea
              value={formData.translations.fr.bio}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, bio: e.target.value },
                  },
                }));
              }}
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* English Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇬🇧 English</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.artists.fields.nameLabel} *
            </label>
            <input
              type="text"
              value={formData.translations.en.name}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, name: e.target.value },
                  },
                }));
              }}
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {dictionary.artists.fields.bioLabel}
            </label>
            <textarea
              value={formData.translations.en.bio}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, bio: e.target.value },
                  },
                }));
              }}
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {dictionary.artists.fields.imageLabel}
        </label>
        {formData.imageUrl && (
          <div className="mb-4 flex items-center gap-3 rounded border border-white/10 bg-white/5 p-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10">
              <img
                src={formData.imageUrl}
                alt="Photo actuelle"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm text-white/70">Photo actuelle</span>
          </div>
        )}
        <ImageUploader
          dictionary={dictionary.common}
          currentImage={formData.imageUrl}
          onImageUploaded={(img) => {
            void handleImageUploaded(img);
          }}
          onImageRemoved={handleImageRemoved}
        />
      </div>

      {/* External Links */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Liens externes (Instagram, Spotify, SoundCloud, site...)
        </label>
        <button
          type="button"
          onClick={addLink}
          className="text-xs font-semibold text-[#d5ff0a] hover:text-white"
        >
          + Ajouter un lien
        </button>
        {formData.links.length === 0 && (
          <div className="text-sm text-white/50">
            Aucun lien. Cliquez sur « Ajouter un lien » pour commencer.
          </div>
        )}
        <div className="space-y-3">
          {formData.links.map((link, index) => (
            <div
              key={`${link.id ?? "new"}-${String(index)}`}
              className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:grid-cols-5"
            >
              <div className="md:col-span-1">
                <label className="block text-xs text-white/60">
                  Plateforme
                </label>
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) => {
                    updateLink(index, "platform", e.target.value);
                  }}
                  placeholder="spotify, instagram..."
                  className="w-full bg-black border-2 border-white/20 px-3 py-2 text-white text-sm focus:border-[#d5ff0a] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-white/60">URL *</label>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => {
                    updateLink(index, "url", e.target.value);
                  }}
                  placeholder="https://..."
                  required
                  className="w-full bg-black border-2 border-white/20 px-3 py-2 text-white text-sm focus:border-[#d5ff0a] focus:outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs text-white/60">Label</label>
                <input
                  type="text"
                  value={link.label ?? ""}
                  onChange={(e) => {
                    updateLink(index, "label", e.target.value);
                  }}
                  placeholder="Officiel"
                  className="w-full bg-black border-2 border-white/20 px-3 py-2 text-white text-sm focus:border-[#d5ff0a] focus:outline-none"
                />
              </div>
              <div className="md:col-span-1 flex items-end justify-between gap-2">
                <div className="w-full">
                  <label className="block text-xs text-white/60">Ordre</label>
                  <input
                    type="number"
                    value={link.order}
                    onChange={(e) => {
                      updateLink(index, "order", parseInt(e.target.value) || 0);
                    }}
                    className="w-full bg-black border-2 border-white/20 px-3 py-2 text-white text-sm focus:border-[#d5ff0a] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeLink(index);
                  }}
                  className="self-end rounded border border-red-500/50 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order & Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Ordre d&apos;affichage
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                order: parseInt(e.target.value) || 0,
              }));
            }}
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Statut</label>
          <label className="flex items-center space-x-3 border-2 border-white/20 px-4 py-3 cursor-pointer hover:border-[#d5ff0a] transition-colors">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }));
              }}
              className="w-5 h-5"
            />
            <span>{dictionary.common.active}</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 pt-4 border-t-2 border-white/20">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#d5ff0a] text-black font-bold px-6 py-3 hover:bg-[#c5ef00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? dictionary.common.saving
            : mode === "create"
              ? dictionary.common.create
              : dictionary.common.save}
        </button>

        <button
          type="button"
          onClick={() => {
            router.push(`/${locale}/admin/artistes`);
          }}
          disabled={isSubmitting}
          className="border-2 border-white/20 px-6 py-3 hover:border-[#d5ff0a] transition-colors disabled:opacity-50"
        >
          {dictionary.common.cancel}
        </button>
      </div>
    </form>
  );
}
