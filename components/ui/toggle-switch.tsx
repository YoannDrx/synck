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
    <div className="relative inline-flex rounded-full border-2 border-white/30 bg-black/20 p-1">
      <motion.div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-lime-300"
        initial={false}
        animate={{
          x: isFirstOption ? 4 : "calc(100% + 4px)",
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
        className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
          isFirstOption ? "text-[#050505]" : "text-white/70 hover:text-white"
        }`}
      >
        {options[0].label}
      </button>

      <button
        type="button"
        onClick={() => {
          onChange(options[1].value);
        }}
        className={`relative z-10 px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
          !isFirstOption ? "text-[#050505]" : "text-white/70 hover:text-white"
        }`}
      >
        {options[1].label}
      </button>
    </div>
  );
}
