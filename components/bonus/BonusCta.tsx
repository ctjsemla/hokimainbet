"use client";

import { m } from "framer-motion";
import {
  AFFILIATE_HREF,
  trackAffiliateClick,
  type BonusType,
} from "@/lib/affiliate";
import { cn } from "@/lib/utils";

interface BonusCtaProps {
  bonusType: BonusType;
  locale: string;
  userId?: string | null;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function BonusCta({
  bonusType,
  locale,
  userId,
  href = AFFILIATE_HREF,
  children,
  className,
}: BonusCtaProps) {
  return (
    <m.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        void trackAffiliateClick(bonusType, locale, userId);
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 font-display text-lg tracking-wide text-white transition-shadow hover:bg-orange-600 hover:shadow-[0_0_24px_rgba(249,115,22,0.45)]",
        className,
      )}
    >
      {children}
    </m.a>
  );
}
