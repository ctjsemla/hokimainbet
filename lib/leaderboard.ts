import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { GameScore, GameType } from "@/types/database.types";

export type TimeRange = "today" | "week" | "all";
export type GameFilter = "all" | GameType;

export interface LeaderboardEntry extends GameScore {
  rank: number;
  profit: number;
}

export interface LeaderboardStats {
  gamesToday: number;
  highestMultiplierEver: number;
  activePlayers: number;
}

export interface PersonalLeaderboardStats {
  rank: number | null;
  bestMultiplier: number;
  bestByGame: Partial<Record<GameType, number>>;
  totalGames: number;
  totalProfit: number;
}

const ACTIVE_WINDOW_MS = 30 * 60 * 1000;
const QUERY_TIMEOUT_MS = 10_000;

async function withQueryTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error("leaderboard query timeout")),
        QUERY_TIMEOUT_MS,
      );
    }),
  ]);
}

function getClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }
  return createBrowserClient();
}

export function getRangeStart(range: TimeRange): string | null {
  if (range === "all") return null;

  const now = new Date();

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }

  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  return start.toISOString();
}

export function getTodayStart(): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export function scoreToEntry(score: GameScore, rank: number): LeaderboardEntry {
  return {
    ...score,
    rank,
    profit: Number(score.score) - Number(score.bet_amount),
  };
}

export function rankScores(scores: GameScore[]): LeaderboardEntry[] {
  return scores.map((score, index) => scoreToEntry(score, index + 1));
}

export function matchesFilters(
  score: GameScore,
  game: GameFilter,
  range: TimeRange,
): boolean {
  if (game !== "all" && score.game !== game) return false;

  const start = getRangeStart(range);
  if (!start) return true;

  return new Date(score.played_at).getTime() >= new Date(start).getTime();
}

export function mergeScore(
  entries: LeaderboardEntry[],
  score: GameScore,
  limit = 100,
): LeaderboardEntry[] {
  const exists = entries.some((entry) => entry.id === score.id);
  const next = exists
    ? entries.map((entry) => (entry.id === score.id ? scoreToEntry(score, entry.rank) : entry))
    : [...entries, scoreToEntry(score, entries.length + 1)];

  const sorted = next
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, limit);

  return rankScores(sorted);
}

export async function fetchLeaderboard(
  game: GameFilter,
  range: TimeRange,
  limit = 100,
): Promise<LeaderboardEntry[]> {
  const supabase = getClient();
  const start = getRangeStart(range);

  let query = supabase
    .from("game_scores")
    .select("*")
    .order("multiplier", { ascending: false })
    .limit(limit);

  if (game !== "all") {
    query = query.eq("game", game);
  }

  if (start) {
    query = query.gte("played_at", start);
  }

  const { data, error } = await withQueryTimeout(query);
  if (error) throw error;

  const real = rankScores((data ?? []) as GameScore[]);
  return real;
}

export async function fetchLeaderboardStats(): Promise<LeaderboardStats> {
  const supabase = getClient();
  const todayStart = getTodayStart();
  const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();

  const [todayResult, maxResult, activeResult] = await withQueryTimeout(
    Promise.all([
      supabase
        .from("game_scores")
        .select("id", { count: "exact", head: true })
        .gte("played_at", todayStart),
      supabase
        .from("game_scores")
        .select("multiplier")
        .order("multiplier", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("game_scores")
        .select("user_id")
        .gte("played_at", activeSince),
    ]),
  );

  if (todayResult.error) throw todayResult.error;
  if (maxResult.error) throw maxResult.error;
  if (activeResult.error) throw activeResult.error;

  const activeUsers = new Set(
    (activeResult.data ?? []).map((row) => row.user_id),
  );

  return {
    gamesToday: todayResult.count ?? 0,
    highestMultiplierEver: Number(maxResult.data?.multiplier ?? 0),
    activePlayers: activeUsers.size,
  };
}

export async function fetchPersonalStats(
  userId: string,
  game: GameFilter,
  range: TimeRange,
  leaderboard: LeaderboardEntry[],
): Promise<PersonalLeaderboardStats> {
  const supabase = getClient();
  const start = getRangeStart(range);

  let query = supabase
    .from("game_scores")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false });

  if (game !== "all") {
    query = query.eq("game", game);
  }

  if (start) {
    query = query.gte("played_at", start);
  }

  const { data, error } = await withQueryTimeout(query);
  if (error) throw error;

  const scores = (data ?? []) as GameScore[];
  const bestByGame: Partial<Record<GameType, number>> = {};
  let bestMultiplier = 0;
  let totalProfit = 0;

  for (const score of scores) {
    totalProfit += Number(score.score) - Number(score.bet_amount);
    const mult = Number(score.multiplier);
    if (mult > bestMultiplier) bestMultiplier = mult;
    const current = bestByGame[score.game] ?? 0;
    if (mult > current) bestByGame[score.game] = mult;
  }

  const userBestInList = leaderboard
    .filter((entry) => entry.user_id === userId)
    .sort((a, b) => b.multiplier - a.multiplier)[0];

  return {
    rank: userBestInList?.rank ?? null,
    bestMultiplier: userBestInList?.multiplier ?? bestMultiplier,
    bestByGame,
    totalGames: scores.length,
    totalProfit,
  };
}

export function countActivePlayers(
  scores: GameScore[],
  existing = 0,
): number {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS;
  const users = new Set<string>();

  for (const score of scores) {
    if (new Date(score.played_at).getTime() >= cutoff) {
      users.add(score.user_id);
    }
  }

  return Math.max(existing, users.size);
}
