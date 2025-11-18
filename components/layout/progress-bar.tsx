"use client";

type ProgressBarProps = {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed left-0 top-0 z-30 h-1 w-full bg-white/10">
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-lime-300 via-fuchsia-400 to-sky-400 transition-[width] duration-300"
        style={{ width: `${String(progress)}%` }}
      />
    </div>
  );
}
