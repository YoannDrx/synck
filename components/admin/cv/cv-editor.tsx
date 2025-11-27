'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  SaveIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { ColorPicker } from '@/components/admin/color-picker'
import { CVDocument } from '@/components/cv/pdf-document'

type CVTheme = {
  primary: string
  secondary: string
  header: string
  sidebar: string
  surface: string
  text: string
  muted: string
  border: string
  badge: string
}

const defaultTheme: CVTheme = {
  primary: '#D5FF0A',
  secondary: '#9EF01A',
  header: '#0B0C12',
  sidebar: '#F4F5F7',
  surface: '#FFFFFF',
  text: '#0D0E11',
  muted: '#60626A',
  border: '#E2E4EA',
  badge: '#0F1118',
}

const PDFViewerClient = dynamic(() => import('@react-pdf/renderer').then((mod) => mod.PDFViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center bg-white/5 text-white">
      Chargement du PDF...
    </div>
  ),
})

type Translation = {
  locale: string
  title?: string
  subtitle?: string | null
  location?: string | null
  description?: string | null
  name?: string // For skills
}

type CVItem = {
  id?: string
  startDate?: string | null
  endDate?: string | null
  isCurrent: boolean
  order: number
  isActive: boolean
  translations: Translation[]
}

type CVSection = {
  id?: string
  type: string
  placement?: string // "sidebar" | "main"
  layoutType?: string // "list" | "timeline"
  color?: string | null
  icon?: string | null
  order: number
  isActive: boolean
  translations: Translation[]
  items: CVItem[]
}

type CVSkill = {
  id?: string
  category: string
  level: number
  showAsBar: boolean
  order: number
  isActive: boolean
  translations: Translation[]
}

type CVSocialLink = {
  id?: string
  platform: string
  url: string
  label?: string | null
  order: number
}

type CVData = {
  id?: string
  photo?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  location?: string | null
  linkedInUrl?: string | null
  headlineFr?: string | null
  headlineEn?: string | null
  bioFr?: string | null
  bioEn?: string | null
  layout?: string
  accentColor?: string
  showPhoto?: boolean
  theme?: CVTheme | null
  sections: CVSection[]
  skills: CVSkill[]
  socialLinks: CVSocialLink[]
}

