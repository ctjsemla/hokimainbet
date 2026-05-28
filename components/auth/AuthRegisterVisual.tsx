"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useLiveTicker } from "@/hooks/useLiveTicker";

interface PreviewCard {
  game: string;
  tick: () => string;
  initial: string;
  className: string;
  delay: number;
}

const CARDS: PreviewCard[] = [
  {
    game: "Crash",
    tick: () => `${(1.2 + Math.random() * 8).toFixed(2)}x`,
    initial: "2.41x",
    className: "left-0 top-2 z-40 -rotate-6",
    delay: 0,
  },
  {
    game: "Dice",
    tick: () => `${Math.round(45 + Math.random() * 54)}`,
    initial: "84",
    className: "left-[88px] top-[72px] z-30 rotate-2",
    delay: 0.12,
  },
  {
    game: "Mines",
    tick: () => `${(1.5 + Math.random() * 5).toFixed(1)}x`,
    initial: "3.2x",
    className: "left-4 top-[148px] z-20 rotate-[8deg]",
    delay: 0.24,
  },
  {
    game: "Plinko",
    tick: () => `${Math.round(5 + Math.random() * 80)}x`,
    initial: "42x",
    className: "left-[100px] top-[28px] z-[25] -rotate-2",
    delay: 0.36,
  },
];

function GamePreviewCard({ game, tick, initial, className, delay }: PreviewCard) {
  const value = useLiveTicker(tick, 1500, initial);

  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 0.4, delay },
        y: { duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`absolute min-w-[160px] rounded-lg border border-navy-700 bg-navy-800/95 px-5 py-4 shadow-xl backdrop-blur-sm ${className}`}
    >
      <p className="font-sans text-xs uppercase tracking-wider text-[#94a3b8]">
        {game}
      </p>
      <p className="mt-1.5 font-display text-3xl tracking-wide text-orange-500">
        {value}
      </p>
    </m.div>
  );
}

export function AuthRegisterVisual() {
  const t = useTranslations("auth.register");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="auth-panel-visual relative hidden min-h-screen overflow-hidden bg-navy-900 lg:flex lg:items-center lg:justify-center">
      <div className="auth-panel-bg" aria-hidden />
      <div className="auth-panel-dots" aria-hidden />

      <div className="relative z-10 flex w-full items-center justify-center px-10 py-16">
        <div className="relative h-[340px] w-full max-w-lg">
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
            aria-hidden
          >
            <span className="font-display text-[120px] leading-none text-navy-700 opacity-[0.12]">
              1000
            </span>
            <span className="-mt-1 font-display text-2xl tracking-[0.14em] text-navy-700 opacity-[0.12]">
              {t("bonusLabel")}
            </span>
          </div>

          {mounted &&
            CARDS.map((card) => (
              <GamePreviewCard key={card.game} {...card} />
            ))}
        </div>
      </div>
    </div>
  );
}
