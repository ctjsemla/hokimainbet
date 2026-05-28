/** Indonesian-style demo coin display (e.g. 1.000) */
export function formatDemoCoins(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return safe.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return rounded.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatMultiplier(value: number): string {
  if (value >= 100) return `${Math.round(value)}x`;
  if (value >= 10) return `${value.toFixed(1)}x`;
  return `${value.toFixed(2)}x`;
}
