"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatCurrency, formatMultiplier } from "@/lib/formatCurrency";
import type { PersonalLeaderboardStats } from "@/lib/leaderboard";
import type { GameType } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface PersonalStatsSidebarProps {
  stats: PersonalLeaderboardStats | null;
  loading: boolean;
  loggedIn: boolean;
}

const GAME_KEYS: GameType[] = [
  "crash",
  "dice",
  "mines",
  "plinko",
  "wheel",
  "keno",
];

export function PersonalStatsSidebar({
  stats,
  loading,
  loggedIn,
}: PersonalStatsSidebarProps) {
  const t = useTranslations("leaderboard");

  if (!loggedIn) {
    return (
      <aside className="hidden shrink-0 rounded-xl border border-navy-800 bg-navy-900 p-6 lg:block lg:w-[30%]">
        <p className="text-sm text-[#94a3b8]">{t("loginPrompt")}</p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          {t("loginCta")}
        </Link>
      </aside>
    );
  }

  return (
    <aside className="hidden shrink-0 rounded-xl border border-navy-800 bg-navy-900 p-6 lg:block lg:w-[30%] lg:sticky lg:top-24 lg:self-start">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-400">
        {t("yourStats")}
      </p>

      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-navy-800" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <div>
            <p className="text-sm text-[#94a3b8]">{t("yourRank")}</p>
            <m.p
              key={stats?.rank ?? "none"}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-6xl leading-none text-white"
            >
              {stats?.rank ? `#${stats.rank}` : "—"}
            </m.p>
          </div>

          <div>
            <p className="text-sm text-[#94a3b8]">{t("bestMultiplier")}</p>
            <p className="font-display text-4xl text-orange-400">
              {formatMultiplier(stats?.bestMultiplier ?? 0)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm text-[#94a3b8]">{t("bestPerGame")}</p>
            <ul className="space-y-2">
              {GAME_KEYS.map((game) => (
                <li
                  key={game}
                  className="flex justify-between text-sm text-[#cbd5e1]"
                >
                  <span>{t(`games.${game}`)}</span>
                  <span className="font-display text-lg text-white">
                    {stats?.bestByGame[game]
                      ? formatMultiplier(stats.bestByGame[game]!)
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-navy-800 pt-6">
            <div>
              <p className="text-xs text-[#94a3b8]">{t("totalGames")}</p>
              <p className="font-display text-3xl text-white">
                {stats?.totalGames ?? 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">{t("totalPnL")}</p>
              <p
                className={cn(
                  "font-display text-3xl",
                  (stats?.totalProfit ?? 0) >= 0
                    ? "text-[#22c55e]"
                    : "text-[#ef4444]",
                )}
              >
                {(stats?.totalProfit ?? 0) >= 0 ? "+" : ""}
                {formatCurrency(stats?.totalProfit ?? 0)}
              </p>
            </div>
          </div>

          <Link
            href="/games/crash"
            className="block text-center text-sm font-medium text-orange-500 transition-colors hover:text-orange-400"
          >
            {t("improveScore")} →
          </Link>
        </div>
      )}
    </aside>
  );
}
