"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ImageIcon, SaveIcon } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { MarkdownEditor } from "@/components/admin/markdown-editor";

type ExpertiseFormData = {
  slug: string;
  coverImageId: string | null;
  order: number;
  isActive: boolean;
  translations: {
    fr: {
      title: string;
      subtitle: string;
      description: string;
      content: string;
    };
    en: {
      title: string;
      subtitle: string;
      description: string;
      content: string;
    };
  };
};

type ExpertiseFormProps = {
  locale: string;
  initialData?: ExpertiseFormData & { id: string };
  isEdit?: boolean;
};

export function ExpertiseForm({
  locale,
  initialData,
  isEdit = false,
}: ExpertiseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ExpertiseFormData>({
    slug: initialData?.slug ?? "",
    coverImageId: initialData?.coverImageId ?? null,
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
    translations: {
      fr: {
        title: initialData?.translations.fr.title ?? "",
        subtitle: initialData?.translations.fr.subtitle ?? "",
        description: initialData?.translations.fr.description ?? "",
        content: initialData?.translations.fr.content ?? "",
      },
      en: {
        title: initialData?.translations.en.title ?? "",
        subtitle: initialData?.translations.en.subtitle ?? "",
        description: initialData?.translations.en.description ?? "",
        content: initialData?.translations.en.content ?? "",
      },
    },
  });

  // Auto-generate slug from French title
  useEffect(() => {
    if (!isEdit && formData.translations.fr.title) {
      const slug = formData.translations.fr.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.translations.fr.title, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEdit
        ? `/api/admin/expertises/${String(initialData?.id)}`
        : "/api/admin/expertises";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(isEdit ? "Expertise mise à jour" : "Expertise créée");
        router.push(`/${locale}/admin/expertises`);
        router.refresh();
      } else {
        const error = (await res.json()) as { error?: string };
        toast.error(error.error ?? "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving expertise:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="space-y-6"
    >
      {/* Basic Info */}
      <Card className="border-white/10 bg-black">
        <CardHeader>
          <CardTitle className="text-white">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white">
                Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  setFormData({ ...formData, slug: e.target.value });
                }}
                required
                className="border-white/20 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order" className="text-white">
                Ordre
              </Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => {
                  setFormData({ ...formData, order: parseInt(e.target.value) });
                }}
                className="border-white/20 bg-white/5 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, isActive: checked });
              }}
            />
            <Label htmlFor="isActive" className="text-white">
              Actif
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImageId" className="text-white">
              Image de couverture
            </Label>
            <div className="flex gap-2">
              <Input
                id="coverImageId"
                value={formData.coverImageId ?? ""}
                onChange={(e) => {
                  setFormData({ ...formData, coverImageId: e.target.value });
                }}
                placeholder="ID de l'image"
                className="border-white/20 bg-white/5 text-white"
              />
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  router.push(`/${locale}/admin/medias`);
                }}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translations */}
      <Card className="border-white/10 bg-black">
        <CardHeader>
          <CardTitle className="text-white">Traductions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fr" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            {/* French */}
            <TabsContent value="fr" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title-fr" className="text-white">
                  Titre *
                </Label>
                <Input
                  id="title-fr"
                  value={formData.translations.fr.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        fr: {
                          ...formData.translations.fr,
                          title: e.target.value,
                        },
                      },
                    });
                  }}
                  required
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle-fr" className="text-white">
                  Sous-titre
                </Label>
                <Input
                  id="subtitle-fr"
                  value={formData.translations.fr.subtitle}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        fr: {
                          ...formData.translations.fr,
                          subtitle: e.target.value,
                        },
                      },
                    });
                  }}
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-fr" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description-fr"
                  value={formData.translations.fr.description}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        fr: {
                          ...formData.translations.fr,
                          description: e.target.value,
                        },
                      },
                    });
                  }}
                  rows={3}
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-fr" className="text-white">
                  Contenu (Markdown) *
                </Label>
                <MarkdownEditor
                  value={formData.translations.fr.content}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        fr: {
                          ...formData.translations.fr,
                          content: value ?? "",
                        },
                      },
                    });
                  }}
                  height={500}
                />
              </div>
            </TabsContent>

            {/* English */}
            <TabsContent value="en" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title-en" className="text-white">
                  Title *
                </Label>
                <Input
                  id="title-en"
                  value={formData.translations.en.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        en: {
                          ...formData.translations.en,
                          title: e.target.value,
                        },
                      },
                    });
                  }}
                  required
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle-en" className="text-white">
                  Subtitle
                </Label>
                <Input
                  id="subtitle-en"
                  value={formData.translations.en.subtitle}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        en: {
                          ...formData.translations.en,
                          subtitle: e.target.value,
                        },
                      },
                    });
                  }}
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-en" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description-en"
                  value={formData.translations.en.description}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        en: {
                          ...formData.translations.en,
                          description: e.target.value,
                        },
                      },
                    });
                  }}
                  rows={3}
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-en" className="text-white">
                  Content (Markdown) *
                </Label>
                <MarkdownEditor
                  value={formData.translations.en.content}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        en: {
                          ...formData.translations.en,
                          content: value ?? "",
                        },
                      },
                    });
                  }}
                  height={500}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 bg-lime-300 text-black hover:bg-lime-400"
        >
          <SaveIcon className="h-4 w-4" />
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.back();
          }}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
