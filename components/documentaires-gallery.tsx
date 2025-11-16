"use client";

import Image from "next/image";
import { useState } from "react";

interface Documentaire {
  title: string;
  subtitle: string;
  href: string;
  src: string;
  srcLg: string;
  link: string;
  category: string;
  height?: string;
}

interface DocumentairesGalleryProps {
  documentaires: Documentaire[];
  copy: {
    title: string;
    filterAll: string;
    empty: string;
  };
}

export function DocumentairesGallery({ documentaires, copy }: DocumentairesGalleryProps) {
  const categories = Array.from(
    new Set(documentaires.map((doc) => doc.category))
  ).filter(Boolean);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredDocs =
    selectedCategory === "all"
      ? documentaires
      : documentaires.filter((doc) => doc.category === selectedCategory);

  // Group filtered docs by category for display
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Documentaire[]>);

  return (
    <div className="mt-16">
      <div className="border-4 border-white/10 bg-[#0a0a0e] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
        <h3 className="mb-8 text-2xl font-bold uppercase tracking-tight text-lime-300">
          {copy.title}
        </h3>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
              selectedCategory === "all"
                ? "border-lime-300 bg-lime-300 text-[#050505]"
                : "border-white/30 bg-transparent text-white hover:border-lime-300 hover:text-lime-300"
            }`}
          >
            {copy.filterAll} ({documentaires.length})
          </button>
          {categories.map((category) => {
            const count = documentaires.filter((d) => d.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === category
                    ? "border-lime-300 bg-lime-300 text-[#050505]"
                    : "border-white/30 bg-transparent text-white hover:border-lime-300 hover:text-lime-300"
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Documentaires Grid by Category */}
        {Object.entries(groupedDocs).map(([category, docs]) => (
          <div key={category} className="mb-12 last:mb-0">
            <h4 className="mb-6 text-xl font-bold uppercase tracking-wide text-white/90">
              {category}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {docs.map((doc, index) => (
                <a
                  key={index}
                  href={doc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden border-4 border-white/10 bg-black/20 transition-all hover:border-lime-300 hover:scale-105"
                >
                  {doc.srcLg && (
                    <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                    <Image
                      src={doc.srcLg}
                      alt={doc.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                    </div>
                  )}
                  <div className="p-3">
                    <h5 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-lime-300 transition-colors">
                      {doc.title}
                    </h5>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredDocs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-white/50">{copy.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}
