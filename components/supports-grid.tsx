"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Info, X } from "lucide-react";
import type { Support } from "@/lib/prismaExpertiseUtils";

type SupportsGridProps = {
  supports: Support[];
  title: string;
};

export function SupportsGrid({ supports, title }: SupportsGridProps) {
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);

  return (
    <div className="mt-16">
      <div className="border-4 border-white/10 bg-[#0a0a0e] p-6 sm:p-8 lg:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
        <h3 className="mb-8 sm:mb-12 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-lime-300">
          {title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {supports.map((support, index) => (
            <div
              key={index}
              className="group relative border-2 border-white/10 bg-black/40 p-6 transition-all duration-300 hover:border-lime-300 hover:shadow-[0_0_30px_rgba(213,255,10,0.3)] hover:scale-[1.02]"
            >
              {/* Logo */}
              <div className="mb-6 flex items-center justify-center h-24 bg-black/40">
                {support.logo && (
                  <Image
                    src={support.logo}
                    alt={support.name}
                    width={200}
                    height={80}
                    className="h-auto w-full max-h-20 object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </div>

              {/* Name */}
              <h4 className="mb-4 text-xl font-bold uppercase text-white">
                {support.name}
              </h4>

              {/* Description */}
              {support.description && (
                <>
                  <p className="mb-3 text-sm text-white/70 line-clamp-4">
                    {support.description}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSupport(support);
                    }}
                    className="mb-6 flex items-center gap-2 text-sm text-lime-300 hover:text-lime-200 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span className="underline">En savoir plus</span>
                  </button>
                </>
              )}

              {/* Links */}
              {support.links && support.links.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  {support.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-start gap-2 text-sm text-lime-300 hover:text-lime-200 transition-colors"
                    >
                      <ExternalLink className="flex-shrink-0 w-4 h-4 mt-0.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      <span className="underline decoration-lime-300/30 group-hover/link:decoration-lime-300">
                        {link.title}
                      </span>
                    </Link>
                  ))}
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
      {selectedSupport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => { setSelectedSupport(null); }}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0a0a0e] border-4 border-lime-300 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => { e.stopPropagation(); }}
          >
            {/* Close button */}
            <button
              onClick={() => { setSelectedSupport(null); }}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-lime-300 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Logo */}
            {selectedSupport.logo && (
              <div className="mb-6 flex items-center justify-center h-24 bg-black/40">
                <Image
                  src={selectedSupport.logo}
                  alt={selectedSupport.name}
                  width={200}
                  height={80}
                  className="h-auto w-full max-h-20 object-contain p-2"
                />
              </div>
            )}

            {/* Title */}
            <h3 className="mb-4 text-2xl sm:text-3xl font-bold uppercase text-lime-300">
              {selectedSupport.name}
            </h3>

            {/* Full Description */}
            <p className="mb-6 text-base text-white/80 leading-relaxed">
              {selectedSupport.description}
            </p>

            {/* Links */}
            {selectedSupport.links && selectedSupport.links.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold uppercase text-white/70">
                  Liens utiles :
                </h4>
                {selectedSupport.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-start gap-2 text-sm text-lime-300 hover:text-lime-200 transition-colors"
                  >
                    <ExternalLink className="flex-shrink-0 w-4 h-4 mt-0.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    <span className="underline decoration-lime-300/30 group-hover/link:decoration-lime-300">
                      {link.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
