"use client";

import { m } from "framer-motion";

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  angle: (i / 16) * 360,
  distance: 40 + (i % 5) * 18,
  size: 4 + (i % 3) * 2,
  delay: (i % 4) * 0.02,
}));

export function CrashExplosion() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <m.div
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="absolute h-24 w-24 rounded-full bg-[#ef4444]/40 blur-xl"
      />
      {PARTICLES.map((p) => (
        <m.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.5, delay: p.delay, ease: "easeOut" }}
          className="absolute rounded-full bg-[#ef4444]"
          style={{ width: p.size, height: p.size }}
        />
      ))}
      {PARTICLES.slice(0, 8).map((p) => (
        <m.span
          key={`o-${p.id}`}
          initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * (p.distance * 0.6),
            y: Math.sin((p.angle * Math.PI) / 180) * (p.distance * 0.6),
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.4, delay: p.delay, ease: "easeOut" }}
          className="absolute rounded-full bg-orange-500"
          style={{ width: p.size - 1, height: p.size - 1 }}
        />
      ))}
    </div>
  );
}
