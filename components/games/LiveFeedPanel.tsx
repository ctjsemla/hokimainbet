"use client";

import { AnimatePresence, m } from "framer-motion";
import { Bomb, Circle, CircleDot, Dices, Grid3x3, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { maskUsername } from "@/lib/maskUsername";
import { cn } from "@/lib/utils";

type FeedGame = "crash" | "dice" | "mines" | "plinko" | "wheel" | "keno";

interface FeedItem {
  id: string;
  user: string;
  game: FeedGame;
  result: string;
  win: boolean;
}

const GAMES: FeedGame[] = [
  "crash",
  "dice",
  "mines",
  "plinko",
  "wheel",
  "keno",
];

const ICONS = {
  crash: Zap,
  dice: Dices,
  mines: Bomb,
  plinko: Circle,
  wheel: CircleDot,
  keno: Grid3x3,
} as const;

function randomUser() {
  return maskUsername();
}

function generateItem(): FeedItem {
  const game = GAMES[Math.floor(Math.random() * GAMES.length)];
  const mult = 0.5 + Math.random() * 12;
  const win = mult >= 1;

  const results: Record<FeedGame, string> = {
    crash: win ? `cash out ${mult.toFixed(2)}x` : `crash ${mult.toFixed(2)}x`,
    dice: win ? `roll ${Math.floor(50 + Math.random() * 50)}` : `miss roll`,
    mines: win ? `${Math.floor(2 + Math.random() * 6)} petak — ${mult.toFixed(1)}x` : "ranjau",
    plinko: win ? `slot ${mult.toFixed(0)}x` : `slot 0.2x`,
    wheel: win ? `putar ${mult.toFixed(1)}x` : "putar 0x",
    keno: win ? `${Math.floor(3 + Math.random() * 7)}/10 cocok — ${mult.toFixed(0)}x` : "0 cocok",
  };

  return {
    id: `${Date.now()}-${Math.random()}`,
    user: randomUser(),
    game,
    result: results[game],
    win,
  };
}

export function LiveFeedPanel() {
  const t = useTranslations("games");
  const [items, setItems] = useState<FeedItem[]>(() =>
    Array.from({ length: 8 }, () => generateItem()),
  );

  const pushItem = useCallback(() => {
    setItems((prev) => [generateItem(), ...prev].slice(0, 24));
  }, []);

  useEffect(() => {
    const id = setInterval(pushItem, 3500);
    return () => clearInterval(id);
  }, [pushItem]);

  return (
    <section className="mt-6 border-t border-navy-800 pt-4">
      <p className="mb-3 font-sans text-xs uppercase tracking-wider text-[#94a3b8]">
        {t("liveFeed")}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const Icon = ICONS[item.game];
            return (
              <m.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 font-sans text-xs",
                  item.win
                    ? "border border-orange-500/20 bg-orange-500/10 text-orange-400"
                    : "border border-navy-700 bg-navy-800 text-[#94a3b8]",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span className="text-white/90">{item.user}</span>
                <span className="text-[#64748b]">·</span>
                <span>{item.result}</span>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
