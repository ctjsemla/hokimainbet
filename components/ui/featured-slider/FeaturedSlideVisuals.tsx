"use client";

import { m } from "framer-motion";

export function SheriffStar() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="absolute right-4 top-4 h-14 w-14 opacity-90"
      aria-hidden
    >
      <path
        d="M32 4 L38 24 L58 24 L42 36 L48 56 L32 44 L16 56 L22 36 L6 24 L26 24 Z"
        fill="#d4a017"
        stroke="#f59e0b"
        strokeWidth="1"
      />
    </svg>
  );
}

export function CrashLineVisual() {
  return (
    <svg
      viewBox="0 0 160 80"
      className="absolute bottom-6 right-4 h-20 w-40 opacity-80"
      aria-hidden
    >
      <m.path
        d="M8 72 L28 58 L48 62 L68 40 L88 44 L108 22 L128 18 L148 8"
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />
      <m.g style={{ transformOrigin: "148px 8px" }} transform="translate(148, 8)">
        <m.circle
          r="4"
          fill="#f97316"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </m.g>
    </svg>
  );
}

export function CandyVisual() {
  const gems = [
    { top: "12%", left: "68%", size: 28, color: "#e879f9" },
    { top: "35%", left: "78%", size: 20, color: "#f472b6" },
    { top: "55%", left: "65%", size: 24, color: "#22c55e" },
    { top: "22%", left: "82%", size: 16, color: "#fb923c" },
    { top: "48%", left: "88%", size: 22, color: "#e879f9" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {gems.map((gem, i) => (
        <m.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: gem.top,
            left: gem.left,
            width: gem.size,
            height: gem.size,
            backgroundColor: gem.color,
            opacity: 0.75,
          }}
          animate={{ y: [0, -6, 0], scale: [1, 1.08, 1] }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function LightningVisual() {
  return (
    <m.svg
      viewBox="0 0 80 100"
      className="absolute bottom-4 right-6 h-24 w-20"
      aria-hidden
      animate={{
        filter: [
          "drop-shadow(0 0 8px rgba(245,158,11,0.4))",
          "drop-shadow(0 0 20px rgba(245,158,11,0.8))",
          "drop-shadow(0 0 8px rgba(245,158,11,0.4))",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <path
        d="M44 4 L20 52 H36 L28 96 L60 40 H44 Z"
        fill="#f59e0b"
        stroke="#fb923c"
        strokeWidth="1"
      />
    </m.svg>
  );
}

export function PlinkoPegsVisual() {
  const rows = [3, 4, 5, 4, 3];
  return (
    <svg
      viewBox="0 0 100 90"
      className="absolute bottom-4 right-4 h-24 w-28 opacity-90"
      aria-hidden
    >
      {rows.map((count, row) =>
        Array.from({ length: count }).map((_, col) => {
          const x = 50 + (col - (count - 1) / 2) * 14;
          const y = 12 + row * 14;
          return (
            <circle
              key={`${row}-${col}`}
              cx={x}
              cy={y}
              r="3"
              fill="#22d3ee"
              opacity={0.85}
            />
          );
        }),
      )}
      <circle cx="50" cy="82" r="5" fill="#f97316" opacity={0.9} />
    </svg>
  );
}
