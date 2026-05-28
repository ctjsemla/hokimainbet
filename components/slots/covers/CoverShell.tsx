"use client";

import { useId, type ReactNode } from "react";
import { MaxWinBadge } from "@/components/slots/covers/MaxWinBadge";
import { cn } from "@/lib/utils";

interface CoverShellProps {
  background: string;
  maxWin: string;
  maxWinClassName?: string;
  featured?: boolean;
  localBadge?: string;
  ambientGlow?: string;
  className?: string;
  children: ReactNode;
}

export function CoverShell({
  background,
  maxWin,
  maxWinClassName,
  featured = false,
  localBadge,
  ambientGlow,
  className,
  children,
}: CoverShellProps) {
  const grainId = useId().replace(/:/g, "");

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-navy-950",
        featured && "slot-gatot-premium-frame",
        className,
      )}
      style={{ background }}
    >
      {ambientGlow && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: ambientGlow }}
          aria-hidden
        />
      )}

      <div className="relative z-[2] h-full w-full">{children}</div>

      <svg
        className="pointer-events-none absolute inset-0 z-[6] h-full w-full opacity-[0.12] mix-blend-overlay"
        aria-hidden
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`grain-${grainId}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
            <feComponentTransfer in="mono">
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#grain-${grainId})`} />
      </svg>

      {localBadge && (
        <span className="absolute left-2 top-2 z-[8] rounded bg-[#f59e0b] px-1.5 py-0.5 font-display text-[10px] leading-none text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]">
          {localBadge}
        </span>
      )}

      <MaxWinBadge value={maxWin} className={cn("z-[8]", maxWinClassName)} />

      {featured && (
        <div
          className="slot-gatot-shimmer pointer-events-none absolute inset-0 z-[7] rounded-t-xl"
          aria-hidden
        />
      )}
    </div>
  );
}
