"use client";

import { motion } from "framer-motion";

type ToggleSwitchProps<T extends string> = {
  options: [{ value: T; label: string }, { value: T; label: string }];
  value: T;
  onChange: (value: T) => void;
};

export function ToggleSwitch<T extends string>({
  options,
  value,
  onChange,
}: ToggleSwitchProps<T>) {
  const isFirstOption = value === options[0].value;

  return (
    <div className="relative inline-flex overflow-hidden rounded-full border-2 border-white/30 bg-black/50 p-1">
      {/* Indicateur opaque qui slide */}
      <motion.div
        className="absolute inset-y-1 left-1 w-[calc(50%-5px)] rounded-full bg-lime-300"
        initial={false}
        animate={{
          x: isFirstOption ? 0 : "calc(100% + 2px)",
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
          onChange(options[0].value);
        }}
        className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
          isFirstOption ? "text-[#050505]" : "text-white/20"
        }`}
      >
        {options[0].label}
      </button>

      <button
        type="button"
        onClick={() => {
          onChange(options[1].value);
        }}
        className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
          !isFirstOption ? "text-[#050505]" : "text-white/20"
        }`}
      >
        {options[1].label}
      </button>
    </div>
  );
}
