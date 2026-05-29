"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SlotCard } from "@/components/slots/SlotCard";
import { SlotPlayerModal } from "@/components/slots/SlotPlayerModal";
import { Link } from "@/i18n/navigation";
import { getHomeFeaturedSlots, slots } from "@/lib/slotsData";
import type { SlotGame } from "@/types/slots.types";

export function HomeSlotsSection() {
  const t = useTranslations("slots");
  const featured = getHomeFeaturedSlots();
  const [activeSlot, setActiveSlot] = useState<SlotGame | null>(null);

  return (
    <section className="px-6 py-20 md:px-12 md:py-28">
      <m.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
        className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h2 className="font-display text-[40px] leading-[0.95] tracking-[0.02em] text-white md:text-[48px]">
            {t("homeHeading")}
          </h2>
          <p className="mt-3 font-sans text-base text-[#94a3b8]">{t("homeSubtitle")}</p>
        </div>
        <Link
          href="/games/slots"
          className="font-sans text-sm font-medium text-orange-500 transition hover:text-orange-400"
        >
          {t("viewAll", { count: slots.length })}
        </Link>
      </m.header>

      <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
        {featured.map((slot, index) => (
          <SlotCard
            key={slot.slug}
            slot={slot}
            compact
            index={index}
            onPlay={setActiveSlot}
          />
        ))}
      </div>

      <SlotPlayerModal slot={activeSlot} onClose={() => setActiveSlot(null)} />
    </section>
  );
}
