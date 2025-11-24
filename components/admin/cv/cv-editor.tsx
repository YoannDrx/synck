"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { PlusIcon, TrashIcon, SaveIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { CVDocument } from "@/components/cv/pdf-document";

const PDFViewerClient = dynamic(() => import("@react-pdf/renderer").then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full flex items-center justify-center bg-white/5 text-white">Chargement du PDF...</div>
});

type Translation = {
  locale: string;
  title?: string;
  subtitle?: string | null;
  location?: string | null;
  description?: string | null;
};

type CVItem = {
  id?: string; // optional for new items
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  order: number;
  isActive: boolean;
  translations: Translation[];
};

type CVSection = {
  id?: string;
  type: string;
  order: number;
  isActive: boolean;
  translations: Translation[];
  items: CVItem[];
};

type CVData = {
  id?: string;
  sections: CVSection[];
};

export function CVEditor({ initialData, locale }: { initialData: CVData | null, locale: string }) {
  const [data, setData] = useState<CVData>(initialData ?? { sections: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [previewLocale, setPreviewLocale] = useState(locale);

  // --- SECTION MANAGERS ---

  const addSection = () => {
    const newSection: CVSection = {
      type: "custom",
      order: data.sections.length,
      isActive: true,
      translations: [
        { locale: "fr", title: "Nouvelle Section" },
        { locale: "en", title: "New Section" }
      ],
      items: []
    };
    setData({ ...data, sections: [...data.sections, newSection] });
  };

  const updateSectionTranslation = (index: number, loc: string, value: string) => {
    const newSections = [...data.sections];
    const translations = [...(newSections[index].translations)];
    const tIndex = translations.findIndex(t => t.locale === loc);
    if (tIndex >= 0) {
        translations[tIndex] = { ...translations[tIndex], title: value };
    } else {
        translations.push({ locale: loc, title: value });
    }
    newSections[index].translations = translations;
    setData({ ...data, sections: newSections });
  };

  const removeSection = (index: number) => {
    const newSections = data.sections.filter((_, i) => i !== index);
    setData({ ...data, sections: newSections });
  };
  
  const moveSection = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === data.sections.length - 1) return;
      
      const newSections = [...data.sections];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      
      // Update orders
      newSections.forEach((s, i) => { s.order = i; });
      
      setData({ ...data, sections: newSections });
  };

  // --- ITEM MANAGERS ---

  const addItem = (sectionIndex: number) => {
    const newSections = [...data.sections];
    const newItem: CVItem = {
        order: newSections[sectionIndex].items?.length ?? 0,
        isActive: true,
        isCurrent: false,
        translations: [
            { locale: "fr", title: "Nouveau Poste", subtitle: "", description: "", location: "" },
            { locale: "en", title: "New Position", subtitle: "", description: "", location: "" }
        ]
    };
    newSections[sectionIndex].items = [...(newSections[sectionIndex].items || []), newItem];
    setData({ ...data, sections: newSections });
  };

  const updateItem = (sectionIndex: number, itemIndex: number, field: keyof CVItem, value: unknown) => {
    const newSections = [...data.sections];
    const items = [...newSections[sectionIndex].items];
    
    items[itemIndex] = { ...items[itemIndex], [field]: value };
    newSections[sectionIndex].items = items;
    setData({ ...data, sections: newSections });
  };

  const updateItemTranslation = (sectionIndex: number, itemIndex: number, loc: string, field: keyof Translation, value: string) => {
    const newSections = [...data.sections];
    const items = [...newSections[sectionIndex].items];
    const translations = [...items[itemIndex].translations];
    const tIndex = translations.findIndex(t => t.locale === loc);
    
    if (tIndex >= 0) {
        translations[tIndex] = { ...translations[tIndex], [field]: value };
    } else {
        // Init if missing
        const newT: Translation = { locale: loc };
        
        newT[field] = value;
        translations.push(newT);
    }
    
    items[itemIndex].translations = translations;
    newSections[sectionIndex].items = items;
    setData({ ...data, sections: newSections });
  };
  
  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...data.sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setData({ ...data, sections: newSections });
  };
  
  const moveItem = (sectionIndex: number, itemIndex: number, direction: 'up' | 'down') => {
      const newSections = [...data.sections];
      const items = [...newSections[sectionIndex].items];
      
      if (direction === 'up' && itemIndex === 0) return;
      if (direction === 'down' && itemIndex === items.length - 1) return;

      const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      [items[itemIndex], items[targetIndex]] = [items[targetIndex], items[itemIndex]];
      
      items.forEach((item, i) => { item.order = i; });
      
      newSections[sectionIndex].items = items;
      setData({ ...data, sections: newSections });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("CV sauvegardé !");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const getT = (arr: Translation[], loc: string): Translation => arr.find(t => t.locale === loc) ?? { locale: loc };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
      {/* Editor Column - Scrollable */}
      <div className="space-y-6 overflow-y-auto pr-2 h-full">
        <Card className="bg-black border-white/10">
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 z-10 bg-black border-b border-white/10">
            <CardTitle className="text-white">Contenu</CardTitle>
            <Button onClick={handleSave} disabled={isSaving} className="bg-lime-300 text-black hover:bg-lime-400">
              <SaveIcon className="mr-2 h-4 w-4" />
              {isSaving ? "..." : "Sauvegarder"}
            </Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {data.sections.map((section, sIndex) => (
                <AccordionItem key={sIndex} value={`section-${sIndex}`} className="border border-white/10 rounded-lg px-4 bg-white/5">
                  <div className="flex items-center justify-between py-2">
                    <AccordionTrigger className="hover:no-underline py-2">
                        <span className="text-lg font-medium text-white">
                            {getT(section.translations, "fr").title || "Nouvelle Section"}
                        </span>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => moveSection(sIndex, 'up')} disabled={sIndex === 0}>
                            <ArrowUpIcon className="h-4 w-4 text-white/50" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => moveSection(sIndex, 'down')} disabled={sIndex === data.sections.length - 1}>
                            <ArrowDownIcon className="h-4 w-4 text-white/50" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => removeSection(sIndex)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                  
                  <AccordionContent className="space-y-6 pb-4">
                    {/* Section Settings */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-md">
                        <div className="space-y-2">
                            <Label className="text-white/70">Titre (FR)</Label>
                            <Input 
                                value={getT(section.translations, "fr").title ?? ""} 
                                onChange={(e) => { updateSectionTranslation(sIndex, "fr", e.target.value); }}
                                className="bg-black border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white/70">Titre (EN)</Label>
                            <Input 
                                value={getT(section.translations, "en").title ?? ""} 
                                onChange={(e) => { updateSectionTranslation(sIndex, "en", e.target.value); }}
                                className="bg-black border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white/70 uppercase">Éléments</h4>
                            <Button size="sm" variant="outline" onClick={() => { addItem(sIndex); }} className="border-white/20 text-white hover:bg-white/10">
                                <PlusIcon className="mr-2 h-3 w-3" /> Ajouter
                            </Button>
                        </div>
                        
                        {section.items?.map((item, iIndex) => (
                            <div key={iIndex} className="p-4 border border-white/10 rounded-md bg-black/40 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="grid grid-cols-2 gap-2 text-xs text-white/50 w-full pr-4">
                                        <span>Date début: <input type="date" className="bg-transparent border-none text-white" value={item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : ''} onChange={(e) => { updateItem(sIndex, iIndex, 'startDate', e.target.value); }} /></span>
                                        <span>Date fin: <input type="date" className="bg-transparent border-none text-white" value={item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ''} onChange={(e) => { updateItem(sIndex, iIndex, 'endDate', e.target.value); }} disabled={item.isCurrent} /></span>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={item.isCurrent} onChange={(e) => { updateItem(sIndex, iIndex, 'isCurrent', e.target.checked); }} />
                                            En poste
                                        </label>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { moveItem(sIndex, iIndex, 'up'); }} disabled={iIndex === 0}><ArrowUpIcon className="h-3 w-3" /></Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { moveItem(sIndex, iIndex, 'down'); }} disabled={iIndex === section.items.length - 1}><ArrowDownIcon className="h-3 w-3" /></Button>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400" onClick={() => { removeItem(sIndex, iIndex); }}><TrashIcon className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                                
                                <Tabs defaultValue="fr">
                                    <TabsList className="bg-white/10 h-8">
                                        <TabsTrigger value="fr" className="text-xs h-7">Français</TabsTrigger>
                                        <TabsTrigger value="en" className="text-xs h-7">English</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="fr" className="space-y-3">
                                        <Input placeholder="Titre / Poste" value={getT(item.translations, "fr").title ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "fr", "title", e.target.value); }} className="bg-black border-white/10 text-white h-8" />
                                        <Input placeholder="Sous-titre / Entreprise" value={getT(item.translations, "fr").subtitle ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "fr", "subtitle", e.target.value); }} className="bg-black border-white/10 text-white h-8" />
                                        <Input placeholder="Lieu" value={getT(item.translations, "fr").location ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "fr", "location", e.target.value); }} className="bg-black border-white/10 text-white h-8" />
                                        <Textarea placeholder="Description" value={getT(item.translations, "fr").description ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "fr", "description", e.target.value); }} className="bg-black border-white/10 text-white min-h-[80px]" />
                                    </TabsContent>
                                    <TabsContent value="en" className="space-y-3">
                                        <Input placeholder="Title / Position" value={getT(item.translations, "en").title ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "en", "title", e.target.value); }} className="bg-black border-white/10 text-white h-8" />
                                        <Input placeholder="Subtitle / Company" value={getT(item.translations, "en").subtitle ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "en", "subtitle", e.target.value); }} className="bg-black border-white/10 text-white h-8" />
                                        <Input placeholder="Location" value={getT(item.translations, "en").location ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "en", "location", e.target.value); }} className="bg-black border-white/10 text-white h-8" />
                                        <Textarea placeholder="Description" value={getT(item.translations, "en").description ?? ""} onChange={(e) => { updateItemTranslation(sIndex, iIndex, "en", "description", e.target.value); }} className="bg-black border-white/10 text-white min-h-[80px]" />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <Button variant="outline" className="w-full border-dashed border-white/20 hover:bg-white/5 text-white py-8" onClick={addSection}>
                <PlusIcon className="mr-2 h-4 w-4" /> Ajouter une section
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Column - Fixed/Sticky */}
      <div className="h-full sticky top-0">
        <Card className="bg-black border-white/10 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
            <CardTitle className="text-white">Prévisualisation</CardTitle>
            <Tabs value={previewLocale} onValueChange={setPreviewLocale}>
              <TabsList className="bg-white/10">
                <TabsTrigger value="fr">FR</TabsTrigger>
                <TabsTrigger value="en">EN</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-zinc-900/50 overflow-hidden relative">
            <PDFViewerClient width="100%" height="100%" className="border-none w-full h-full">
              <CVDocument data={data} locale={previewLocale} />
            </PDFViewerClient>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}