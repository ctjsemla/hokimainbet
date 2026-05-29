import type { ReactNode } from "react";
import {
  CandyVisual,
  CrashLineVisual,
  LightningVisual,
  PlinkoPegsVisual,
  SheriffStar,
} from "@/components/ui/featured-slider/FeaturedSlideVisuals";

export type FeaturedSlideId =
  | "wanted"
  | "crash"
  | "sweetBonanza"
  | "gates"
  | "plinko";

export type FeaturedCtaKind = "affiliate" | "internal";

interface FeaturedSlideTheme {
  background: string;
  overlay?: string;
  titleColor: string;
  ctaKind: FeaturedCtaKind;
  ctaHref?: string;
  ctaClassName: string;
  visual: ReactNode;
}

export const FEATURED_SLIDE_ORDER: FeaturedSlideId[] = [
  "wanted",
  "crash",
  "sweetBonanza",
  "gates",
  "plinko",
];

export const FEATURED_SLIDE_THEMES: Record<FeaturedSlideId, FeaturedSlideTheme> =
  {
    wanted: {
      background: "linear-gradient(135deg, #1a0a00 0%, #060d1f 72%)",
      overlay:
        "repeating-linear-gradient(-12deg, transparent, transparent 14px, rgba(212,160,23,0.04) 14px, rgba(212,160,23,0.04) 15px)",
      titleColor: "#d4a017",
      ctaKind: "internal",
      ctaHref: "/bonus",
      ctaClassName:
        "bg-[#d4a017] text-black hover:bg-[#e6b422] hover:shadow-[0_0_24px_rgba(212,160,23,0.45)]",
      visual: <SheriffStar />,
    },
    crash: {
      background:
        "radial-gradient(ellipse at 70% 40%, #0f2040 0%, #060d1f 55%), #060d1f",
      overlay:
        "radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.35) 50%, transparent 50%), radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.25) 50%, transparent 50%), radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.2) 50%, transparent 50%), radial-gradient(1px 1px at 35% 70%, rgba(255,255,255,0.3) 50%, transparent 50%)",
      titleColor: "#f97316",
      ctaKind: "internal",
      ctaHref: "/games/crash",
      ctaClassName:
        "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-[0_0_24px_rgba(249,115,22,0.45)]",
      visual: <CrashLineVisual />,
    },
    sweetBonanza: {
      background: "linear-gradient(135deg, #1a0a1a 0%, #060d1f 72%)",
      titleColor: "#e879f9",
      ctaKind: "internal",
      ctaHref: "/bonus",
      ctaClassName:
        "bg-[#e879f9] text-black hover:bg-[#f0abfc] hover:shadow-[0_0_24px_rgba(232,121,249,0.4)]",
      visual: <CandyVisual />,
    },
    gates: {
      background: "linear-gradient(135deg, #0d0a1a 0%, #060d1f 72%)",
      titleColor: "#f59e0b",
      ctaKind: "internal",
      ctaHref: "/bonus",
      ctaClassName:
        "bg-[#f59e0b] text-black hover:bg-[#fbbf24] hover:shadow-[0_0_24px_rgba(245,158,11,0.45)]",
      visual: <LightningVisual />,
    },
    plinko: {
      background:
        "radial-gradient(ellipse at 80% 50%, rgba(34,211,238,0.12) 0%, transparent 50%), linear-gradient(180deg, #060d1f 0%, #0a1628 100%)",
      titleColor: "#22d3ee",
      ctaKind: "internal",
      ctaHref: "/games/plinko",
      ctaClassName:
        "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-[0_0_24px_rgba(249,115,22,0.45)]",
      visual: <PlinkoPegsVisual />,
    },
  };
