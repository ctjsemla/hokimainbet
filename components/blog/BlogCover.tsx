"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types/blog.types";

interface BlogCoverProps {
  category: BlogCategory;
  title: string;
  readTime: string;
  size?: "default" | "sm";
  className?: string;
}

const COVER_BADGE_KEYS: Record<BlogCategory, string> = {
  Guide: "Guide",
  Strategy: "Strategy",
  Crypto: "Crypto",
  Sports: "Sports",
  News: "News",
};

function GuideArt() {
  return (
    <>
      <rect width="400" height="225" fill="#060d1f" />
      <line
        x1="24"
        y1="22"
        x2="64"
        y2="22"
        stroke="#f97316"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g opacity={0.15} stroke="#f97316" strokeWidth="1">
        <line x1="200" y1="72" x2="200" y2="2" />
        <line x1="200" y1="72" x2="278" y2="17" />
        <line x1="200" y1="72" x2="290" y2="72" />
        <line x1="200" y1="72" x2="278" y2="127" />
        <line x1="200" y1="72" x2="200" y2="142" />
        <line x1="200" y1="72" x2="122" y2="127" />
        <line x1="200" y1="72" x2="110" y2="72" />
        <line x1="200" y1="72" x2="122" y2="17" />
        <line x1="200" y1="72" x2="245" y2="27" />
        <line x1="200" y1="72" x2="278" y2="97" />
        <line x1="200" y1="72" x2="155" y2="27" />
        <line x1="200" y1="72" x2="122" y2="97" />
      </g>
      <circle cx="200" cy="72" r="44" fill="none" stroke="#f97316" strokeWidth="2" opacity={0.35} />
      <circle cx="200" cy="72" r="28" fill="none" stroke="#f97316" strokeWidth="1.5" opacity={0.5} />
      <path
        d="M200 48 L206 68 L228 68 L210 80 L216 100 L200 88 L184 100 L190 80 L172 68 L194 68 Z"
        fill="#f97316"
      />
    </>
  );
}

function StrategyArt({ glowId }: { glowId: string }) {
  return (
    <>
      <rect width="400" height="225" fill="#0a0f1e" />
      <polygon points="0,0 150,0 0,225" fill="#0f2040" opacity={0.9} />
      <g fill="#94a3b8" opacity={0.12}>
        {Array.from({ length: 7 }).map((_, row) =>
          Array.from({ length: 12 }).map((_, col) => (
            <circle key={`${row}-${col}`} cx={24 + col * 32} cy={20 + row * 28} r={1.2} />
          )),
        )}
      </g>
      <g filter={`url(#${glowId})`}>
        <path
          d="M300 165 L300 55 L355 55 L355 85 L325 115 L325 165 Z"
          fill="#f97316"
          opacity={0.92}
        />
        <path
          d="M312 165 L312 108 L338 82 L368 82"
          fill="none"
          stroke="#fb923c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}

function CryptoArt() {
  return (
    <>
      <rect width="400" height="225" fill="#060d1f" />
      <g opacity={0.2} stroke="#0f2040" strokeWidth="1.5" fill="none">
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => {
            const x = 40 + col * 56;
            const y = 20 + row * 48;
            return (
              <polygon
                key={`${row}-${col}`}
                points={`${x},${y + 12} ${x + 14},${y} ${x + 28},${y + 12} ${x + 28},${y + 36} ${x + 14},${y + 48} ${x},${y + 36}`}
              />
            );
          }),
        )}
      </g>
      <g opacity={0.07} stroke="#ffffff" strokeWidth="0.5">
        {Array.from({ length: 32 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 7} x2="400" y2={i * 7} />
        ))}
      </g>
      <text
        x="200"
        y="98"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#f97316"
        fontSize="76"
        fontFamily="var(--font-bebas), sans-serif"
      >
        ₿
      </text>
    </>
  );
}

function SportsArt() {
  return (
    <>
      <rect width="400" height="225" fill="#050d1a" />
      <ellipse
        cx="200"
        cy="82"
        rx="128"
        ry="50"
        fill="none"
        stroke="#1a3360"
        strokeWidth="3"
      />
      <ellipse
        cx="200"
        cy="82"
        rx="96"
        ry="36"
        fill="none"
        stroke="#1a3360"
        strokeWidth="1.5"
        opacity={0.55}
      />
      <g stroke="#f97316" strokeWidth="2" opacity={0.22}>
        <line x1="-20" y1="150" x2="420" y2="50" />
        <line x1="-20" y1="175" x2="420" y2="75" />
        <line x1="-20" y1="200" x2="420" y2="100" />
      </g>
    </>
  );
}

function NewsArt() {
  return (
    <>
      <rect width="400" height="225" fill="#0a1628" />
      <g opacity={0.18} stroke="#1a3360" strokeWidth="1">
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={i} x1="28" y1={36 + i * 22} x2="372" y2={36 + i * 22} />
        ))}
      </g>
      <path
        d="M200 38 L218 82 L200 126 L182 82 Z"
        fill="#f97316"
        opacity={0.95}
      />
      <line x1="72" y1="82" x2="328" y2="82" stroke="#f97316" strokeWidth="2" opacity={0.25} />
    </>
  );
}

function CategoryArt({
  category,
  glowId,
}: {
  category: BlogCategory;
  glowId: string;
}) {
  switch (category) {
    case "Guide":
      return <GuideArt />;
    case "Strategy":
      return <StrategyArt glowId={glowId} />;
    case "Crypto":
      return <CryptoArt />;
    case "Sports":
      return <SportsArt />;
    case "News":
      return <NewsArt />;
    default:
      return <GuideArt />;
  }
}

export function BlogCover({
  category,
  title,
  readTime,
  size = "default",
  className,
}: BlogCoverProps) {
  const t = useTranslations("blog.coverCategory");
  const noiseId = useId();
  const glowId = useId();
  const isSmall = size === "sm";
  const badgeLabel = t(COVER_BADGE_KEYS[category]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        isSmall ? "aspect-[4/3]" : "aspect-video",
        className,
      )}
      role="img"
      aria-label={title}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter id={noiseId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
            <feBlend in="SourceGraphic" in2="mono" mode="overlay" />
          </filter>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="8"
              floodColor="#f97316"
              floodOpacity="0.65"
            />
          </filter>
        </defs>
        <CategoryArt category={category} glowId={glowId} />
        <rect width="400" height="225" filter={`url(#${noiseId})`} opacity={0.4} />
      </svg>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060d1f] via-[#060d1f]/55 to-transparent"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex h-full flex-col justify-end",
          isSmall ? "p-3" : "p-4 md:p-5",
        )}
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "mb-2 inline-block rounded-full bg-navy-800/90 px-2.5 py-0.5 font-sans font-bold uppercase tracking-widest text-orange-500 ring-1 ring-orange-500/30",
                isSmall ? "text-[9px]" : "text-[10px]",
              )}
            >
              {badgeLabel}
            </span>
            <h3
              className={cn(
                "line-clamp-2 font-display leading-[1.05] tracking-wide text-white",
                isSmall ? "text-lg" : "text-[28px]",
              )}
            >
              {title}
            </h3>
          </div>
          <span
            className={cn(
              "shrink-0 whitespace-nowrap pb-0.5 text-[#94a3b8]",
              isSmall ? "text-[10px]" : "text-xs",
            )}
          >
            {readTime}
          </span>
        </div>
      </div>
    </div>
  );
}
