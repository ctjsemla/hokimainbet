"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { SlotCoverArt } from "@/components/slots/SlotCoverArt";
import type { SlotGame } from "@/types/slots.types";
import { cn } from "@/lib/utils";

interface SlotCardProps {
  slot: SlotGame;
  onPlay: (slot: SlotGame) => void;
  compact?: boolean;
  index?: number;
}

function VolatilityDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Volatility ${level}`}>
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={cn(
            "text-[10px] leading-none",
            dot <= level ? "text-orange-500" : "text-navy-700",
          )}
        >
          {dot <= level ? "●" : "○"}
        </span>
      ))}
    </span>
  );
}

export function SlotCard({ slot, onPlay, compact = false, index = 0 }: SlotCardProps) {
  const t = useTranslations("slots");

  return (
    <m.article
      initial={{ opacity: 0, y: 24, scale: slot.featured ? 0.95 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        type: slot.featured ? "spring" : "tween",
        stiffness: slot.featured ? 260 : undefined,
      }}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-xl border border-transparent transition-[transform,border-color] duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 hover:border-orange-500/40",
        compact && "min-w-[240px] shrink-0 md:min-w-0",
      )}
      onClick={() => onPlay(slot)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPlay(slot);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-t-xl bg-navy-950 transition-transform duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105",
          compact ? "h-[160px]" : "h-[200px]",
        )}
      >
        <SlotCoverArt slotId={slot.id} />
      </div>

      <div className={cn("rounded-b-xl bg-navy-800", compact ? "p-3" : "p-4")}>
        <p className="text-xs uppercase tracking-wide text-[#94a3b8]">{slot.provider}</p>
        <h3
          className={cn(
            "font-display leading-tight text-white",
            compact ? "text-lg" : "text-[22px]",
          )}
        >
          {slot.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-[#cbd5e1]">
            {t("rtp")} {slot.rtp}%
          </span>
          <VolatilityDots level={slot.volatility} />
          <span className="text-[#4ade80]">
            {t("maxWin")} {slot.maxWin}
          </span>
        </div>

        <button
          type="button"
          className={cn(
            "mt-3 w-full rounded-lg bg-orange-500 font-display uppercase tracking-wide text-white transition hover:scale-[1.01] hover:brightness-110",
            compact ? "py-2 text-sm" : "py-2.5 text-base",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onPlay(slot);
          }}
        >
          {t("playDemo")}
        </button>
      </div>
    </m.article>
  );
}
