"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductionCompany } from "@/lib/prismaExpertiseUtils";

type ProductionCompaniesGridProps = {
  companies: ProductionCompany[];
  title: string;
  statsCompanies: string;
};

export function ProductionCompaniesGrid({
  companies,
  title,
  statsCompanies,
}: ProductionCompaniesGridProps) {
  const [selectedCompany, setSelectedCompany] =
    useState<ProductionCompany | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12"
    >
      <div className="rounded-[32px] border-4 border-white/10 bg-[#0a0a0f]/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              <span className="text-[#d5ff0a]">{title.charAt(0)}</span>
              {title.slice(1)}
            </h3>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-3xl font-black text-white">
                {companies.length}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                {statsCompanies}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {companies.map((company, index) => (
            <CompanyCard
              key={index}
              company={company}
              index={index}
              onSelect={() => {
                setSelectedCompany(company);
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setSelectedCompany(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl rounded-[24px] bg-[#0a0a0f] border-4 border-[#d5ff0a] p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setSelectedCompany(null);
              }}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-[#d5ff0a] transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Logo */}
            {selectedCompany.logo && (
              <div className="mb-6 flex items-center justify-center h-24 rounded-[16px] bg-white/5">
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
            <h3 className="mb-4 text-2xl sm:text-3xl font-bold text-[#d5ff0a]">
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
                  className="group/link flex items-start gap-2 text-sm text-[#d5ff0a] hover:text-[#e5ff4a] transition-colors"
                >
                  <ExternalLink className="flex-shrink-0 w-4 h-4 mt-0.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  <span className="underline decoration-[#d5ff0a]/30 group-hover/link:decoration-[#d5ff0a]">
                    {selectedCompany.website}
                  </span>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/** Company Card Component */
function CompanyCard({
  company,
  index,
  onSelect,
}: {
  company: ProductionCompany;
  index: number;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "0px 0px -30px 0px",
  });

  // Stagger delay based on column position (max 4 columns)
  const columnPosition = index % 4;
  const staggerDelay = columnPosition * 0.03;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className={cn(
          "group relative flex flex-col h-full overflow-hidden",
          "rounded-[20px] border-2 border-white/10 bg-white/[0.02]",
          "transition-all duration-300",
          "hover:-translate-y-1",
          "hover:border-[#d5ff0a]",
          "hover:shadow-[0_0_30px_rgba(213,255,10,0.2)]",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-28 bg-black/40 p-4">
          {company.logo && (
            <Image
              src={company.logo}
              alt={company.name}
              width={200}
              height={80}
              className="h-auto w-full max-h-20 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h4 className="mb-2 text-sm font-bold uppercase text-white group-hover:text-white">
            {company.name}
          </h4>

          {/* Description Preview */}
          {company.description && (
            <p className="mb-3 text-xs text-white/50 line-clamp-3">
              {company.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3">
            {company.description && (
              <button
                onClick={onSelect}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#d5ff0a] hover:text-[#e5ff4a] transition-colors"
              >
                <Info className="w-3 h-3" />
                <span>En savoir plus</span>
              </button>
            )}

            {company.website && (
              <Link
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-[#d5ff0a] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
