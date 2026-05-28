"use client";

import { AnimatePresence, m } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { SlotCard } from "@/components/slots/SlotCard";
import { SlotPlayerModal } from "@/components/slots/SlotPlayerModal";
import { useLoginRequiredAction } from "@/hooks/useLoginRequiredAction";
import { useRouter } from "@/i18n/navigation";
import { getSlotById, slots } from "@/lib/slotsData";
import type { SlotFilter, SlotGame } from "@/types/slots.types";
import { cn } from "@/lib/utils";

const FILTERS: { key: SlotFilter; labelKey: "filterAll" | "filterPragmatic" | "filterHacksaw" }[] =
  [
    { key: "all", labelKey: "filterAll" },
    { key: "Pragmatic Play", labelKey: "filterPragmatic" },
    { key: "Hacksaw Gaming", labelKey: "filterHacksaw" },
  ];

export function SlotsPageView() {
  const t = useTranslations("slots");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { requireLogin, goToLogin, loginRequiredMessage } = useLoginRequiredAction();
  const [filter, setFilter] = useState<SlotFilter>("all");
  const [activeSlot, setActiveSlot] = useState<SlotGame | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const playId = searchParams.get("play");

  useEffect(() => {
    if (!playId) return;
    const slot = getSlotById(playId);
    if (slot) {
      if (!user) return;
      setActiveSlot(slot);
    }
  }, [playId, user]);

  const handleCloseModal = useCallback(() => {
    setActiveSlot(null);
    if (playId) {
      router.replace("/games/slots");
    }
  }, [playId, router]);

  const handlePlay = useCallback(
    (slot: SlotGame) => {
      if (!requireLogin(Boolean(user), setPlayError)) return;
      setPlayError(null);
      setActiveSlot(slot);
      router.replace(`/games/slots?play=${slot.id}`, { scroll: false });
    },
    [requireLogin, router, user],
  );

  const filtered = useMemo(
    () =>
      filter === "all" ? slots : slots.filter((slot) => slot.provider === filter),
    [filter],
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-10 md:min-h-screen md:px-12 md:py-14">
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <m.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[56px] leading-[0.95] tracking-[0.02em] text-white md:text-[80px]"
          >
            {t("title")}
          </m.h1>
          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-sans text-base text-[#94a3b8]"
          >
            {t("subtitle")}
          </m.p>
        </div>
        <m.span
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex w-fit rounded-full bg-navy-800 px-4 py-2 font-sans text-sm font-medium text-orange-500"
        >
          {t("gamesAvailable")}
        </m.span>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-4 py-2 font-sans text-sm font-medium transition-all duration-200",
              filter === key
                ? "bg-orange-500 text-white"
                : "bg-navy-800 text-[#94a3b8] hover:text-white",
            )}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      {playError && (
        <div className="mb-5 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-300">
          {playError}
          {playError === loginRequiredMessage && (
            <button
              type="button"
              onClick={goToLogin}
              className="ml-2 underline underline-offset-2"
            >
              {tCommon("goLogin")}
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        <m.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((slot, index) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              index={index}
              onPlay={handlePlay}
            />
          ))}
        </m.div>
      </AnimatePresence>

      <SlotPlayerModal slot={activeSlot} onClose={handleCloseModal} />
    </div>
  );
}
