"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LightboxImageProps {
  src: string;
  alt: string;
  className?: string;
  fullSrc?: string;
  width?: number;
  height?: number;
  radius?: string;
}

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
        onClick={() => setOpen(true)}
        className={cn("group relative block focus:outline-none", className)}
        aria-label={`Agrandir ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn("object-cover transition-transform group-hover:scale-[1.02]", radius)}
        />
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 rounded-full border border-white/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
          >
            Fermer
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={fullSrc || src}
              alt={alt}
              width={1200}
              height={1200}
              className="h-auto w-full rounded-3xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

