"use client";

import { m } from "framer-motion";
import { Link } from "@/i18n/navigation";
import {
  PROMO_PAGE_HREF,
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

const buttonClassName =
  "inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 font-display text-lg tracking-wide text-white transition-shadow hover:bg-orange-600 hover:shadow-[0_0_24px_rgba(249,115,22,0.45)]";

export function BonusCta({
  bonusType,
  locale,
  userId,
  href = PROMO_PAGE_HREF,
  children,
  className,
}: BonusCtaProps) {
  const onClick = () => {
    void trackAffiliateClick(bonusType, locale, userId);
  };

  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <m.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonClassName, className)}
      >
        {children}
      </m.a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={cn(buttonClassName, className)}>
      {children}
    </Link>
  );
}
