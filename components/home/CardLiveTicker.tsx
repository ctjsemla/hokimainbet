"use client";

import { AnimatePresence, m } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardLiveTickerProps {
  value: string;
  flash?: boolean;
  className?: string;
  size?: "md" | "lg";
}

export function CardLiveTicker({
  value,
  flash,
  className,
  size = "md",
}: CardLiveTickerProps) {
  return (
    <div className={cn("absolute right-6 top-6 z-20", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={cn(
            "font-display leading-none tracking-wide text-orange-400 drop-shadow-[0_0_14px_rgba(249,115,22,0.45)]",
            size === "lg" ? "text-[32px]" : "text-[26px]",
            flash && "animate-pulse",
          )}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </div>
  );
}
