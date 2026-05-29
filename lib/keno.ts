export const KENO_GRID_SIZE = 40;
export const KENO_DRAW_COUNT = 10;
export const KENO_MAX_PICKS = 10;
export const KENO_MIN_PICKS = 1;
export const KENO_DRAW_INTERVAL_MS = 300;

/** Multipliers by match count (index = matches) for each pick count. */
export const KENO_PAYOUT_TABLES: Record<number, readonly number[]> = {
  1: [0, 4.5],
  2: [0, 1, 12],
  3: [0, 0, 2.5, 62],
  4: [0, 0, 1.5, 5.5, 123],
  5: [0, 0, 0.8, 2.7, 16, 270],
  6: [0, 0, 0.8, 1.5, 6.7, 54, 540],
  7: [0, 0, 0.5, 1, 2.7, 20, 108, 810],
  8: [0, 0, 0.5, 0.7, 2, 6.7, 34, 200, 1080],
  9: [0, 0.3, 0.5, 0.7, 1.4, 4, 14, 67, 340, 1215],
  10: [0, 0.3, 0.5, 1, 2, 4, 11, 27, 108, 270, 1350],
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
