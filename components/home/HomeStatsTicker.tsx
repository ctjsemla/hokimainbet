"use client";

import { useTranslations } from "next-intl";

export function HomeStatsTicker() {
  const t = useTranslations("home");

  const items = [
    t("tickerHot"),
    t("tickerPlayers"),
    t("tickerWinnings"),
  ];

  const loop = [...items, ...items];

  return (
    <section className="overflow-hidden border-y border-navy-800 bg-navy-800 py-3">
      <div className="home-marquee flex w-max gap-12 whitespace-nowrap px-4">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="text-sm font-medium text-[#cbd5e1]"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
