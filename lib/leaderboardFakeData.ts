import {
  matchesFilters,
  rankScores,
  type GameFilter,
  type LeaderboardEntry,
  type TimeRange,
} from "@/lib/leaderboard";
import { getPublicUsername } from "@/lib/maskUsername";
import type { GameScore, GameType } from "@/types/database.types";

const GAMES: GameType[] = ["crash", "dice", "mines", "plinko", "wheel", "keno"];

/** Deterministic PRNG (LCG) — same sequence every render. */
function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1_103_515_245, state) + 12_345) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function seededInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

function seededFloat(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

function multiplierForSlot(index: number, rand: () => number): number {
  if (index < 3) return Math.round(seededFloat(rand, 15, 28) * 100) / 100;
  if (index < 10) return Math.round(seededFloat(rand, 8, 14) * 100) / 100;
  if (index < 25) return Math.round(seededFloat(rand, 3, 7) * 100) / 100;
  return Math.round(seededFloat(rand, 1.2, 2.9) * 100) / 100;
}

const USERNAME_SUFFIXES = [
  42, 17, 83, 5, 91, 28, 64, 3, 76, 39, 52, 11, 88, 23, 67, 44, 99, 6, 31, 58,
  72, 14, 85, 47, 20, 63, 8, 95, 36, 51, 74, 2, 69, 33, 86, 19, 55, 97, 12, 41,
  78, 25, 60, 4, 93, 38, 71, 16, 84, 49,
];

function buildFakePool(): GameScore[] {
  const rand = createSeededRandom(0x6c656164);
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  const drafts = USERNAME_SUFFIXES.map((suffix, index) => {
    const bet = seededInt(rand, 50, 500);
    const multiplier = multiplierForSlot(index, rand);
    const score = Math.round(bet * multiplier * 100) / 100;
    const game = GAMES[index % GAMES.length];
    const playedOffset = seededFloat(rand, 0, sevenDaysMs);

    return {
      id: `fake-leaderboard-${index}`,
      user_id: `fake-user-${index}`,
      username: `u****${String(suffix).padStart(2, "0")}`,
      game,
      score,
      multiplier,
      bet_amount: bet,
      played_at: new Date(now - playedOffset).toISOString(),
    };
  });

  drafts.sort((a, b) => Number(b.score) - Number(a.score));
  return drafts;
}

let cachedPool: GameScore[] | null = null;

export function getFakeLeaderboardPool(): GameScore[] {
  if (!cachedPool) {
    cachedPool = buildFakePool();
  }
  return cachedPool;
}

export function fillLeaderboardEntries(
  real: LeaderboardEntry[],
  game: GameFilter,
  range: TimeRange,
): LeaderboardEntry[] {
  const pool = getFakeLeaderboardPool();
  const realIds = new Set(real.map((entry) => entry.id));

  const fakeCandidates = pool.filter(
    (score) =>
      !realIds.has(score.id) && matchesFilters(score, game, range),
  );

  const combined: GameScore[] = [
    ...real.map(
      (entry): GameScore => ({
        id: entry.id,
        user_id: entry.user_id,
        username: getPublicUsername(entry.username, entry.user_id),
        game: entry.game,
        score: entry.score,
        multiplier: entry.multiplier,
        bet_amount: entry.bet_amount,
        played_at: entry.played_at,
      }),
    ),
    ...fakeCandidates,
  ];

  combined.sort((a, b) => Number(b.score) - Number(a.score));

  const capped = combined.slice(0, 50);
  return rankScores(capped);
}

export function getFakeLeaderboardStats(): {
  gamesToday: number;
  highestMultiplierEver: number;
  activePlayers: number;
} {
  const pool = getFakeLeaderboardPool();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const gamesToday = pool.filter(
    (s) => new Date(s.played_at).getTime() >= todayMs,
  ).length;

  const highestMultiplierEver = Math.max(...pool.map((s) => Number(s.multiplier)));

  return {
    gamesToday: Math.max(gamesToday, 8),
    highestMultiplierEver,
    activePlayers: 50,
  };
}
