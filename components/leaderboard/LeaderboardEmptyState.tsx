"use client";

import { m } from "framer-motion";
import { Bomb, CircleDot, Dices, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const GAMES = [
  { href: "/games/crash", icon: TrendingUp, labelKey: "crash" as const },
  { href: "/games/dice", icon: Dices, labelKey: "dice" as const },
  { href: "/games/mines", icon: Bomb, labelKey: "mines" as const },
  { href: "/games/plinko", icon: CircleDot, labelKey: "plinko" as const },
];

export function LeaderboardEmptyState() {
  const t = useTranslations("leaderboard");

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-20 text-center"
    >
      <svg
        viewBox="0 0 200 160"
        className="mb-10 h-40 w-52 text-navy-700"
        aria-hidden
      >
        <polygon
          points="100,10 180,140 20,140"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="55"
          y="70"
          width="90"
          height="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          transform="rotate(12 100 95)"
        />
        <circle
          cx="100"
          cy="55"
          r="18"
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
        />
      </svg>

      <h2 className="font-display text-4xl tracking-wide text-white">
        {t("emptyTitle")}
      </h2>
      <p className="mt-3 max-w-md text-[#94a3b8]">{t("emptyDesc")}</p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {GAMES.map(({ href, icon: Icon, labelKey }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-orange-500 hover:text-orange-400"
          >
            <Icon className="h-4 w-4 text-orange-500" strokeWidth={1.5} />
            {t(`games.${labelKey}`)}
          </Link>
        ))}
      </div>
    </m.div>
  );
}
