"use client";

import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import {
  Bomb,
  Circle,
  CircleDot,
  Dices,
  Grid3x3,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { formatCurrency, formatMultiplier } from "@/lib/formatCurrency";
import { getPublicUsername } from "@/lib/maskUsername";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { formatTimeAgo } from "@/lib/timeAgo";
import type { GameType } from "@/types/database.types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const GAME_ICONS: Record<GameType, LucideIcon> = {
  crash: TrendingUp,
  dice: Dices,
  mines: Bomb,
  plinko: Circle,
  wheel: CircleDot,
  keno: Grid3x3,
};

const PODIUM_STYLES: Record<
  number,
  { border: string; accent: string; row: string }
> = {
  1: {
    border: "border-l-4 border-l-[#f59e0b]",
    accent: "text-[#f59e0b]",
    row: "bg-navy-900/80 py-6",
  },
  2: {
    border: "border-l-4 border-l-[#94a3b8]",
    accent: "text-[#94a3b8]",
    row: "bg-navy-900/40 py-5",
  },
  3: {
    border: "border-l-4 border-l-[#b45309]",
    accent: "text-[#b45309]",
    row: "bg-navy-900/40 py-4",
  },
};

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  newEntryIds: ReadonlySet<string>;
  currentUserId: string | null;
  userBestEntryId: string | null;
}

function GameIcon({ game }: { game: GameType }) {
  const Icon = GAME_ICONS[game];
  return <Icon className="h-4 w-4 text-[#94a3b8]" strokeWidth={1.5} />;
}

interface RowProps {
  entry: LeaderboardEntry;
  isNew: boolean;
  isUserBest: boolean;
  locale: string;
}

function LeaderboardRow({ entry, isNew, isUserBest, locale }: RowProps) {
  const t = useTranslations("leaderboard");
  const isPodium = entry.rank <= 3;
  const podium = PODIUM_STYLES[entry.rank];
  const profit = entry.profit;
  const isProfit = profit >= 0;

  return (
    <m.li
      layout
      initial={isNew ? { opacity: 0, y: -24 } : false}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: isNew
          ? ["rgba(249,115,22,0.25)", "rgba(15,32,64,0)"]
          : undefined,
      }}
      transition={{
        layout: { type: "spring", stiffness: 500, damping: 40 },
        duration: 0.35,
      }}
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-navy-800 px-4 transition-colors hover:bg-navy-800 md:grid-cols-[3rem_1fr_repeat(4,minmax(0,auto))] md:gap-4 md:px-6",
        isPodium && podium?.row,
        isPodium && podium?.border,
        isUserBest && "border-l-4 border-l-orange-500 bg-navy-900/60",
        !isPodium && !isUserBest && "py-3.5",
      )}
    >
      <span
        className={cn(
          "font-mono text-sm tabular-nums",
          isPodium ? cn("text-2xl font-display", podium?.accent) : "text-[#64748b]",
        )}
      >
        {entry.rank}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "truncate font-medium text-white transition-colors group-hover:text-orange-500",
              isPodium && entry.rank === 1 && "text-2xl",
              isPodium && entry.rank === 2 && "text-xl",
              isPodium && entry.rank === 3 && "text-lg",
            )}
          >
            {getPublicUsername(entry.username, entry.user_id)}
          </span>
          {isUserBest && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {t("yourBest")}
            </span>
          )}
          <GameIcon game={entry.game} />
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-[#64748b] md:hidden">
          <span className="font-display text-orange-400">
            {formatMultiplier(entry.multiplier)}
          </span>
          <span>{formatCurrency(entry.bet_amount)}</span>
          <span
            className={isProfit ? "text-[#22c55e]" : "text-[#ef4444]"}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(profit)}
          </span>
        </div>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <span
          className={cn(
            "min-w-[4.5rem] font-display tracking-wide text-orange-400",
            isPodium && entry.rank === 1 && "text-4xl",
            isPodium && entry.rank === 2 && "text-3xl",
            isPodium && entry.rank === 3 && "text-2xl",
            !isPodium && "text-xl",
          )}
        >
          {formatMultiplier(entry.multiplier)}
        </span>
        <span className="min-w-[4rem] text-right text-sm text-[#94a3b8]">
          {formatCurrency(entry.bet_amount)}
        </span>
        <span
          className={cn(
            "min-w-[4.5rem] text-right text-sm font-medium",
            isProfit ? "text-[#22c55e]" : "text-[#ef4444]",
          )}
        >
          {isProfit ? "+" : ""}
          {formatCurrency(profit)}
        </span>
        <span className="min-w-[5rem] text-right text-xs text-[#64748b]">
          {formatTimeAgo(entry.played_at, locale)}
        </span>
      </div>
    </m.li>
  );
}

export function LeaderboardTable({
  entries,
  loading,
  error,
  newEntryIds,
  currentUserId,
  userBestEntryId,
}: LeaderboardTableProps) {
  const t = useTranslations("leaderboard");
  const locale = useLocale();

  const userBestEntry = useMemo(
    () => entries.find((e) => e.id === userBestEntryId) ?? null,
    [entries, userBestEntryId],
  );

  const showStickyUser =
    currentUserId &&
    userBestEntry &&
    userBestEntry.rank > 3;

  if (loading) {
    return (
      <div className="space-y-2 overflow-hidden rounded-xl border border-navy-800">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("mx-2 h-12", i === 0 && "mt-2", i === 9 && "mb-2")}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-navy-800 bg-navy-900 px-6 py-8 text-center text-[#94a3b8]">
        {error}
      </p>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="mb-3 hidden px-6 text-xs font-medium uppercase tracking-wider text-[#64748b] md:grid md:grid-cols-[3rem_1fr_repeat(4,minmax(0,auto))] md:gap-4">
        <span>#</span>
        <span>{t("colPlayer")}</span>
        <span className="text-right">{t("colMultiplier")}</span>
        <span className="text-right">{t("colBet")}</span>
        <span className="text-right">{t("colPayout")}</span>
        <span className="text-right">{t("colTime")}</span>
      </div>

      <LayoutGroup>
        <ul className="overflow-hidden rounded-xl border border-navy-800 bg-navy-950">
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                isNew={newEntryIds.has(entry.id)}
                isUserBest={entry.id === userBestEntryId}
                locale={locale}
              />
            ))}
          </AnimatePresence>
        </ul>
      </LayoutGroup>

      {showStickyUser && userBestEntry && (
        <div className="sticky bottom-0 z-20 mt-4 overflow-hidden rounded-xl border border-orange-500/50 shadow-[0_-8px_30px_rgba(6,13,31,0.9)]">
          <ul>
            <LeaderboardRow
              entry={userBestEntry}
              isNew={false}
              isUserBest
              locale={locale}
            />
          </ul>
        </div>
      )}
    </div>
  );
}
