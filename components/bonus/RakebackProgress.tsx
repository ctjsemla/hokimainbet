"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";

interface RakebackProgressProps {
  label: string;
  percent: number;
}

export function RakebackProgress({ label, percent }: RakebackProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="mt-6 max-w-xl">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-[#94a3b8]">{label}</span>
        <span className="font-display text-xl text-orange-400">{percent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-navy-950">
        <m.div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
          initial={{ width: 0 }}
          animate={{ width: inView ? `${percent}%` : 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}
