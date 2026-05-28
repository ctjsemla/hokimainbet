"use client";

import { AnimatePresence, m } from "framer-motion";
import { cn } from "@/lib/utils";

function pillClass(multiplier: number): string {
  if (multiplier < 2) {
    return "border border-red-500/30 bg-red-500/10 text-red-400";
  }
  if (multiplier < 5) {
    return "border border-orange-500/30 bg-orange-500/10 text-orange-400";
  }
  if (multiplier < 10) {
    return "border border-orange-500/25 bg-orange-500/20 text-orange-300";
  }
  return "border border-orange-400/30 bg-orange-400/15 text-orange-300 animate-pulse";
}

interface CrashHistoryPillsProps {
  history: number[];
  formatMultiplier: (value: number) => string;
  label: string;
}

export function CrashHistoryPills({
  history,
  formatMultiplier,
  label,
}: CrashHistoryPillsProps) {
  if (history.length === 0) return null;

  const visible = history.slice(0, 20);

  return (
    <div className="mb-4 border-b border-navy-800/80 pb-3">
      <p className="mb-2 font-sans text-[10px] uppercase tracking-wider text-[#94a3b8]">
        {label}
      </p>
      <div className="relative overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((point, i) => (
              <m.span
                key={`${point}-${i}`}
                layout
                initial={{ opacity: 0, x: 48, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 font-display text-sm tracking-wide",
                  pillClass(point),
                )}
              >
                {formatMultiplier(point)}
              </m.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
