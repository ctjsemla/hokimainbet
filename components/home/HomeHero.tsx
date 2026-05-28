"use client";

import { m } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AffiliateButton } from "@/components/ui/AffiliateButton";
import { cn } from "@/lib/utils";

interface PreviewCard {
  gameKey: "crash" | "dice" | "mines";
  href: string;
  base: number;
  floatDelay: number;
  className: string;
}

const PREVIEWS: PreviewCard[] = [
  {
    gameKey: "crash",
    href: "/games/crash",
    base: 2.4,
    floatDelay: 0,
    className: "top-4 right-8 z-30 w-[220px]",
  },
  {
    gameKey: "dice",
    href: "/games/dice",
    base: 87,
    floatDelay: 0.4,
    className: "top-28 right-44 z-20 w-[200px]",
  },
  {
    gameKey: "mines",
    href: "/games/mines",
    base: 3.8,
    floatDelay: 0.8,
    className: "top-52 right-4 z-10 w-[210px]",
  },
];

function useTickingValue(base: number, isMultiplier: boolean) {
  const [value, setValue] = useState(base);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((prev) => {
        if (isMultiplier) {
          const next = prev + (Math.random() * 0.08 + 0.01);
          return next > base + 2.5 ? base : Math.round(next * 100) / 100;
        }
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(1, Math.min(99, Math.round(prev + delta)));
      });
    }, 800);
    return () => clearInterval(id);
  }, [base, isMultiplier]);

  return value;
}

function FloatingCard({
  preview,
  label,
}: {
  preview: PreviewCard;
  label: string;
}) {
  const isMultiplier = preview.gameKey === "crash" || preview.gameKey === "mines";
  const value = useTickingValue(preview.base, isMultiplier);
  const display = isMultiplier ? `${value.toFixed(2)}x` : String(value);

  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + preview.floatDelay, duration: 0.5 }}
      className={cn("absolute", preview.className)}
    >
      <m.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3.5 + preview.floatDelay,
          repeat: Infinity,
          ease: "easeInOut",
          delay: preview.floatDelay,
        }}
      >
        <Link
          href={preview.href}
          className="panel-interactive block border-navy-700/80 bg-navy-900/90 p-5 backdrop-blur-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
            Live demo
          </p>
          <p className="mt-1 font-display text-3xl tracking-[0.04em] text-white">
            {label}
          </p>
          <p className="mt-3 font-display text-4xl tracking-[0.08em] text-orange-500">
            {display}
          </p>
        </Link>
      </m.div>
    </m.div>
  );
}

export function HomeHero() {
  const t = useTranslations("home");

  const trustItems = [
    t("trustNoDeposit"),
    t("trustProvablyFair"),
    t("trustFreeCoins"),
  ];

  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col overflow-hidden md:min-h-screen lg:flex-row">
      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-16 lg:w-[60%] lg:px-12 lg:py-20">
        <m.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex w-fit rounded-full bg-navy-800 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-500"
        >
          {t("badge")}
        </m.span>

        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-[72px] leading-[0.9] tracking-[0.02em] md:text-[96px]"
        >
          <span className="block text-white">{t("heroLine1")}</span>
          <span className="block text-white">{t("heroLine2")}</span>
          <span className="block text-orange-500">{t("heroLine3")}</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-md font-sans text-lg leading-relaxed text-[#cbd5e1]"
        >
          {t("heroSubtext")}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            href="/games/crash"
            className="btn-cta-shimmer rounded-lg bg-orange-500 px-8 py-3.5 font-sans text-lg font-bold tracking-wide text-white"
          >
            {t("ctaPrimary")}
          </Link>
          <AffiliateButton size="lg" className="px-8 py-3.5" />
        </m.div>

        <m.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2"
        >
          {trustItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 text-xs text-[#94a3b8]"
            >
              <Check className="h-3.5 w-3.5 text-orange-500" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </m.ul>
      </div>

      <div className="relative mt-8 min-h-[360px] flex-1 px-4 lg:mt-0 lg:min-h-[420px] lg:w-[40%] lg:px-0">
        <span
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none font-display text-[200px] leading-none text-navy-800"
          aria-hidden
        >
          HOKI
        </span>
        <div className="relative mx-auto h-full min-h-[480px] max-w-lg">
          {PREVIEWS.map((preview) => (
            <FloatingCard
              key={preview.gameKey}
              preview={preview}
              label={t(`games.${preview.gameKey}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
