import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

/** Promo arena — BC.Game & Rollbit links live here only. */
export const PROMO_PAGE_HREF = "/bonus";

/** @deprecated Use PROMO_PAGE_HREF */
export const AFFILIATE_HREF = PROMO_PAGE_HREF;

export type BonusType =
  | "welcome"
  | "weekly_reload"
  | "rakeback"
  | "vip"
  | "referral"
  | "sports"
  | "sticky_mobile"
  | "hero_countdown"
  | "featured_slider";

export function buildReferralLink(username?: string | null): string {
  if (!username) return PROMO_PAGE_HREF;
  return `${PROMO_PAGE_HREF}?ref=${encodeURIComponent(username)}`;
}

export async function trackAffiliateClick(
  bonusType: BonusType,
  locale: string,
  userId?: string | null,
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const supabase = createBrowserClient();
    await supabase.from("affiliate_clicks").insert({
      bonus_type: bonusType,
      locale,
      user_id: userId ?? null,
      clicked_at: new Date().toISOString(),
    });
  } catch {
    // Tracking must not block navigation
  }
}

export function getNextMondayReset(from = new Date()): Date {
  const target = new Date(from);
  target.setHours(0, 0, 0, 0);

  const day = target.getDay();
  let daysUntilMonday = (1 - day + 7) % 7;
  if (daysUntilMonday === 0) {
    daysUntilMonday = 7;
  }

  target.setDate(target.getDate() + daysUntilMonday);
  return target;
}
