"use client";

import { useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export type ParallaxSectionProps = {
  content: string;
  image?: string | null;
  imagePosition?: "left" | "right" | "auto";
  index: number;
  isLast?: boolean;
  accentColor?: "lime" | "cyan" | "purple" | "orange";
};

/** Accent color configurations */
const accentColors = {
  lime: {
    heading: "text-[#d5ff0a]",
    bullet: "text-[#d5ff0a]",
    blockquote: "bg-[#d5ff0a]",
  },
  cyan: {
    heading: "text-[#00d9ff]",
    bullet: "text-[#00d9ff]",
    blockquote: "bg-[#00d9ff]",
  },
  purple: {
    heading: "text-[#a855f7]",
    bullet: "text-[#a855f7]",
    blockquote: "bg-[#a855f7]",
  },
  orange: {
    heading: "text-[#ff6b35]",
    bullet: "text-[#ff6b35]",
    blockquote: "bg-[#ff6b35]",
  },
};

export function ParallaxSection({
  content,
  image,
  imagePosition = "auto",
  index,
  isLast = false,
  accentColor = "lime",
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Parallax effect for image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.95, 1.02, 0.95],
  );

  // Determine actual position
  const position =
    imagePosition === "auto"
      ? index % 2 === 0
        ? "right"
        : "left"
      : imagePosition;

  const isImageLeft = position === "left";
  const colors = accentColors[accentColor];

  // Animation variants
  const contentVariants = {
    hidden: {
      opacity: 0,
      x: isImageLeft ? 30 : -30,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  } as const;

  const imageVariants = {
    hidden: {
      opacity: 0,
      x: isImageLeft ? -50 : 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  } as const;

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn("relative", isLast ? "" : "mb-16 md:mb-20 lg:mb-24")}
    >
      <div
        className={cn(
          "flex flex-col gap-8",
          image && "lg:flex-row lg:items-start lg:gap-12",
          isImageLeft && image && "lg:flex-row-reverse",
        )}
      >
        {/* Content */}
        <motion.div
          variants={contentVariants}
          className={cn("flex-1", image && "lg:max-w-[55%]")}
        >
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h3: ({ children }) => (
                  <h3 className="mb-6 text-2xl font-bold uppercase tracking-tight text-white md:text-3xl lg:text-4xl">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4
                    className={cn(
                      "mb-4 text-xl font-bold uppercase md:text-2xl",
                      colors.heading,
                    )}
                  >
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="mb-6 text-base leading-relaxed text-gray-300 md:text-lg">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-6 list-none space-y-3">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-3 text-base text-gray-300 md:text-lg">
                    <span className={cn("shrink-0 font-bold", colors.bullet)}>
                      &rarr;
                    </span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-white">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-6 flex items-start gap-4">
                    <span
                      className={cn(
                        "w-1 shrink-0 self-stretch",
                        colors.blockquote,
                      )}
                    />
                    <span className="flex-1 italic text-gray-400">
                      {children}
                    </span>
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Parallax Image */}
        {image && (
          <motion.div
            variants={imageVariants}
            className="relative lg:w-[40%] lg:sticky lg:top-32"
          >
            <motion.div
              style={{
                y: imageY,
                scale: imageScale,
              }}
              className="relative overflow-hidden rounded-[20px] border-4 border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
            >
              <Image
                src={image}
                alt="Illustration"
                width={600}
                height={450}
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />

              {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/30 to-transparent" />
            </motion.div>

            {/* Glow effect */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] bg-[#d5ff0a]/5 blur-2xl" />
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

/** Simple section without image - just animated content */
export function ContentSection({
  content,
  index,
  isLast = false,
  accentColor = "lime",
}: {
  content: string;
  index: number;
  isLast?: boolean;
  accentColor?: "lime" | "cyan" | "purple" | "orange";
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const colors = accentColors[accentColor];

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn("relative", isLast ? "" : "mb-16 md:mb-20 lg:mb-24")}
    >
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="mb-6 text-2xl font-bold uppercase tracking-tight text-white md:text-3xl lg:text-4xl">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4
                className={cn(
                  "mb-4 text-xl font-bold uppercase md:text-2xl",
                  colors.heading,
                )}
              >
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="mb-6 text-base leading-relaxed text-gray-300 md:text-lg">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-6 list-none space-y-3">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-3 text-base text-gray-300 md:text-lg">
                <span className={cn("shrink-0 font-bold", colors.bullet)}>
                  &rarr;
                </span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-white">{children}</strong>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-6 flex items-start gap-4">
                <span
                  className={cn("w-1 shrink-0 self-stretch", colors.blockquote)}
                />
                <span className="flex-1 italic text-gray-400">{children}</span>
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.section>
  );
}
