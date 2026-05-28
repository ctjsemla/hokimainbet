export const KENO_GRID_SIZE = 40;
export const KENO_DRAW_COUNT = 10;
export const KENO_MAX_PICKS = 10;
export const KENO_MIN_PICKS = 1;
export const KENO_DRAW_INTERVAL_MS = 300;

/** Multipliers by match count (index = matches) for each pick count. */
export const KENO_PAYOUT_TABLES: Record<number, readonly number[]> = {
  1: [0, 3.5],
  2: [0, 0, 9],
  3: [0, 0, 2, 46],
  4: [0, 0, 1, 4, 91],
  5: [0, 0, 0.5, 2, 12, 200],
  6: [0, 0, 0.5, 1, 5, 40, 400],
  7: [0, 0, 0.3, 0.7, 2, 15, 80, 600],
  8: [0, 0, 0.3, 0.5, 1.5, 5, 25, 150, 800],
  9: [0, 0.1, 0.2, 0.5, 1, 3, 10, 50, 250, 900],
  10: [0, 0.1, 0.3, 0.7, 1.5, 3, 8, 20, 80, 200, 1000],
};

export const KENO_NUMBERS = Array.from(
  { length: KENO_GRID_SIZE },
  (_, i) => i + 1,
);

export type KenoPhase = "picking" | "drawing" | "result";

export function getKenoMultiplier(
  pickCount: number,
  matchCount: number,
): number {
  const table = KENO_PAYOUT_TABLES[pickCount];
  if (!table || matchCount < 0 || matchCount >= table.length) return 0;
  return table[matchCount];
}

export function drawKenoNumbers(): number[] {
  const pool = [...KENO_NUMBERS];
  const drawn: number[] = [];

  for (let i = 0; i < KENO_DRAW_COUNT; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    drawn.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return drawn;
}

export function countKenoMatches(
  selected: readonly number[],
  drawn: readonly number[],
): number {
  const drawnSet = new Set(drawn);
  return selected.filter((n) => drawnSet.has(n)).length;
}

export function formatKenoMultiplier(multiplier: number): string {
  if (multiplier === 0) return "0x";
  if (multiplier >= 100) return `${Math.round(multiplier)}x`;
  if (Number.isInteger(multiplier)) return `${multiplier}x`;
  return `${multiplier.toFixed(1)}x`;
}

export function shuffleDrawOrder(numbers: readonly number[]): number[] {
  const order = [...numbers];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
