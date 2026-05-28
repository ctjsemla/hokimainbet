"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { HomeGameCard } from "@/components/home/HomeGameCard";
import {
  CrashCardVisual,
  DiceCardVisual,
  KenoCardVisual,
  MinesCardVisual,
  PlinkoCardVisual,
  WheelCardVisual,
} from "@/components/home/game-card-visuals";

export function HomeGamesGrid() {
  const t = useTranslations("home");

  const games = [
    { key: "crash" as const, layout: "hero" as const, visual: <CrashCardVisual /> },
    { key: "dice" as const, layout: "half" as const, visual: <DiceCardVisual /> },
    { key: "mines" as const, layout: "half" as const, visual: <MinesCardVisual /> },
    { key: "plinko" as const, layout: "split" as const, visual: <PlinkoCardVisual /> },
    { key: "wheel" as const, layout: "half" as const, visual: <WheelCardVisual /> },
    { key: "keno" as const, layout: "half" as const, visual: <KenoCardVisual /> },
  ] as const;

  return (
    <section className="px-6 py-20 md:px-12 md:py-28">
      <m.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
        className="mb-12 max-w-3xl"
      >
        <h2 className="font-display text-[52px] leading-[0.95] tracking-[0.02em] text-white md:text-[64px]">
          {t("gamesHeading")}
        </h2>
        <p className="mt-4 font-sans text-base leading-relaxed text-[#94a3b8] md:text-[16px]">
          {t("gamesSubtitle")}
        </p>
      </m.header>

      <div className="flex flex-col gap-6">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <HomeGameCard
            game="crash"
            layout="hero"
            title={t("games.crash")}
            description={t("gamesDesc.crash")}
            playLabel={t("playDemo")}
            visual={<CrashCardVisual />}
          />
        </m.div>

        <div className="grid gap-6 md:grid-cols-2">
          {games.slice(1, 3).map((item, index) => (
            <m.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <HomeGameCard
                game={item.key}
                layout={item.layout}
                title={t(`games.${item.key}`)}
                description={t(`gamesDesc.${item.key}`)}
                playLabel={t("playDemo")}
                visual={item.visual}
              />
            </m.div>
          ))}
        </div>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <HomeGameCard
            game="plinko"
            layout="split"
            title={t("games.plinko")}
            description={t("gamesDesc.plinko")}
            playLabel={t("playDemo")}
            visual={<PlinkoCardVisual />}
          />
        </m.div>

        <div className="grid gap-6 md:grid-cols-2">
          {games.slice(4, 6).map((item, index) => (
            <m.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <HomeGameCard
                game={item.key}
                layout={item.layout}
                title={t(`games.${item.key}`)}
                description={t(`gamesDesc.${item.key}`)}
                playLabel={t("playDemo")}
                visual={item.visual}
              />
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
