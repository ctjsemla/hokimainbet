export type WheelRisk = "low" | "medium" | "high";

export type WheelSegmentCount = 10 | 20 | 30 | 40 | 50;

export const WHEEL_SEGMENT_OPTIONS: WheelSegmentCount[] = [
  10, 20, 30, 40, 50,
];

export const WHEEL_BASE_MULTIPLIERS: Record<
  WheelRisk,
  readonly number[]
> = {
  low: [2, 5, 2, 1, 5, 2, 1, 2, 5, 10],
  medium: [5, 1, 2, 1, 10, 1, 2, 1, 5, 2],
  high: [1, 1, 2, 10, 1, 1, 2, 5, 1, 10],
};

export function buildWheelMultipliers(
  risk: WheelRisk,
  segmentCount: WheelSegmentCount,
): number[] {
  const base = WHEEL_BASE_MULTIPLIERS[risk];
  const repeats = segmentCount / 10;
  return Array.from({ length: repeats }, () => [...base]).flat();
}

export function pickWheelSegmentIndex(segmentCount: number): number {
  return Math.floor(Math.random() * segmentCount);
}

/** Clockwise rotation (deg) so segment `targetIndex` centers on the bottom pointer. */
export function computeLandingRotation(
  targetIndex: number,
  segmentCount: number,
  currentRotation: number,
  minSpins = 3,
): number {
  const segmentAngle = 360 / segmentCount;
  const segmentCenter = (targetIndex + 0.5) * segmentAngle;
  const targetOffset = 180 - segmentCenter;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  let delta = targetOffset - currentMod;
  if (delta <= 0) delta += 360;
  return currentRotation + minSpins * 360 + delta;
}

export function formatWheelMultiplier(multiplier: number): string {
  if (multiplier === 0) return "0x";
  return `${multiplier}x`;
}

export interface SegmentVisualStyle {
  fill: string;
  glow: boolean;
}

export function getSegmentVisualStyle(multiplier: number): SegmentVisualStyle {
  if (multiplier === 0) {
    return { fill: "#0a1628", glow: false };
  }
  if (multiplier <= 2) {
    return { fill: "#1a3360", glow: false };
  }
  if (multiplier <= 5) {
    return { fill: "#7c3a00", glow: false };
  }
  return { fill: "#f97316", glow: true };
}

export const WHEEL_COOLDOWN_MS = 1000;
export const WHEEL_RESULT_CLEAR_MS = 3000;

export const WHEEL_IDLE_RPM = 0.5;
export const WHEEL_HIGHLIGHT_GOLD = "#fbbf24";

export const WHEEL_SPIN_EASE = [0.17, 0.67, 0.12, 0.99] as const;
export const WHEEL_SPIN_DURATION_S = 4;
export const WHEEL_MIN_SPINS = 3;
