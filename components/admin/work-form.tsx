"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageUploader } from "./image-uploader";
import type { AdminDictionary } from "@/types/dictionary";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import type {
  Work,
  WorkTranslation,
  Asset,
  Category,
  Label,
  Contribution,
  Artist,
} from "@prisma/client";

type WorkWithRelations = {
  translations: WorkTranslation[];
  coverImage: Asset | null;
  category: Category & { translations: { locale: string; name: string }[] };
  label: (Label & { translations: { locale: string; name: string }[] }) | null;
  contributions: (Contribution & {
    artist: Artist & { translations: { locale: string; name: string }[] };
  })[];
  images: Asset[];
} & Work;

type WorkFormProps = {
  dictionary: AdminDictionary;
  work?: WorkWithRelations;
  mode: "create" | "edit";
  locale: string;
};

type ArtistOption = {
  id: string;
  name: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

type LabelOption = {
  id: string;
  name: string;
};

export function WorkForm({ dictionary, work, mode, locale }: WorkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options for selects
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [labels, setLabels] = useState<LabelOption[]>([]);
  const [artists, setArtists] = useState<ArtistOption[]>([]);

  // Get translations by locale
  const frTranslation = work?.translations.find((t) => t.locale === "fr");
  const enTranslation = work?.translations.find((t) => t.locale === "en");

  // Form state
  const [formData, setFormData] = useState({
    slug: work?.slug ?? "",
    categoryId: work?.categoryId ?? "",
    labelId: work?.labelId ?? null,
    coverImageId: work?.coverImageId ?? null,
    coverImageUrl: work?.coverImage?.path ?? null,
    year: work?.year ?? null,
    status: work?.status ?? "PUBLISHED",
    spotifyUrl: work?.spotifyUrl ?? "",
    releaseDate: work?.releaseDate ?? "",
    genre: work?.genre ?? "",
    order: work?.order ?? 0,
    isActive: work?.isActive ?? true,
    isFeatured: work?.isFeatured ?? false,
    translations: {
      fr: {
        title: frTranslation?.title ?? "",
        description: frTranslation?.description ?? "",
        role: frTranslation?.role ?? "",
      },
      en: {
        title: enTranslation?.title ?? "",
        description: enTranslation?.description ?? "",
        role: enTranslation?.role ?? "",
      },
    },
    artists:
      work?.contributions.map((c) => ({
        artistId: c.artistId,
        role: c.role ?? "",
        order: c.order,
      })) ?? [],
    imageIds: work?.images.map((wi) => wi.id) ?? [],
    imageUrls: work?.images.map((wi) => wi.path) ?? [],
  });

  // Load categories, labels, and artists
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load categories
        const categoriesRes = await fetchWithAuth("/api/admin/categories");
        if (categoriesRes.ok) {
          const categoriesData = (await categoriesRes.json()) as {
            id: string;
            translations: { locale: string; name: string }[];
          }[];
          setCategories(
            categoriesData.map((cat) => ({
              id: cat.id,
              name:
                cat.translations.find((t) => t.locale === "fr")?.name ??
                "Sans nom",
            })),
          );
        }

        // Load labels
        const labelsRes = await fetchWithAuth("/api/admin/labels");
        if (labelsRes.ok) {
          const labelsData = (await labelsRes.json()) as {
            id: string;
            translations: { locale: string; name: string }[];
          }[];
          setLabels(
            labelsData.map((label) => ({
              id: label.id,
              name:
                label.translations.find((t) => t.locale === "fr")?.name ??
                "Sans nom",
            })),
          );
        }

        // Load artists
        const artistsRes = await fetchWithAuth("/api/admin/artists");
        if (artistsRes.ok) {
          const artistsData = (await artistsRes.json()) as {
            id: string;
            translations: { locale: string; name: string }[];
          }[];
          setArtists(
            artistsData.map((comp) => ({
              id: comp.id,
              name:
                comp.translations.find((t) => t.locale === "fr")?.name ??
                "Sans nom",
            })),
          );
        }
      } catch {
        // Error loading options - silently fail
      }
    };

    void loadOptions();
  }, []);

  const handleCoverImageUploaded = async (image: {
    url: string;
    width: number;
    height: number;
    aspectRatio: number;
    blurDataUrl: string;
  }) => {
    // Create Asset in database
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
        coverImageId: asset.id,
        coverImageUrl: asset.path,
      }));
    }
  };

  const handleCoverImageRemoved = () => {
    setFormData((prev) => ({
      ...prev,
      coverImageId: null,
      coverImageUrl: null,
    }));
  };

  const handleAddArtist = () => {
    setFormData((prev) => ({
      ...prev,
      artists: [
        ...prev.artists,
        { artistId: "", role: "", order: prev.artists.length },
      ],
    }));
  };

  const handleRemoveArtist = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index),
    }));
  };

  const handleArtistChange = (
    index: number,
    field: "artistId" | "role" | "order",
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      artists: prev.artists.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      ),
    }));
  };

  const handleWorkImageUploaded = async (image: {
    url: string;
    width: number;
    height: number;
    aspectRatio: number;
    blurDataUrl: string;
  }) => {
    // Create Asset in database
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
        imageIds: [...prev.imageIds, asset.id],
        imageUrls: [...prev.imageUrls, asset.path],
      }));
    }
  };

  const handleRemoveWorkImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageIds: prev.imageIds.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/projects"
          : `/api/admin/projects/${work?.id ?? ""}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: formData.slug,
          categoryId: formData.categoryId,
          labelId: formData.labelId,
          coverImageId: formData.coverImageId,
          year: formData.year,
          status: formData.status,
          spotifyUrl: formData.spotifyUrl ?? null,
          releaseDate: formData.releaseDate ?? null,
          genre: formData.genre ?? null,
          order: formData.order,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          translations: formData.translations,
          artists: formData.artists.filter((c) => c.artistId),
          imageIds: formData.imageIds,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'enregistrement");
      }

      // Success - redirect to list
      router.push(`/${locale}/admin/projets`);
      router.refresh();
    } catch (err: unknown) {
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
          placeholder="mon-album-2024"
          className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
        />
      </div>

      {/* French Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇫🇷 Français</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titre *</label>
            <input
              type="text"
              value={formData.translations.fr.title}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, title: e.target.value },
                  },
                }));
              }}
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.translations.fr.description}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: {
                      ...prev.translations.fr,
                      description: e.target.value,
                    },
                  },
                }));
              }}
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rôle <span className="text-white/50">(ex: Piano)</span>
            </label>
            <input
              type="text"
              value={formData.translations.fr.role}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    fr: { ...prev.translations.fr, role: e.target.value },
                  },
                }));
              }}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* English Translation */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <h3 className="text-lg font-bold mb-4 text-[#d5ff0a]">🇬🇧 English</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.translations.en.title}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, title: e.target.value },
                  },
                }));
              }}
              required
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.translations.en.description}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: {
                      ...prev.translations.en,
                      description: e.target.value,
                    },
                  },
                }));
              }}
              rows={4}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Role <span className="text-white/50">(ex: Piano)</span>
            </label>
            <input
              type="text"
              value={formData.translations.en.role}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    en: { ...prev.translations.en, role: e.target.value },
                  },
                }));
              }}
              className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Category & Label */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Catégorie *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, categoryId: e.target.value }));
            }}
            required
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Label</label>
          <select
            value={formData.labelId ?? ""}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                labelId: e.target.value || null,
              }));
            }}
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          >
            <option value="">Aucun label</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-4">
          Image de couverture
        </label>
        <ImageUploader
          dictionary={dictionary.common}
          currentImage={formData.coverImageUrl}
          onImageUploaded={(img) => {
            void handleCoverImageUploaded(img);
          }}
          onImageRemoved={handleCoverImageRemoved}
        />
      </div>

      {/* Year & Genre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Année</label>
          <input
            type="number"
            value={formData.year ?? ""}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                year: e.target.value ? parseInt(e.target.value) : null,
              }));
            }}
            placeholder="2024"
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, genre: e.target.value }));
            }}
            placeholder="Classique"
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>
      </div>

      {/* Spotify URL & Release Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Spotify URL</label>
          <input
            type="url"
            value={formData.spotifyUrl}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, spotifyUrl: e.target.value }));
            }}
            placeholder="https://open.spotify.com/..."
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Date de sortie
          </label>
          <input
            type="date"
            value={formData.releaseDate}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, releaseDate: e.target.value }));
            }}
            className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-2">Statut</label>
        <select
          value={formData.status}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, status: e.target.value }));
          }}
          className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
        >
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
      </div>

      {/* Artists */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#d5ff0a]">Artistes</h3>
          <button
            type="button"
            onClick={handleAddArtist}
            className="border-2 border-[#d5ff0a] text-[#d5ff0a] px-4 py-2 text-sm hover:bg-[#d5ff0a]/10 transition-colors"
          >
            + Ajouter un artiste
          </button>
        </div>

        <div className="space-y-4">
          {formData.artists.map((artist, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-2 border-white/10 bg-black/20"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Artiste *
                </label>
                <select
                  value={artist.artistId}
                  onChange={(e) => {
                    handleArtistChange(index, "artistId", e.target.value);
                  }}
                  required
                  className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
                >
                  <option value="">Sélectionner un artiste</option>
                  {artists.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveArtist(index);
                  }}
                  className="w-full border-2 border-red-500/50 text-red-400 px-4 py-3 text-sm hover:bg-red-500/10 transition-colors"
                >
                  Retirer
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Rôle <span className="text-white/50">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={artist.role}
                  onChange={(e) => {
                    handleArtistChange(index, "role", e.target.value);
                  }}
                  placeholder="Artiste principal"
                  className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#d5ff0a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ordre</label>
                <input
                  type="number"
                  value={artist.order}
                  onChange={(e) => {
                    handleArtistChange(
                      index,
                      "order",
                      parseInt(e.target.value) || 0,
                    );
                  }}
                  className="w-full bg-white/5 border-2 border-white/20 px-4 py-3 text-white focus:border-[#d5ff0a] focus:outline-none"
                />
              </div>
            </div>
          ))}

          {formData.artists.length === 0 && (
            <p className="text-white/50 text-sm italic">
              Aucun artiste ajouté
            </p>
          )}
        </div>
      </div>

      {/* Work Images */}
      <div className="border-2 border-white/20 p-6 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#d5ff0a]">
            Images supplémentaires
          </h3>
        </div>

        <div className="space-y-4">
          <ImageUploader
            dictionary={dictionary.common}
            currentImage={null}
            onImageUploaded={(img) => {
              void handleWorkImageUploaded(img);
            }}
            onImageRemoved={() => {
              // No action needed for additional images
            }}
          />

          {formData.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative border-2 border-white/20 p-2"
                >
                  <Image
                    src={url}
                    alt={`Image ${String(index + 1)}`}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveWorkImage(index);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.imageUrls.length === 0 && (
            <p className="text-white/50 text-sm italic">Aucune image ajoutée</p>
          )}
        </div>
      </div>

      {/* Order, Active, Featured */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <label className="block text-sm font-medium mb-2">Actif</label>
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

        <div>
          <label className="block text-sm font-medium mb-2">Mis en avant</label>
          <label className="flex items-center space-x-3 border-2 border-white/20 px-4 py-3 cursor-pointer hover:border-[#d5ff0a] transition-colors">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  isFeatured: e.target.checked,
                }));
              }}
              className="w-5 h-5"
            />
            <span>Oui</span>
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
            router.push(`/${locale}/admin/projets`);
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
