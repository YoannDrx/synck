"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Info, X } from "lucide-react";
import type { ProductionCompany } from "@/lib/prismaExpertiseUtils";

type ProductionCompaniesGridProps = {
  companies: ProductionCompany[];
  title: string;
};

export function ProductionCompaniesGrid({
  companies,
  title,
}: ProductionCompaniesGridProps) {
  const [selectedCompany, setSelectedCompany] =
    useState<ProductionCompany | null>(null);

  return (
    <div className="mt-16">
      <div className="border-4 border-white/10 bg-[#0a0a0e] p-6 sm:p-8 lg:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
        <h3 className="mb-8 sm:mb-12 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-lime-300">
          {title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {companies.map((company, index) => (
            <div
              key={index}
              className="group relative border-2 border-white/10 bg-black/40 p-6 transition-all duration-300 hover:border-lime-300 hover:shadow-[0_0_30px_rgba(213,255,10,0.3)] hover:scale-[1.02]"
            >
              {/* Logo */}
              <div className="mb-6 flex items-center justify-center h-24 bg-black/40">
                {company.logo && (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={200}
                    height={80}
                    className="h-auto w-full max-h-20 object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </div>

              {/* Name */}
              <h4 className="mb-4 text-xl font-bold uppercase text-white">
                {company.name}
              </h4>

              {/* Description Preview */}
              {company.description && (
                <>
                  <p className="mb-3 text-sm text-white/70 line-clamp-4">
                    {company.description}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                    }}
                    className="mb-6 flex items-center gap-2 text-sm text-lime-300 hover:text-lime-200 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span className="underline">En savoir plus</span>
                  </button>
                </>
              )}

              {/* Website Link */}
              {company.website && (
                <div className="pt-4 border-t border-white/10">
                  <Link
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-start gap-2 text-sm text-lime-300 hover:text-lime-200 transition-colors"
                  >
                    <ExternalLink className="flex-shrink-0 w-4 h-4 mt-0.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    <span className="underline decoration-lime-300/30 group-hover/link:decoration-lime-300">
                      Site web
                    </span>
                  </Link>
                </div>
              )}

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-lime-300/0 group-hover:border-lime-300 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-lime-300/0 group-hover:border-lime-300 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setSelectedCompany(null);
          }}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0a0a0e] border-4 border-lime-300 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setSelectedCompany(null);
              }}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-lime-300 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Logo */}
            {selectedCompany.logo && (
              <div className="mb-6 flex items-center justify-center h-24 bg-black/40">
                <Image
                  src={selectedCompany.logo}
                  alt={selectedCompany.name}
                  width={200}
                  height={80}
                  className="h-auto w-full max-h-20 object-contain p-2"
                />
              </div>
            )}

            {/* Title */}
            <h3 className="mb-4 text-2xl sm:text-3xl font-bold uppercase text-lime-300">
              {selectedCompany.name}
            </h3>

            {/* Full Description */}
            <p className="mb-6 text-base text-white/80 leading-relaxed">
              {selectedCompany.description}
            </p>

            {/* Website Link */}
            {selectedCompany.website && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold uppercase text-white/70 mb-3">
                  Site web :
                </h4>
                <Link
                  href={selectedCompany.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-start gap-2 text-sm text-lime-300 hover:text-lime-200 transition-colors"
                >
                  <ExternalLink className="flex-shrink-0 w-4 h-4 mt-0.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  <span className="underline decoration-lime-300/30 group-hover/link:decoration-lime-300">
                    {selectedCompany.website}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
