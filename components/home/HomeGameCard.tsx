"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type HomeGameKey =
  | "crash"
  | "dice"
  | "mines"
  | "plinko"
  | "wheel"
  | "keno";

const GAME_HREFS: Record<HomeGameKey, string> = {
  crash: "/games/crash",
  dice: "/games/dice",
  mines: "/games/mines",
  plinko: "/games/plinko",
  wheel: "/games/wheel",
  keno: "/games/keno",
};

export type HomeGameCardLayout = "hero" | "split" | "half";

interface HomeGameCardProps {
  game: HomeGameKey;
  title: string;
  description: string;
  playLabel: string;
  layout: HomeGameCardLayout;
  visual: ReactNode;
  className?: string;
}

const CARD_BASE =
  "group relative block overflow-hidden rounded-2xl border border-navy-700 bg-navy-800 p-8 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:border-orange-500/40 hover:bg-navy-700/60";

const TITLE_HERO = "font-display text-[56px] leading-[0.92] tracking-[0.04em] text-white";
const TITLE_HALF = "font-display text-[44px] leading-[0.95] tracking-[0.04em] text-white";

export function HomeGameCard({
  game,
  title,
  description,
  playLabel,
  layout,
  visual,
  className,
}: HomeGameCardProps) {
  const isHero = layout === "hero";
  const isSplit = layout === "hero" || layout === "split";
  const height =
    layout === "hero" ? "h-[280px]" : layout === "split" ? "h-[200px]" : "h-[220px]";

  return (
    <Link href={GAME_HREFS[game]} className={cn(CARD_BASE, height, className)}>
      {isSplit ? (
        <div className="flex h-full flex-col md:flex-row">
          <div className="relative z-10 flex w-full flex-col justify-end md:w-1/2 md:pr-6">
            <h3 className={isHero ? TITLE_HERO : TITLE_HALF}>{title}</h3>
            <p className="mt-3 line-clamp-2 max-w-md font-sans text-[15px] leading-relaxed text-[#cbd5e1]">
              {description}
            </p>
            <span className="mt-6 flex w-full items-center justify-center rounded-lg bg-orange-500 py-3 font-display text-lg uppercase tracking-[0.1em] text-white transition-all duration-300 group-hover:brightness-110">
              {playLabel}
            </span>
          </div>
          <div className="relative mt-6 h-[140px] w-full shrink-0 md:mt-0 md:h-full md:w-1/2">
            {visual}
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="relative z-10 flex flex-1 flex-col justify-end md:max-w-[48%]">
            <h3 className={TITLE_HALF}>{title}</h3>
            <p className="mt-3 line-clamp-2 font-sans text-[15px] leading-relaxed text-[#cbd5e1]">
              {description}
            </p>
            <span className="mt-6 flex w-full items-center justify-center rounded-lg bg-orange-500 py-3 font-display text-lg uppercase tracking-[0.1em] text-white transition-all duration-300 group-hover:brightness-110 md:max-w-none">
              {playLabel}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {visual}
          </div>
        </div>
      )}
    </Link>
  );
}