export function CVEditor({ initialData, locale }: { initialData: CVData | null; locale: string }) {
  const baseData: CVData = {
    sections: [],
    skills: [],
    socialLinks: [],
    accentColor: defaultTheme.primary,
    showPhoto: true,
    layout: 'creative',
    ...(initialData ?? {}),
  }

  const initialTheme: CVTheme = {
    ...defaultTheme,
    ...(baseData.theme ?? {}),
    primary: baseData.accentColor ?? baseData.theme?.primary ?? defaultTheme.primary,
  }

  baseData.theme = initialTheme
  baseData.accentColor = initialTheme.primary

  // Merge initial data with defaults
  const [data, setData] = useState<CVData>(baseData)

  const [isSaving, setIsSaving] = useState(false)
  const [previewLocale, setPreviewLocale] = useState(locale)

  // --- GLOBAL SETTINGS ---
  const updateGlobal = (field: keyof CVData, value: unknown) => {
    setData({ ...data, [field]: value })
  }

  const updateTheme = (field: keyof CVTheme, value: string) => {
    const nextTheme: CVTheme = {
      ...defaultTheme,
      ...(data.theme ?? {}),
      [field]: value,
    }
    const nextData: CVData = { ...data, theme: nextTheme }
    if (field === 'primary') {
      nextData.accentColor = value
    }
    setData(nextData)
  }

  // --- SECTION MANAGERS ---
  const addSection = () => {
    const newSection: CVSection = {
      type: 'custom',
      placement: 'main',
      layoutType: 'list',
      order: data.sections.length,
      isActive: true,
      color: data.theme?.secondary ?? data.accentColor ?? defaultTheme.primary,
      icon: 'Sparkles',
      translations: [
        { locale: 'fr', title: 'Nouvelle Section' },
        { locale: 'en', title: 'New Section' },
      ],
      items: [],
    }
    setData({ ...data, sections: [...data.sections, newSection] })
  }

  const updateSection = (index: number, field: keyof CVSection, value: unknown) => {
    const newSections = [...data.sections]
    newSections[index] = { ...newSections[index], [field]: value } as CVSection
    setData({ ...data, sections: newSections })
  }

  const updateSectionTranslation = (index: number, loc: string, value: string) => {
    const newSections = [...data.sections]
    const translations = [...newSections[index].translations]
    const tIndex = translations.findIndex((t) => t.locale === loc)
    if (tIndex >= 0) {
      translations[tIndex] = { ...translations[tIndex], title: value }
    } else {
      translations.push({ locale: loc, title: value })
    }
    newSections[index].translations = translations
    setData({ ...data, sections: newSections })
  }

  const removeSection = (index: number) => {
    const newSections = data.sections.filter((_, i) => i !== index)
    setData({ ...data, sections: newSections })
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === data.sections.length - 1) return

    const newSections = [...data.sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
    newSections.forEach((s, i) => {
      s.order = i
    })
    setData({ ...data, sections: newSections })
  }

  // --- ITEM MANAGERS ---
  const addItem = (sectionIndex: number) => {
    const newSections = [...data.sections]
    const newItem: CVItem = {
      order: newSections[sectionIndex].items?.length ?? 0,
      isActive: true,
      isCurrent: false,
      translations: [
        {
          locale: 'fr',
          title: 'Nouveau Poste',
          subtitle: '',
          description: '',
          location: '',
        },
        {
          locale: 'en',
          title: 'New Position',
          subtitle: '',
          description: '',
          location: '',
        },
      ],
    }
    newSections[sectionIndex].items = [...(newSections[sectionIndex].items ?? []), newItem]
    setData({ ...data, sections: newSections })
  }

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof CVItem,
    value: unknown
  ) => {
    const newSections = [...data.sections]
    const items = [...newSections[sectionIndex].items]
    items[itemIndex] = { ...items[itemIndex], [field]: value } as CVItem
    newSections[sectionIndex].items = items
    setData({ ...data, sections: newSections })
  }

  const updateItemTranslation = (
    sectionIndex: number,
    itemIndex: number,
    loc: string,
    field: keyof Translation,
    value: string
  ) => {
    const newSections = [...data.sections]
    const items = [...newSections[sectionIndex].items]
    const translations = [...items[itemIndex].translations]
    const tIndex = translations.findIndex((t) => t.locale === loc)

    if (tIndex >= 0) {
      translations[tIndex] = {
        ...translations[tIndex],
        [field]: value,
      } as Translation
    } else {
      const newT: Translation = { locale: loc, [field]: value }
      translations.push(newT)
    }

    items[itemIndex].translations = translations
    newSections[sectionIndex].items = items
    setData({ ...data, sections: newSections })
  }

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...data.sections]
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter(
      (_, i) => i !== itemIndex
    )
    setData({ ...data, sections: newSections })
  }

  const moveItem = (sectionIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const newSections = [...data.sections]
    const items = [...newSections[sectionIndex].items]
    if (direction === 'up' && itemIndex === 0) return
    if (direction === 'down' && itemIndex === items.length - 1) return
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
    ;[items[itemIndex], items[targetIndex]] = [items[targetIndex], items[itemIndex]]
    items.forEach((item, i) => {
      item.order = i
    })
    newSections[sectionIndex].items = items
    setData({ ...data, sections: newSections })
  }

  const handleSave = () => {
    void (async () => {
      setIsSaving(true)
      try {
        const res = await fetch('/api/cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to save')
        toast.success('CV sauvegardé !')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        toast.error('Erreur lors de la sauvegarde')
      } finally {
        setIsSaving(false)
      }
    })()
  }

  const getT = (arr: Translation[], loc: string): Translation =>
    arr.find((t) => t.locale === loc) ?? { locale: loc }

  return (
    <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-8 xl:grid-cols-2">
      {/* Editor Column */}
      <div className="h-full space-y-6 overflow-y-auto pr-2 pb-20">
        {/* Global Settings */}
        <Card className="border-white/10 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <SettingsIcon className="h-5 w-5" /> Paramètres Généraux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/70">Accent principal</Label>
                <ColorPicker
                  value={data.theme?.primary ?? data.accentColor ?? defaultTheme.primary}
                  onChange={(c) => {
                    updateTheme('primary', c)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Accent secondaire</Label>
                <ColorPicker
                  value={data.theme?.secondary ?? defaultTheme.secondary}
                  onChange={(c) => {
                    updateTheme('secondary', c)
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/70">Fond du header</Label>
                <ColorPicker
                  value={data.theme?.header ?? defaultTheme.header}
                  onChange={(c) => {
                    updateTheme('header', c)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Fond de la sidebar</Label>
                <ColorPicker
                  value={data.theme?.sidebar ?? defaultTheme.sidebar}
                  onChange={(c) => {
                    updateTheme('sidebar', c)
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/70">Couleur du texte</Label>
                <ColorPicker
                  value={data.theme?.text ?? defaultTheme.text}
                  onChange={(c) => {
                    updateTheme('text', c)
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Séparateurs / contours</Label>
                <ColorPicker
                  value={data.theme?.border ?? defaultTheme.border}
                  onChange={(c) => {
                    updateTheme('border', c)
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={data.showPhoto}
                onChange={(e) => {
                  updateGlobal('showPhoto', e.target.checked)
                }}
                className="h-4 w-4"
              />
              <Label className="text-white">Afficher la photo</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Titre (FR)</Label>
              <Input
                value={data.headlineFr ?? ''}
                onChange={(e) => {
                  updateGlobal('headlineFr', e.target.value)
                }}
                className="border-white/10 bg-black text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Titre (EN)</Label>
              <Input
                value={data.headlineEn ?? ''}
                onChange={(e) => {
                  updateGlobal('headlineEn', e.target.value)
                }}
                className="border-white/10 bg-black text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Bio (FR)</Label>
              <Textarea
                value={data.bioFr ?? ''}
                onChange={(e) => {
                  updateGlobal('bioFr', e.target.value)
                }}
                className="h-20 border-white/10 bg-black text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Bio (EN)</Label>
              <Textarea
                value={data.bioEn ?? ''}
                onChange={(e) => {
                  updateGlobal('bioEn', e.target.value)
                }}
                className="h-20 border-white/10 bg-black text-white"
              />
            </div>

            {/* Contacts */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <Input
                placeholder="Email"
                value={data.email ?? ''}
                onChange={(e) => {
                  updateGlobal('email', e.target.value)
                }}
                className="border-white/10 bg-black text-white"
              />
              <Input
                placeholder="Téléphone"
                value={data.phone ?? ''}
                onChange={(e) => {
                  updateGlobal('phone', e.target.value)
                }}
                className="border-white/10 bg-black text-white"
              />
              <Input
                placeholder="Site Web"
                value={data.website ?? ''}
                onChange={(e) => {
                  updateGlobal('website', e.target.value)
                }}
                className="border-white/10 bg-black text-white"
              />
              <Input
                placeholder="Localisation"
                value={data.location ?? ''}
                onChange={(e) => {
                  updateGlobal('location', e.target.value)
                }}
                className="border-white/10 bg-black text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black">
          <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between border-b border-white/10 bg-black">
            <CardTitle className="text-white">Sections</CardTitle>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="[background-color:var(--brand-neon)] text-black hover:[background-color:var(--neon-400)]"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {isSaving ? '...' : 'Sauvegarder'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {data.sections.map((section, sIndex) => (
                <AccordionItem
                  key={sIndex}
                  value={`section-${String(sIndex)}`}
                  className="rounded-lg border border-white/10 bg-white/5 px-4"
                >
                  <div className="flex items-center justify-between py-2">
                    <AccordionTrigger className="py-2 text-white hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium">
                          {getT(section.translations, 'fr').title ?? 'Nouvelle Section'}
                        </span>
                        <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/50 uppercase">
                          {section.placement ?? 'main'}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          moveSection(sIndex, 'up')
                        }}
                        disabled={sIndex === 0}
                      >
                        <ArrowUpIcon className="h-4 w-4 text-white/50" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          moveSection(sIndex, 'down')
                        }}
                        disabled={sIndex === data.sections.length - 1}
                      >
                        <ArrowDownIcon className="h-4 w-4 text-white/50" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          removeSection(sIndex)
                        }}
                        className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <AccordionContent className="space-y-6 pb-4">
                    {/* Section Config */}
                    <div className="mb-4 grid grid-cols-1 gap-4 rounded-md bg-black/20 p-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-white/70">Placement</Label>
                        <Select
                          value={section.placement ?? 'main'}
                          onValueChange={(v) => {
                            updateSection(sIndex, 'placement', v)
                          }}
                        >
                          <SelectTrigger className="border-white/10 bg-black text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Principal (Main)</SelectItem>
                            <SelectItem value="sidebar">Latéral (Sidebar)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">Style d'affichage</Label>
                        <Select
                          value={section.layoutType ?? 'list'}
                          onValueChange={(v) => {
                            updateSection(sIndex, 'layoutType', v)
                          }}
                        >
                          <SelectTrigger className="border-white/10 bg-black text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="list">Liste Simple</SelectItem>
                            <SelectItem value="timeline">Chronologie (Timeline)</SelectItem>
                            <SelectItem value="grid">Grille</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">Couleur du bloc</Label>
                        <ColorPicker
                          value={
                            section.color ??
                            data.theme?.secondary ??
                            data.accentColor ??
                            defaultTheme.primary
                          }
                          onChange={(v) => {
                            updateSection(sIndex, 'color', v)
                          }}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2 lg:col-span-3">
                        <Label className="text-white/70">Icône (nom Lucide, optionnel)</Label>
                        <Input
                          value={section.icon ?? ''}
                          onChange={(e) => {
                            updateSection(sIndex, 'icon', e.target.value)
                          }}
                          placeholder="Briefcase, GraduationCap..."
                          className="border-white/10 bg-black text-white"
                        />
                      </div>
                    </div>

                    {/* Section Titles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/70">Titre (FR)</Label>
                        <Input
                          value={getT(section.translations, 'fr').title ?? ''}
                          onChange={(e) => {
                            updateSectionTranslation(sIndex, 'fr', e.target.value)
                          }}
                          className="border-white/10 bg-black text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/70">Titre (EN)</Label>
                        <Input
                          value={getT(section.translations, 'en').title ?? ''}
                          onChange={(e) => {
                            updateSectionTranslation(sIndex, 'en', e.target.value)
                          }}
                          className="border-white/10 bg-black text-white"
                        />
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h4 className="text-sm font-medium text-white/70 uppercase">
                          Éléments de contenu
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            addItem(sIndex)
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <PlusIcon className="mr-2 h-3 w-3" /> Ajouter un élément
                        </Button>
                      </div>

                      {section.items?.map((item, iIndex) => (
                        <div
                          key={iIndex}
                          className="space-y-4 rounded-md border border-white/10 bg-black/40 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="grid w-full grid-cols-2 gap-2 pr-4 text-xs text-white/50">
                              <div className="space-y-1">
                                <span>Début</span>
                                <input
                                  type="date"
                                  className="w-full rounded border border-white/10 bg-white/5 p-1 text-white"
                                  value={
                                    item.startDate
                                      ? new Date(item.startDate).toISOString().split('T')[0]
                                      : ''
                                  }
                                  onChange={(e) => {
                                    updateItem(sIndex, iIndex, 'startDate', e.target.value)
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <span>Fin</span>
                                <input
                                  type="date"
                                  className="w-full rounded border border-white/10 bg-white/5 p-1 text-white"
                                  value={
                                    item.endDate
                                      ? new Date(item.endDate).toISOString().split('T')[0]
                                      : ''
                                  }
                                  onChange={(e) => {
                                    updateItem(sIndex, iIndex, 'endDate', e.target.value)
                                  }}
                                  disabled={item.isCurrent}
                                />
                              </div>
                              <div className="col-span-2 pt-2">
                                <label className="flex cursor-pointer items-center gap-2 hover:text-white">
                                  <input
                                    type="checkbox"
                                    checked={item.isCurrent}
                                    onChange={(e) => {
                                      updateItem(sIndex, iIndex, 'isCurrent', e.target.checked)
                                    }}
                                    className="rounded border-white/20 bg-white/5"
                                  />
                                  En poste actuellement
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => {
                                  moveItem(sIndex, iIndex, 'up')
                                }}
                                disabled={iIndex === 0}
                              >
                                <ArrowUpIcon className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => {
                                  moveItem(sIndex, iIndex, 'down')
                                }}
                                disabled={iIndex === section.items.length - 1}
                              >
                                <ArrowDownIcon className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-red-400"
                                onClick={() => {
                                  removeItem(sIndex, iIndex)
                                }}
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <Tabs defaultValue="fr" className="w-full">
                            <TabsList className="h-8 w-full justify-start bg-white/10">
                              <TabsTrigger value="fr" className="h-7 px-4 text-xs">
                                Français
                              </TabsTrigger>
                              <TabsTrigger value="en" className="h-7 px-4 text-xs">
                                English
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="fr" className="mt-3 space-y-3">
                              <Input
                                placeholder="Titre / Poste"
                                value={getT(item.translations, 'fr').title ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'fr',
                                    'title',
                                    e.target.value
                                  )
                                }}
                                className="h-9 border-white/10 bg-black text-white"
                              />
                              <Input
                                placeholder="Sous-titre / Entreprise"
                                value={getT(item.translations, 'fr').subtitle ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'fr',
                                    'subtitle',
                                    e.target.value
                                  )
                                }}
                                className="h-9 border-white/10 bg-black text-white"
                              />
                              <Input
                                placeholder="Lieu"
                                value={getT(item.translations, 'fr').location ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'fr',
                                    'location',
                                    e.target.value
                                  )
                                }}
                                className="h-9 border-white/10 bg-black text-white"
                              />
                              <Textarea
                                placeholder="Description"
                                value={getT(item.translations, 'fr').description ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'fr',
                                    'description',
                                    e.target.value
                                  )
                                }}
                                className="min-h-[80px] border-white/10 bg-black text-white"
                              />
                            </TabsContent>
                            <TabsContent value="en" className="mt-3 space-y-3">
                              <Input
                                placeholder="Title / Position"
                                value={getT(item.translations, 'en').title ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'en',
                                    'title',
                                    e.target.value
                                  )
                                }}
                                className="h-9 border-white/10 bg-black text-white"
                              />
                              <Input
                                placeholder="Subtitle / Company"
                                value={getT(item.translations, 'en').subtitle ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'en',
                                    'subtitle',
                                    e.target.value
                                  )
                                }}
                                className="h-9 border-white/10 bg-black text-white"
                              />
                              <Input
                                placeholder="Location"
                                value={getT(item.translations, 'en').location ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'en',
                                    'location',
                                    e.target.value
                                  )
                                }}
                                className="h-9 border-white/10 bg-black text-white"
                              />
                              <Textarea
                                placeholder="Description"
                                value={getT(item.translations, 'en').description ?? ''}
                                onChange={(e) => {
                                  updateItemTranslation(
                                    sIndex,
                                    iIndex,
                                    'en',
                                    'description',
                                    e.target.value
                                  )
                                }}
                                className="min-h-[80px] border-white/10 bg-black text-white"
                              />
                            </TabsContent>
                          </Tabs>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button
              variant="outline"
              className="mt-4 w-full border-dashed border-white/20 py-8 text-white hover:bg-white/5"
              onClick={addSection}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Ajouter une nouvelle section
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Column */}
      <div className="sticky top-0 h-full pb-4">
        <Card className="flex h-full flex-col border-white/10 bg-black">
          <CardHeader className="z-20 flex shrink-0 flex-row items-center justify-between border-b border-white/10 bg-black py-4">
            <CardTitle className="text-white">Prévisualisation PDF</CardTitle>
            <Tabs value={previewLocale} onValueChange={setPreviewLocale}>
              <TabsList className="border border-white/10 bg-white/10">
                <TabsTrigger value="fr">FR</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="relative flex-1 overflow-hidden bg-zinc-900/50 p-0">
            <PDFViewerClient width="100%" height="100%" className="h-full w-full border-none">
              <CVDocument data={data} locale={previewLocale} />
            </PDFViewerClient>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
