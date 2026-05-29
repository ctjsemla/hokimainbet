export function generateCrashPoint(): number {
  const e = 2 ** 32;
  const h = Math.floor(Math.random() * e);
  // ~1.5% instant bust (was ~3% at mod 33) — smoother demo sessions
  if (h % 66 === 0) return 1.0;
  const raw = Math.max(1.01, (100 * e - h) / (e - h) / 100);
  const boosted = Math.min(parseFloat((raw * 1.08).toFixed(2)), 20);
  return boosted;
}

export function tickCrashMultiplier(current: number): number {
  const growth = current * 0.02 * Math.random();
  return Math.round((current + growth) * 100) / 100;
}
