"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LeaderboardEmptyState } from "@/components/leaderboard/LeaderboardEmptyState";
import { PersonalStatsSidebar } from "@/components/leaderboard/PersonalStatsSidebar";
import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatMultiplier } from "@/lib/formatCurrency";
import {
  countActivePlayers,
  fetchLeaderboard,
  fetchLeaderboardStats,
  fetchPersonalStats,
  matchesFilters,
  mergeScore,
  type GameFilter,
  type LeaderboardEntry,
  type LeaderboardStats,
  type PersonalLeaderboardStats,
  type TimeRange,
} from "@/lib/leaderboard";
import {
  fillLeaderboardEntries,
  getFakeLeaderboardStats,
} from "@/lib/leaderboardFakeData";
import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { GameScore, GameType } from "@/types/database.types";
import { cn } from "@/lib/utils";

const GAMES: { id: GameFilter; labelKey: "all" | GameType }[] = [
  { id: "all", labelKey: "all" },
  { id: "crash", labelKey: "crash" },
  { id: "dice", labelKey: "dice" },
  { id: "mines", labelKey: "mines" },
  { id: "plinko", labelKey: "plinko" },
  { id: "wheel", labelKey: "wheel" },
  { id: "keno", labelKey: "keno" },
];

const TIME_RANGES: TimeRange[] = ["today", "week", "all"];

function AnimatedStat({ value, format }: { value: number; format?: (n: number) => string }) {
  const display = format ? format(value) : String(value);

  return (
    <m.span
      key={display}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-display text-3xl text-white md:text-4xl"
    >
      {display}
    </m.span>
  );
}

