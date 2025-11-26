"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LightboxImageProps = {
  src: string;
  alt: string;
  className?: string;
  fullSrc?: string;
  width?: number;
  height?: number;
  radius?: string;
};

export function LightboxImage({
  src,
  alt,
  className,
  fullSrc,
  width = 200,
  height = 200,
  radius = "rounded-xl",
}: LightboxImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
        className={cn("group relative block focus:outline-none", className)}
        aria-label={`Agrandir ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "object-cover transition-transform group-hover:scale-[1.02]",
            radius,
          )}
        />
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => {
            setOpen(false);
          }}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] w-full md:w-auto rounded-[24px] border border-white/10 bg-[#0b0b0f]/80 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
              }}
              className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Fermer l'image"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <div className="relative max-h-[80vh]">
              <Image
                src={fullSrc ?? src}
                alt={alt}
                width={1200}
                height={1200}
                className="h-auto max-h-[75vh] w-full rounded-[16px] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
