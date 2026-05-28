export function formatTimeAgo(
  isoDate: string,
  locale: string,
): string {
  const date = new Date(isoDate);
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale === "en" ? "en" : "id", {
    numeric: "auto",
  });

  if (diffSec < 60) return rtf.format(-diffSec, "second");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, "hour");
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return rtf.format(-diffDay, "day");
  const diffWeek = Math.floor(diffDay / 7);
  return rtf.format(-diffWeek, "week");
}
