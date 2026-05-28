"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-2.5 text-lg",
} as const;

interface AffiliateButtonProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function AffiliateButton({
  size = "md",
  className,
}: AffiliateButtonProps) {
  const t = useTranslations("affiliate");

  return (
    <Link
      href="/bonus"
      className={cn(
        "btn-press inline-flex items-center rounded-md bg-orange-500 font-display tracking-wide text-white transition-colors duration-200 hover:bg-orange-600",
        sizeClasses[size],
        className,
      )}
    >
      {t("cta")}
    </Link>
  );
}
