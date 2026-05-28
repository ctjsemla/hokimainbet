"use client";

import { m } from "framer-motion";

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  distance: 60 + (i % 6) * 28,
  size: 5 + (i % 4) * 2,
  delay: (i % 8) * 0.02,
}));

interface WheelConfettiProps {
  active: boolean;
}

export function WheelConfetti({ active }: WheelConfettiProps) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      aria-hidden
    >
      {PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <m.span
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 0, x, y, scale: 1.2 }}
            transition={{
              duration: 0.85,
              delay: p.delay,
              ease: "easeOut",
            }}
            className="absolute rounded-sm bg-orange-500"
            style={{
              width: p.size,
              height: p.size,
              boxShadow: "0 0 6px rgba(249, 115, 22, 0.8)",
            }}
          />
        );
      })}
    </div>
  );
}
