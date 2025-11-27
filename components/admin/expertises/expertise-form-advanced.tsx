'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import matter from 'gray-matter'
import { RefreshCw, SaveIcon } from 'lucide-react'
import { toast } from 'sonner'

import { fetchWithAuth } from '@/lib/fetch-with-auth'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { MarkdownEditor } from '@/components/admin/markdown-editor'
import { LogoGrid, type LogoGridItem } from '@/components/logo-grid'
import { ParallaxSection } from '@/components/parallax-section'

// --- Types ---

type ExpertiseFormData = {
  slug: string
  coverImageId: string | null
  order: number
  isActive: boolean
  translations: {
    fr: {
      title: string
      subtitle: string
      description: string
      content: string
    }
    en: {
      title: string
      subtitle: string
      description: string
      content: string
    }
  }
}

type ExpertiseFormProps = {
  locale: string
  initialData?: ExpertiseFormData & { id: string }
  isEdit?: boolean
}

// Types for frontmatter metadata
type SupportItem = {
  name: string
  logo: string
  description?: string
  links?: { title: string; url: string }[]
}

type LabelItem = {
  name: string
  src: string
  href?: string
}

type CompanyItem = {
  name: string
  logo: string
  description?: string
  website?: string
}

type FrontmatterData = {
  supports?: SupportItem[]
  labels?: LabelItem[]
  productionCompanies?: CompanyItem[]
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  img5?: string
  [key: string]: unknown
}

// --- Helpers ---

// Helper to parse content into body + metadata
const parseContent = (fullContent: string): { body: string; frontmatter: FrontmatterData } => {
  try {
    const { content, data } = matter(fullContent)
    return { body: content, frontmatter: data as FrontmatterData }
  } catch {
    return { body: fullContent, frontmatter: {} }
  }
}

// Helper to reconstruct content from body + metadata
const stringifyContent = (body: string, frontmatter: FrontmatterData) => {
  try {
    return matter.stringify(body, frontmatter)
  } catch {
    return body
  }
}

// --- Component ---

