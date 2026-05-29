"use client";

import { m, useMotionValue, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FEATURED_SLIDE_ORDER,
  FEATURED_SLIDE_THEMES,
  type FeaturedSlideId,
} from "@/components/ui/featured-slider/featuredSlides";
import { Link } from "@/i18n/navigation";
import { PROMO_PAGE_HREF, trackAffiliateClick } from "@/lib/affiliate";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

const GAP_PX = 16;
const AUTO_MS = 5000;

function useVisibleCount(): number {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setCount(mq.matches ? 3 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return count;
}

interface FeaturedSlideCardProps {
  slideId: FeaturedSlideId;
}

function FeaturedSlideCard({ slideId }: FeaturedSlideCardProps) {
  const t = useTranslations("home.featuredSlider");
  const locale = useLocale();
  const { user } = useAuth();
  const theme = FEATURED_SLIDE_THEMES[slideId];
  const prefix = `slides.${slideId}` as const;

  const ctaButton = (
    <m.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center rounded-lg px-4 py-2 font-display text-base tracking-wide transition-shadow",
        theme.ctaClassName,
      )}
    >
      {t(`${prefix}.cta`)}
    </m.span>
  );

  return (
    <m.article
      whileHover={{ scale: 1.02 }}
      className="group relative h-[320px] shrink-0 overflow-hidden rounded-2xl border border-navy-800 transition-[border-color,box-shadow] hover:border-orange-500/40 hover:shadow-[0_12px_40px_rgba(249,115,22,0.12)]"
      style={{
        background: theme.background,
        flexBasis: "var(--card-basis)",
        minWidth: "var(--card-basis)",
      }}
    >
      {theme.overlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: theme.overlay }}
          aria-hidden
        />
      )}
      {theme.visual}

      <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
            {t(`${prefix}.badge`)}
          </span>
          <h3
            className="mt-2 font-display text-[40px] leading-[0.95] tracking-wide md:text-[52px]"
            style={{ color: theme.titleColor }}
          >
            {t(`${prefix}.title`)}
          </h3>
          <p className="mt-2 max-w-[280px] text-sm italic text-[#cbd5e1]">
            {t(`${prefix}.tagline`)}
          </p>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-navy-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">
              {t(`${prefix}.rtp`)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-orange-500">
              {t(`${prefix}.volatility`)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#22c55e]">
              {t(`${prefix}.maxWin`)}
            </span>
          </div>

          {theme.ctaKind === "affiliate" ? (
            <Link
              href={PROMO_PAGE_HREF}
              className="inline-block"
              onClick={() => {
                void trackAffiliateClick("featured_slider", locale, user?.id);
              }}
            >
              {ctaButton}
            </Link>
          ) : (
            <Link
              href={theme.ctaHref ?? "/games/crash"}
              className="inline-block"
            >
              {ctaButton}
            </Link>
          )}
        </div>
      </div>
    </m.article>
  );
}

export function FeaturedSlider() {
  const t = useTranslations("home.featuredSlider");
  const visibleCount = useVisibleCount();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [stepPx, setStepPx] = useState(0);
  const x = useMotionValue(0);

  const maxIndex = Math.max(0, FEATURED_SLIDE_ORDER.length - visibleCount);
  const dotCount = maxIndex + 1;

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const cardWidth =
      (el.clientWidth - GAP_PX * (visibleCount - 1)) / visibleCount;
    setStepPx(cardWidth + GAP_PX);
  }, [visibleCount]);

  useEffect(() => {
    measure();
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(maxIndex, next)));
    },
    [maxIndex],
  );

  useEffect(() => {
    if (stepPx <= 0) return;
    void animate(x, -index * stepPx, {
      type: "spring",
      stiffness: 320,
      damping: 32,
    });
  }, [index, stepPx, x]);

  const goNext = useCallback(() => {
    goTo(index >= maxIndex ? 0 : index + 1);
  }, [goTo, index, maxIndex]);

  const goPrev = useCallback(() => {
    goTo(index <= 0 ? maxIndex : index - 1);
  }, [goTo, index, maxIndex]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, goNext]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const cardBasis =
    visibleCount === 1
      ? "100%"
      : `calc((100% - ${(visibleCount - 1) * GAP_PX}px) / ${visibleCount})`;

  return (
    <section
      className="border-b border-navy-800 px-4 py-12 md:px-8 md:py-16"
      aria-label={t("heading")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-[48px] leading-none tracking-wide text-white">
              {t("heading")}
            </h2>
            <p className="mt-2 text-base text-[#94a3b8]">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label={t("prev")}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-800 text-white transition-all hover:scale-105 hover:bg-orange-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t("next")}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy-800 text-white transition-all hover:scale-105 hover:bg-orange-500"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="touch-pan-y overflow-hidden"
          style={
            {
              "--card-basis": cardBasis,
            } as React.CSSProperties
          }
        >
          <m.div
            className="flex cursor-grab gap-4 active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{
              left: stepPx > 0 ? -stepPx * maxIndex : 0,
              right: 0,
            }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (stepPx <= 0) return;
              const threshold = stepPx * 0.18;
              if (info.offset.x < -threshold || info.velocity.x < -400) {
                goNext();
              } else if (info.offset.x > threshold || info.velocity.x > 400) {
                goPrev();
              } else {
                void animate(x, -index * stepPx, {
                  type: "spring",
                  stiffness: 320,
                  damping: 32,
                });
              }
            }}
          >
            {FEATURED_SLIDE_ORDER.map((slideId) => (
              <FeaturedSlideCard key={slideId} slideId={slideId} />
            ))}
          </m.div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={t("dotLabel", { n: i + 1 })}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index
                  ? "w-8 bg-orange-500"
                  : "w-2 bg-navy-700 hover:bg-navy-700/80",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
