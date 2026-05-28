"use client";

import { ChevronDown } from "lucide-react";
import { m } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TermsAccordionProps {
  terms: string;
  className?: string;
}

export function TermsAccordion({ terms, className }: TermsAccordionProps) {
  const t = useTranslations("bonus");
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("mt-4", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 text-left text-xs text-[#94a3b8] transition-colors hover:text-white"
      >
        <span>{t("termsToggle")}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>
      <m.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pt-2 text-xs leading-relaxed text-[#64748b]">{terms}</p>
      </m.div>
    </div>
  );
}