export function LeaderboardView() {
  const t = useTranslations("leaderboard");
  const { user } = useAuth();

  const [game, setGame] = useState<GameFilter>("all");
  const [range, setRange] = useState<TimeRange>("today");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [personal, setPersonal] = useState<PersonalLeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEntryIds, setNewEntryIds] = useState<Set<string>>(new Set());
  const recentScoresRef = useRef<GameScore[]>([]);
  const gameRef = useRef(game);
  const rangeRef = useRef(range);
  const userRef = useRef(user);

  gameRef.current = game;
  rangeRef.current = range;
  userRef.current = user;

  const subheadingKey = useMemo(() => {
    if (range === "today") return "subheadingToday";
    if (range === "week") return "subheadingWeek";
    return "subheadingAll";
  }, [range]);

  const userBestEntryId = useMemo(() => {
    if (!user) return null;
    const best = entries
      .filter((e) => e.user_id === user.id)
      .sort((a, b) => b.multiplier - a.multiplier)[0];
    return best?.id ?? null;
  }, [entries, user]);

  const loadBoard = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const filled = fillLeaderboardEntries([], game, range);
      setEntries(filled);
      setStats(getFakeLeaderboardStats());
      setPersonal(null);
      setLoading(false);
      setPersonalLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let board: LeaderboardEntry[] = [];
    let boardStats: LeaderboardStats | null = null;

    try {
      [board, boardStats] = await Promise.all([
        fetchLeaderboard(game, range),
        fetchLeaderboardStats(),
      ]);

      const filled = fillLeaderboardEntries(board, game, range);
      setEntries(filled);
      setStats(boardStats);
      recentScoresRef.current = board;
    } catch {
      setEntries(fillLeaderboardEntries([], game, range));
      setStats(getFakeLeaderboardStats());
      recentScoresRef.current = [];
    } finally {
      setLoading(false);
    }

    if (!user) {
      setPersonal(null);
      setPersonalLoading(false);
      return;
    }

    setPersonalLoading(true);
    try {
      const displayBoard = fillLeaderboardEntries(board, game, range);
      const personalStats = await fetchPersonalStats(
        user.id,
        game,
        range,
        displayBoard,
      );
      setPersonal(personalStats);
    } catch {
      setPersonal(null);
    } finally {
      setPersonalLoading(false);
    }
  }, [game, range, user]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createBrowserClient();

    const channel = supabase
      .channel("leaderboard-scores")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_scores" },
        (payload) => {
          const score = payload.new as GameScore;
          const activeGame = gameRef.current;
          const activeRange = rangeRef.current;
          const activeUser = userRef.current;

          recentScoresRef.current = [score, ...recentScoresRef.current].slice(
            0,
            500,
          );

          const nextStats = (prev: LeaderboardStats | null) =>
            prev
              ? {
                  ...prev,
                  gamesToday: prev.gamesToday + 1,
                  highestMultiplierEver: Math.max(
                    prev.highestMultiplierEver,
                    Number(score.multiplier),
                  ),
                  activePlayers: countActivePlayers(
                    recentScoresRef.current,
                    prev.activePlayers,
                  ),
                }
              : prev;

          setStats(nextStats);

          if (!matchesFilters(score, activeGame, activeRange)) {
            return;
          }

          setNewEntryIds((prev) => new Set(prev).add(score.id));
          setTimeout(() => {
            setNewEntryIds((prev) => {
              const next = new Set(prev);
              next.delete(score.id);
              return next;
            });
          }, 1200);

          setEntries((prev) => {
            const realOnly = prev.filter((entry) => !entry.id.startsWith("fake-"));
            const mergedReal = mergeScore(realOnly, score);
            const filled = fillLeaderboardEntries(
              mergedReal,
              activeGame,
              activeRange,
            );
            if (activeUser && score.user_id === activeUser.id) {
              void fetchPersonalStats(
                activeUser.id,
                activeGame,
                activeRange,
                filled,
              ).then(setPersonal);
            }
            return filled;
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-8 md:pt-12">
      <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="heading-display text-[72px] leading-[0.9] md:text-[88px]">
            {t("title")}
          </h1>
          <p className="mt-2 text-lg font-medium text-orange-500 md:text-xl">
            {t(subheadingKey)}
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-6 border-t border-navy-800 pt-6 lg:border-t-0 lg:pt-0">
            <div>
              <p className="text-xs uppercase tracking-wider text-[#94a3b8]">
                {t("statGamesToday")}
              </p>
              <AnimatedStat value={stats.gamesToday} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#94a3b8]">
                {t("statHighest")}
              </p>
              <AnimatedStat
                value={stats.highestMultiplierEver}
                format={formatMultiplier}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#94a3b8]">
                {t("statActive")}
              </p>
              <AnimatedStat value={stats.activePlayers} />
            </div>
          </div>
        )}
      </header>

      <div className="mt-10 flex flex-col gap-4 border-b border-navy-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex gap-1 overflow-x-auto scrollbar-none">
          {GAMES.map((tab) => {
            const active = game === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGame(tab.id)}
                className={cn(
                  "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors",
                  active ? "text-orange-500" : "text-[#94a3b8] hover:text-white",
                )}
              >
                {t(`games.${tab.labelKey}`)}
                {active && (
                  <m.span
                    layoutId="leaderboard-game-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 justify-end gap-2">
          {TIME_RANGES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setRange(time)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                range === time
                  ? "bg-orange-500 text-white"
                  : "bg-navy-700 text-[#94a3b8] hover:text-white",
              )}
            >
              {t(`time.${time}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:gap-8">
        <div className="min-w-0 flex-1">
          {entries.length > 0 || loading || error ? (
            <LeaderboardTable
              entries={entries}
              loading={loading}
              error={error}
              newEntryIds={newEntryIds}
              currentUserId={user?.id ?? null}
              userBestEntryId={userBestEntryId}
            />
          ) : (
            <LeaderboardEmptyState />
          )}
        </div>

        <PersonalStatsSidebar
          stats={personal}
          loading={personalLoading}
          loggedIn={Boolean(user)}
        />
      </div>

    </div>
  );
}