export function ExpertiseFormAdvanced({ locale, initialData, isEdit = false }: ExpertiseFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLocale, setActiveLocale] = useState<'fr' | 'en'>('fr')

  // Main form state
  const [formData, setFormData] = useState<ExpertiseFormData>({
    slug: initialData?.slug ?? '',
    coverImageId: initialData?.coverImageId ?? null,
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
    translations: {
      fr: {
        title: initialData?.translations.fr.title ?? '',
        subtitle: initialData?.translations.fr.subtitle ?? '',
        description: initialData?.translations.fr.description ?? '',
        content: initialData?.translations.fr.content ?? '',
      },
      en: {
        title: initialData?.translations.en.title ?? '',
        subtitle: initialData?.translations.en.subtitle ?? '',
        description: initialData?.translations.en.description ?? '',
        content: initialData?.translations.en.content ?? '',
      },
    },
  })

  // Derived state for Metadata UI (synced with formData content)
  // We only sync when explicitly opening the Metadata tab or on init to avoid loop
  // But for simplicity, we'll parse on render or use specific handlers
  const [metadata, setMetadata] = useState<{
    fr: FrontmatterData
    en: FrontmatterData
  }>({ fr: {}, en: {} })

  // Parse initial metadata
  useEffect(() => {
    if (initialData) {
      const fr = parseContent(initialData.translations.fr.content)
      const en = parseContent(initialData.translations.en.content)
      setMetadata({
        fr: fr.frontmatter,
        en: en.frontmatter,
      })
    }
  }, [initialData])

  // Auto-generate slug
  useEffect(() => {
    if (!isEdit && formData.translations.fr.title && !formData.slug) {
      const slug = formData.translations.fr.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.translations.fr.title, isEdit, formData.slug])

  // Update content when metadata changes
  const updateContentWithMetadata = useCallback(
    (lang: 'fr' | 'en', newMetadata: FrontmatterData) => {
      setMetadata((prev) => ({ ...prev, [lang]: newMetadata }))

      const currentContent = formData.translations[lang].content
      const { body } = parseContent(currentContent)
      const newContent = stringifyContent(body, newMetadata)

      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [lang]: {
            ...prev.translations[lang],
            content: newContent,
          },
        },
      }))
    },
    [formData.translations]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = isEdit
        ? `/api/admin/expertises/${String(initialData?.id)}`
        : '/api/admin/expertises'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(isEdit ? 'Expertise mise à jour' : 'Expertise créée')
        router.push(`/${locale}/admin/expertises`)
        router.refresh()
      } else {
        const error = (await res.json()) as { error?: string }
        toast.error(error.error ?? "Erreur lors de l'enregistrement")
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving expertise:', error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to render sections preview
  const renderPreview = (lang: 'fr' | 'en') => {
    const content = formData.translations[lang].content
    const { body, frontmatter } = parseContent(content)

    // Split sections
    const sections = body
      .split('<!-- section:end -->')
      .map((s) =>
        s.replace('<!-- section:start -->', '').replace('<!-- section:end -->', '').trim()
      )
      .filter((s) => s.length > 0)

    // Map metadata to LogoGrid items
    const supportItems: LogoGridItem[] =
      frontmatter.supports?.map((s: SupportItem) => ({
        name: s.name,
        logo: s.logo,
        description: s.description,
        links: s.links,
      })) ?? []

    const labelItems: LogoGridItem[] =
      frontmatter.labels?.map((l: LabelItem) => ({
        name: l.name,
        logo: l.src,
        href: l.href,
      })) ?? []

    const companyItems: LogoGridItem[] =
      frontmatter.productionCompanies?.map((c: CompanyItem) => ({
        name: c.name,
        logo: c.logo,
        description: c.description,
        website: c.website,
      })) ?? []

    return (
      <div className="h-[800px] min-h-[500px] origin-top scale-[0.8] overflow-hidden overflow-y-auto rounded-lg border border-white/10 bg-black p-4 text-white">
        {/* Hero Mockup */}
        <div className="mb-12 text-center">
          <h1 className="bg-gradient-to-r from-[#d5ff0a] to-[#00d9ff] bg-clip-text text-4xl font-black text-transparent uppercase">
            {formData.translations[lang].title}
          </h1>
          <p className="mt-4 text-white/70">{formData.translations[lang].description}</p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, idx) => {
            // Mock image logic
            const imageKey = `img${String(idx + 1)}` as keyof FrontmatterData
            const imageValue = frontmatter[imageKey]
            const image =
              (typeof imageValue === 'string' ? imageValue : null) ?? '/images/placeholder.jpg'
            return (
              <ParallaxSection
                key={idx}
                index={idx}
                content={section}
                image={image}
                imagePosition={idx % 2 === 0 ? 'right' : 'left'}
              />
            )
          })}
        </div>

        {/* Grids */}
        <div className="mt-12 space-y-12">
          {supportItems.length > 0 && (
            <LogoGrid
              items={supportItems}
              title="Supports"
              columns={3}
              showModal
              accentColor="lime"
            />
          )}
          {labelItems.length > 0 && (
            <LogoGrid items={labelItems} title="Labels" columns={6} accentColor="cyan" />
          )}
          {companyItems.length > 0 && (
            <LogoGrid
              items={companyItems}
              title="Production"
              columns={4}
              showModal
              accentColor="purple"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e)
      }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isEdit ? "Modifier l'Expertise" : 'Nouvelle Expertise'}
        </h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              router.back()
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 [background-color:var(--brand-neon)] text-black hover:[background-color:var(--neon-400)]"
          >
            <SaveIcon className="h-4 w-4" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Editors */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-black">
            <CardHeader>
              <CardTitle className="text-white">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({ ...formData, slug: e.target.value })
                    }}
                    className="border-white/20 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Ordre</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }}
                    className="border-white/20 bg-white/5 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(c) => {
                    setFormData({ ...formData, isActive: c })
                  }}
                />
                <Label className="text-white">Actif</Label>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={activeLocale}
            onValueChange={(v) => {
              setActiveLocale(v as 'fr' | 'en')
            }}
          >
            <TabsList className="w-full bg-white/5">
              <TabsTrigger value="fr" className="flex-1">
                Français
              </TabsTrigger>
              <TabsTrigger value="en" className="flex-1">
                English
              </TabsTrigger>
            </TabsList>

            {(['fr', 'en'] as const).map((lang) => (
              <TabsContent key={lang} value={lang} className="mt-4 space-y-6">
                {/* Basic Text */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Titre ({lang.toUpperCase()})</Label>
                    <Input
                      value={formData.translations[lang].title}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          translations: {
                            ...formData.translations,
                            [lang]: {
                              ...formData.translations[lang],
                              title: e.target.value,
                            },
                          },
                        })
                      }}
                      className="border-white/20 bg-white/5 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Description ({lang.toUpperCase()})</Label>
                    <Textarea
                      value={formData.translations[lang].description}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          translations: {
                            ...formData.translations,
                            [lang]: {
                              ...formData.translations[lang],
                              description: e.target.value,
                            },
                          },
                        })
                      }}
                      className="border-white/20 bg-white/5 text-white"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <Label className="text-white">Contenu Markdown ({lang.toUpperCase()})</Label>
                  <div className="mb-2 text-xs text-white/50">
                    Utilisez `&lt;!-- section:end --&gt;` pour séparer les sections. Le frontmatter
                    (YAML) en haut du fichier gère les métadonnées.
                  </div>
                  <MarkdownEditor
                    value={formData.translations[lang].content}
                    onChange={(val) => {
                      setFormData({
                        ...formData,
                        translations: {
                          ...formData.translations,
                          [lang]: {
                            ...formData.translations[lang],
                            content: val ?? '',
                          },
                        },
                      })
                      // Also update local metadata state parse
                      const { frontmatter } = parseContent(val ?? '')
                      setMetadata((prev) => ({ ...prev, [lang]: frontmatter }))
                    }}
                    height={600}
                  />
                </div>

                {/* Quick Actions for Metadata (Optional UI helpers) */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-base text-white">
                      Métadonnées (YAML Helper)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white">Image 1</Label>
                        <Input
                          value={metadata[lang].img1 ?? ''}
                          onChange={(e) => {
                            const newMeta = {
                              ...metadata[lang],
                              img1: e.target.value,
                            }
                            updateContentWithMetadata(lang, newMeta)
                          }}
                          className="h-8 bg-black/20 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white">Image 2</Label>
                        <Input
                          value={metadata[lang].img2 ?? ''}
                          onChange={(e) => {
                            const newMeta = {
                              ...metadata[lang],
                              img2: e.target.value,
                            }
                            updateContentWithMetadata(lang, newMeta)
                          }}
                          className="h-8 bg-black/20 text-xs text-white"
                        />
                      </div>
                      {/* Add more helpers as needed */}
                    </div>
                    <div className="mt-4 text-xs text-white/40">
                      Modifiez directement le YAML en haut de l'éditeur pour les listes complexes
                      (Labels, Supports).
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Column: Preview */}
        <div className="sticky top-6 hidden space-y-6 lg:block">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Aperçu ({activeLocale.toUpperCase()})</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                router.refresh()
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {renderPreview(activeLocale)}
        </div>
      </div>
    </form>
  )
}
