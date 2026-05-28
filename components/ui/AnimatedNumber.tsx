"use client";

import { m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  format?: (n: number) => string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  className,
  format = (n) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }),
  duration = 450,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number>();
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    setFlashKey((k) => k + 1);
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  useEffect(() => {
    fromRef.current = display;
  }, [display]);

  return (
    <m.span
      key={flashKey}
      initial={{ scale: 1.05, color: "#fb923c" }}
      animate={{ scale: 1, color: "inherit" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("inline-block tabular-nums", className)}
    >
      {format(display)}
    </m.span>
  );
}
