"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveMultiplierBadgeProps {
  value: string;
}

export function LiveMultiplierBadge({ value }: LiveMultiplierBadgeProps) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const id = setTimeout(() => setFlash(false), 200);
    return () => clearTimeout(id);
  }, [value]);

  return (
    <span
      className={cn(
        "ml-auto shrink-0 rounded bg-navy-700 px-2 py-0.5 text-xs font-medium tabular-nums text-orange-400 transition-shadow duration-150",
        flash && "shadow-[0_0_12px_rgba(249,115,22,0.55)]",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-block"
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
