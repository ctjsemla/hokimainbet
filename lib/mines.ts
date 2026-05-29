import { PLAYER_RETURN_FACTOR } from "@/lib/gameEconomy";

const GRID_SIZE = 5;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;
const HOUSE_EDGE = PLAYER_RETURN_FACTOR;

export function generateMines(mineCount: number): Set<number> {
  const indices = Array.from({ length: TOTAL_TILES }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, mineCount));
}

/**
 * Multiplier after each safe reveal — floors at 1.10x on first gem,
 * then compounds with accelerated growth for later picks.
 */
export function calculateMinesMultiplier(
  mineCount: number,
  safeReveals: number,
): number {
  if (safeReveals <= 0) return 1;

  const totalSafe = TOTAL_TILES - mineCount;
  let mult = 1;

  for (let k = 1; k <= safeReveals; k++) {
    const remainingTiles = TOTAL_TILES - (k - 1);
    const remainingSafe = totalSafe - (k - 1);
    const stepOdds = (remainingTiles / remainingSafe) * HOUSE_EDGE;
    const acceleration = 1 + (k - 1) * 0.14;
    mult *= stepOdds * acceleration;
  }

  const progressiveFloor = 1.15 + (safeReveals - 1) * (0.2 + 24 / mineCount / 10);
  mult = Math.max(mult, progressiveFloor);

  return Math.round(mult * 100) / 100;
}

export { TOTAL_TILES };
