"use client";

import { useEffect, useMemo, useState } from "react";
import { maskUsername } from "@/lib/maskUsername";
import { cn } from "@/lib/utils";

interface TickerItem {
  id: string;
  text: string;
  hot: boolean;
}

function buildTickerPool(): TickerItem[] {
  return [
    {
      id: "crash-win",
      text: `🔥 ${maskUsername()} memenangkan ${Math.floor(200 + Math.random() * 900)} koin di Crash ${(1.5 + Math.random() * 12).toFixed(1)}x`,
      hot: true,
    },
    {
      id: "cashout",
      text: `⚡ ${maskUsername()} cash out di ${(1.2 + Math.random() * 5).toFixed(1)}x — +${Math.floor(80 + Math.random() * 200)} koin`,
      hot: false,
    },
    {
      id: "mines",
      text: `💎 ${maskUsername()} mines ${Math.floor(3 + Math.random() * 6)} petak aman — ${(1.5 + Math.random() * 4).toFixed(1)}x`,
      hot: false,
    },
    {
      id: "record",
      text: `🚀 Multiplier tertinggi hari ini: ${(8 + Math.random() * 12).toFixed(1)}x`,
      hot: true,
    },
    {
      id: "dice",
      text: `🎲 ${maskUsername()} roll over ${Math.floor(50 + Math.random() * 50)} — menang ${(1.2 + Math.random() * 3).toFixed(1)}x`,
      hot: false,
    },
    {
      id: "plinko",
      text: `◉ ${maskUsername()} Plinko slot ${Math.round(2 + Math.random() * 108)}x — jackpot demo`,
      hot: true,
    },
    {
      id: "crash2",
      text: `🔥 ${maskUsername()} menang ${Math.floor(150 + Math.random() * 600)} koin`,
      hot: true,
    },
    {
      id: "timing",
      text: `⚡ Crash ${(2 + Math.random() * 8).toFixed(1)}x — cash out tepat waktu oleh ${maskUsername()}`,
      hot: Math.random() > 0.5,
    },
  ];
}

export function LiveTickerBar() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    setItems(buildTickerPool());
    const id = setInterval(() => setItems(buildTickerPool()), 30000);
    return () => clearInterval(id);
  }, []);

  const marquee = useMemo(
    () =>
      [...items, ...items].map((item, i) => ({
        ...item,
        key: `${item.id}-${i}`,
      })),
    [items],
  );

  return (
    <div className="relative z-20 h-9 shrink-0 overflow-hidden border-b border-navy-700 bg-navy-800">
      <div className="live-ticker-track flex h-full w-max items-center gap-8 px-4">
        {marquee.map((item) => (
          <span
            key={item.key}
            className={cn(
              "whitespace-nowrap font-sans text-xs",
              item.hot ? "text-orange-400" : "text-[#94a3b8]",
            )}
          >
            {item.text}
            <span className="mx-4 text-navy-700">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
