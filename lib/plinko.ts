export type RiskLevel = "low" | "medium" | "high";
export type RowCount = 8 | 12 | 16;
export type PlinkoDirection = "L" | "R";

export const ROW_OPTIONS: RowCount[] = [8, 12, 16];

export const MULTIPLIERS: Record<RowCount, Record<RiskLevel, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  12: {
    low: [10, 4, 2.2, 1.5, 1.1, 0.8, 0.5, 0.8, 1.1, 1.5, 2.2, 4, 10],
    medium: [25, 8, 3.5, 1.8, 1, 0.5, 0.3, 0.5, 1, 1.8, 3.5, 8, 25],
    high: [55, 12, 5, 2, 0.5, 0.2, 0.1, 0.2, 0.5, 2, 5, 12, 55],
  },
  16: {
    low: [16, 9, 2.5, 1.8, 1.2, 1, 0.7, 0.5, 0.4, 0.5, 0.7, 1, 1.2, 1.8, 2.5, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
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
