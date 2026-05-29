export type RiskLevel = "low" | "medium" | "high";
export type RowCount = 8 | 12 | 16;
export type PlinkoDirection = "L" | "R";

export const ROW_OPTIONS: RowCount[] = [8, 12, 16];

export const MULTIPLIERS: Record<RowCount, Record<RiskLevel, number[]>> = {
  8: {
    low: [6.3, 2.4, 1.2, 1.1, 0.8, 1.1, 1.2, 2.4, 6.3],
    medium: [15, 3.4, 1.5, 0.9, 0.65, 0.9, 1.5, 3.4, 15],
    high: [32, 4.5, 1.7, 0.5, 0.35, 0.5, 1.7, 4.5, 32],
  },
  12: {
    low: [11, 4.5, 2.5, 1.7, 1.25, 0.95, 0.75, 0.95, 1.25, 1.7, 2.5, 4.5, 11],
    medium: [28, 9, 4, 2.1, 1.15, 0.65, 0.45, 0.65, 1.15, 2.1, 4, 9, 28],
    high: [62, 14, 5.7, 2.3, 0.65, 0.35, 0.2, 0.35, 0.65, 2.3, 5.7, 14, 62],
  },
  16: {
    low: [18, 10, 2.9, 2, 1.4, 1.15, 0.85, 0.65, 0.55, 0.65, 0.85, 1.15, 1.4, 2, 2.9, 10, 18],
    medium: [124, 46, 11.5, 5.7, 3.4, 1.7, 1.15, 0.65, 0.45, 0.65, 1.15, 1.7, 3.4, 5.7, 11.5, 46, 124],
    high: [1100, 145, 29, 10, 4.6, 2.3, 0.45, 0.35, 0.35, 0.35, 0.35, 2.3, 4.6, 10, 29, 145, 1100],
  },
};

export interface PegPosition extends PlinkoPoint {
  row: number;
  col: number;
}

export interface PlinkoPoint {
  x: number;
  y: number;
}

export function generatePath(rows: number): PlinkoDirection[] {
  return Array.from({ length: rows }, () =>
    Math.random() < 0.5 ? "L" : "R",
  );
}

export function getSlotIndex(path: PlinkoDirection[]): number {
  return path.filter((d) => d === "R").length;
}

export function getDropDurationMs(rows: number): number {
  return Math.round((2000 * rows) / 8);
}

export function formatMultiplier(mult: number): string {
  if (mult >= 100) return `${Math.round(mult)}x`;
  if (mult >= 10) return `${mult.toFixed(0)}x`;
  return `${mult.toFixed(1)}x`;
}

export function getPegFlashKey(
  rows: number,
  path: PlinkoDirection[],
  row: number,
): string {
  let slot = 0;
  for (let r = 0; r < row; r++) {
    if (path[r] === "R") slot += 1;
  }
  const dir = path[row];
  const pegsInRow = row + 1;
  const pegCol = dir === "R" ? Math.min(slot + 1, pegsInRow - 1) : slot;
  return `${row}-${pegCol}`;
}

export function resolvePlinkoDrop(
  rows: number,
  multipliers: number[],
  width: number,
  height: number,
): {
  path: PlinkoDirection[];
  slotIndex: number;
  multiplier: number;
  waypoints: PlinkoPoint[];
} {
  const path = generatePath(rows);
  const slotIndex = getSlotIndex(path);
  const { waypoints } = computeWaypoints(rows, path, width, height);

  return {
    path,
    slotIndex,
    multiplier: multipliers[slotIndex],
    waypoints,
  };
}

export function computeWaypoints(
  rows: number,
  path: PlinkoDirection[],
  width: number,
  height: number,
): { waypoints: PlinkoPoint[]; slotIndex: number } {
  const paddingX = 28;
  const startY = 28;
  const endY = height - 72;
  const rowStep = (endY - startY) / (rows + 1);
  const slotCount = rows + 1;

  let slot = 0;
  const waypoints: PlinkoPoint[] = [{ x: width / 2, y: startY }];

  for (let r = 0; r < rows; r++) {
    const dir = path[r];
    const bounceY = startY + (r + 1) * rowStep;
    const pegsInRow = r + 1;
    const pegCol = dir === "R" ? Math.min(slot + 1, pegsInRow - 1) : slot;
    const pegX =
      paddingX + ((pegCol + 0.5) * (width - paddingX * 2)) / pegsInRow;

    waypoints.push({ x: pegX, y: bounceY - 5 });

    if (dir === "R") slot += 1;

    const afterX =
      paddingX + ((slot + 0.5) * (width - paddingX * 2)) / (r + 2);
    waypoints.push({ x: afterX, y: bounceY + 5 });
  }

  const finalX =
    paddingX + ((slot + 0.5) * (width - paddingX * 2)) / slotCount;
  waypoints.push({ x: finalX, y: endY });

  const slotIndex = getSlotIndex(path);
  return { waypoints, slotIndex };
}

export function getSlotFill(multiplier: number): string {
  if (multiplier >= 5) return "#22c55e";
  if (multiplier >= 1) return "#f97316";
  return "#ef4444";
}

export function getPegPositions(
  rows: number,
  width: number,
  height: number,
): PegPosition[] {
  const paddingX = 28;
  const startY = 28;
  const endY = height - 72;
  const rowStep = (endY - startY) / (rows + 1);
  const pegs: PegPosition[] = [];

  for (let r = 0; r < rows; r++) {
    const pegsInRow = r + 1;
    for (let c = 0; c < pegsInRow; c++) {
      pegs.push({
        row: r,
        col: c,
        x: paddingX + ((c + 0.5) * (width - paddingX * 2)) / pegsInRow,
        y: startY + (r + 1) * rowStep,
      });
    }
  }

  return pegs;
}
