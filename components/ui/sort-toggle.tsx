"use client";

import { motion } from "framer-motion";

type SortToggleProps = {
  options: [string, string];
  value: "asc" | "desc";
  onChange: (value: "asc" | "desc") => void;
};

export function SortToggle({ options, value, onChange }: SortToggleProps) {
  const isAsc = value === "asc";

  return (
    <div className="relative inline-flex rounded-full border-2 border-white/30 bg-black/20 p-1">
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-lime-300"
        initial={false}
        animate={{
          x: isAsc ? 4 : "calc(100% + 4px)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      />

      <button
        type="button"
        onClick={() => {
          onChange("asc");
        }}
        className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
          isAsc ? "text-[#050505]" : "text-white/70 hover:text-white"
        }`}
      >
        {options[0]}
      </button>

      <button
        type="button"
        onClick={() => {
          onChange("desc");
        }}
        className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
          !isAsc ? "text-[#050505]" : "text-white/70 hover:text-white"
        }`}
      >
        {options[1]}
      </button>
    </div>
  );
}
