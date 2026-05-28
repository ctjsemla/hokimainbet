export function generateCrashPoint(): number {
  const e = 2 ** 32;
  const h = Math.floor(Math.random() * e);
  if (h % 33 === 0) return 1.0;
  const crashPoint = Math.max(1.01, (100 * e - h) / (e - h) / 100);
  return Math.min(parseFloat(crashPoint.toFixed(2)), 20);
}

export function tickCrashMultiplier(current: number): number {
  const growth = current * 0.02 * Math.random();
  return Math.round((current + growth) * 100) / 100;
}
