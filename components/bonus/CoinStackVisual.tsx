"use client";

import { m } from "framer-motion";

export function CoinStackVisual() {
  return (
    <div className="relative flex h-full min-h-[140px] items-center justify-center md:min-h-0">
      <m.span
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none font-display text-[7rem] leading-none text-navy-700 md:text-[9rem]"
        aria-hidden
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        1000
      </m.span>
      <svg
        viewBox="0 0 120 120"
        className="relative z-10 h-28 w-28 md:h-36 md:w-36"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <m.g
            key={i}
            animate={{ y: [8, 0, 8] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          >
            <ellipse
              cx="60"
              cy={72 - i * 14}
              rx={42 - i * 4}
              ry={14 - i * 2}
              fill="#1a3360"
              stroke="#f97316"
              strokeWidth="2"
            />
          </m.g>
        ))}
        <m.text
          x="60"
          y="48"
          textAnchor="middle"
          className="fill-orange-500 font-display text-[22px]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ₿
        </m.text>
      </svg>
    </div>
  );
}
