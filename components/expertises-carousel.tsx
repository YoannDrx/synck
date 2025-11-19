"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type ExpertiseCard = {
  id: string;
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  imgHome: string;
};

type ExpertisesCarouselProps = {
  expertises: ExpertiseCard[];
  currentSlug: string;
  locale: string;
  title?: string;
  description?: string;
};

export function ExpertisesCarousel({
  expertises,
  currentSlug,
  title = "Découvrez nos autres expertises",
  description = "Explorez l'ensemble de nos domaines d'intervention",
}: ExpertisesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out current expertise
  const otherExpertises = expertises.filter((exp) => exp.slug !== currentSlug);

  if (otherExpertises.length === 0) {
    return null;
  }

  // Number of items to show at once (responsive)
  const itemsPerPage = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  const maxIndex = Math.max(0, otherExpertises.length - itemsPerPage.desktop);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <div className="mt-20 border-4 border-white/10 bg-[#0a0a0e] p-8 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.65)]">
      {/* Header */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-4">
          <span className="bg-gradient-to-r from-lime-300 to-emerald-400 bg-clip-text text-transparent">
            {title.charAt(0)}
          </span>
          <span>{title.slice(1)}</span>
        </h2>
        {description && (
          <p className="text-lg text-white/70 max-w-2xl">{description}</p>
        )}
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`
              group flex items-center gap-2 px-4 py-2
              border-2 font-bold uppercase text-sm
              transition-all duration-200
              ${
                canGoPrev
                  ? "border-lime-300 text-lime-300 hover:bg-lime-300 hover:text-black cursor-pointer"
                  : "border-white/20 text-white/30 cursor-not-allowed"
              }
            `}
          >
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Précédent</span>
          </button>

          <div className="text-white/50 text-sm">
            {currentIndex + 1} / {maxIndex + 1}
          </div>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`
              group flex items-center gap-2 px-4 py-2
              border-2 font-bold uppercase text-sm
              transition-all duration-200
              ${
                canGoNext
                  ? "border-lime-300 text-lime-300 hover:bg-lime-300 hover:text-black cursor-pointer"
                  : "border-white/20 text-white/30 cursor-not-allowed"
              }
            `}
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="text-xl">→</span>
          </button>
        </div>

        {/* Cards Container */}
        <div className="overflow-hidden">
          <motion.div
            animate={{
              x: `-${String(currentIndex * (100 / itemsPerPage.desktop))}%`,
            }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="flex"
          >
            {otherExpertises.map((expertise) => (
              <div
                key={expertise.slug}
                className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 md:px-3"
              >
                <Link
                  href={expertise.href}
                  className="group flex flex-col h-full border-4 border-white/10 bg-black/40 overflow-hidden hover:border-lime-300 transition-all duration-300 hover:shadow-[0_0_30px_rgba(213,255,10,0.3)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
                    <Image
                      src={expertise.imgHome}
                      alt={expertise.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white mb-2 group-hover:text-lime-300 transition-colors">
                      {expertise.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/70 line-clamp-2 flex-grow">
                      {expertise.subtitle}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-lime-300 font-bold text-sm uppercase">
                      <span>En savoir plus</span>
                      <span className="group-hover:translate-x-2 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
              }}
              className={`
                h-2 rounded-full transition-all duration-300
                ${
                  index === currentIndex
                    ? "w-8 bg-lime-300"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }
              `}
              aria-label={`Aller à la page ${String(index + 1)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
