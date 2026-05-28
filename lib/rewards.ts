import { addDemoBalance } from "@/lib/balance";
import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export type RewardWindow = "ten_min" | "hourly" | "daily" | "weekly";

export interface RewardWindowConfig {
  window: RewardWindow;
  label: string;
  amount: number;
  cooldownMs: number;
}

export interface RewardWindowState extends RewardWindowConfig {
  remainingMs: number;
  canClaim: boolean;
}

export interface WheelPrize {
  id: string;
  label: string;
  type: "coins" | "item";
  amount: number;
  rarity: "common" | "rare" | "epic";
}

export interface DailyStreakState {
  nextDay: number;
  rewardAmount: number;
  canClaim: boolean;
  remainingMs: number;
  totalClaims: number;
}

export const REWARD_WINDOWS: RewardWindowConfig[] = [
  { window: "ten_min", label: "10m", amount: 30, cooldownMs: 10 * 60 * 1000 },
  { window: "hourly", label: "1h", amount: 120, cooldownMs: 60 * 60 * 1000 },
  { window: "daily", label: "24h", amount: 500, cooldownMs: 24 * 60 * 60 * 1000 },
  { window: "weekly", label: "7d", amount: 3000, cooldownMs: 7 * 24 * 60 * 60 * 1000 },
];

export const WHEEL_PRIZES: WheelPrize[] = [
  { id: "c-25", label: "25 Coins", type: "coins", amount: 25, rarity: "common" },
  { id: "c-50", label: "50 Coins", type: "coins", amount: 50, rarity: "common" },
  { id: "c-100", label: "100 Coins", type: "coins", amount: 100, rarity: "common" },
  { id: "c-150", label: "150 Coins", type: "coins", amount: 150, rarity: "common" },
  { id: "c-300", label: "300 Coins", type: "coins", amount: 300, rarity: "rare" },
  { id: "c-500", label: "500 Coins", type: "coins", amount: 500, rarity: "rare" },
  { id: "c-1000", label: "1,000 Coins", type: "coins", amount: 1000, rarity: "epic" },
  { id: "c-2500", label: "2,500 Coins", type: "coins", amount: 2500, rarity: "epic" },
  { id: "vip-box", label: "VIP Box", type: "item", amount: 0, rarity: "epic" },
  { id: "iphone", label: "iPhone Drop", type: "item", amount: 0, rarity: "epic" },
];

export const DAILY_STREAK_REWARDS = [100, 300, 475, 600, 695, 775, 845, 900, 950];
const DAILY_STREAK_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DAILY_STREAK_RESET_MS = 48 * 60 * 60 * 1000;

function getPeriodKey(window: RewardWindow, now = new Date()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const tenMinBucket = Math.floor(now.getUTCMinutes() / 10);

  if (window === "ten_min") return `${year}-${month}-${day}-${hour}-${tenMinBucket}`;
  if (window === "hourly") return `${year}-${month}-${day}-${hour}`;
  if (window === "daily") return `${year}-${month}-${day}`;

  const start = new Date(now);
  const weekday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - weekday);
  return `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}-${String(start.getUTCDate()).padStart(2, "0")}`;
}

function assertSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }
}

function getNextStreakDay(currentDay: number): number {
  return currentDay >= DAILY_STREAK_REWARDS.length ? 1 : currentDay + 1;
}

export async function getRewardWindowStates(userId: string): Promise<RewardWindowState[]> {
  const now = Date.now();
  if (!isSupabaseConfigured) {
    return REWARD_WINDOWS.map((row) => ({ ...row, canClaim: false, remainingMs: row.cooldownMs }));
  }

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("coin_reward_claims")
    .select("reward_window, claimed_at")
    .eq("user_id", userId)
    .order("claimed_at", { ascending: false });

  if (error) throw error;

  return REWARD_WINDOWS.map((config) => {
    const latest = (data ?? []).find((d) => d.reward_window === config.window);
    if (!latest?.claimed_at) return { ...config, canClaim: true, remainingMs: 0 };
    const nextAt = new Date(latest.claimed_at).getTime() + config.cooldownMs;
    const remainingMs = Math.max(0, nextAt - now);
    return { ...config, remainingMs, canClaim: remainingMs === 0 };
  });
}

export async function claimTimedReward(userId: string, window: RewardWindow) {
  assertSupabase();
  const config = REWARD_WINDOWS.find((row) => row.window === window);
  if (!config) throw new Error("Unknown reward window");

  const periodKey = getPeriodKey(window);
  const supabase = createBrowserClient();
  const { error: insertError } = await supabase.from("coin_reward_claims").insert({
    user_id: userId,
    reward_window: window,
    period_key: periodKey,
    amount: config.amount,
  });

  if (insertError) throw insertError;

  const balance = await addDemoBalance(userId, config.amount);
  return { amount: config.amount, balance };
}

export async function getDailyStreakState(
  userId: string,
): Promise<DailyStreakState> {
  if (!isSupabaseConfigured) {
    return {
      nextDay: 1,
      rewardAmount: DAILY_STREAK_REWARDS[0],
      canClaim: false,
      remainingMs: DAILY_STREAK_COOLDOWN_MS,
      totalClaims: 0,
    };
  }

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("coin_daily_streaks")
    .select("next_day,last_claimed_at,total_claims")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  const nextDayBase = Math.min(
    Math.max(Number(data?.next_day ?? 1), 1),
    DAILY_STREAK_REWARDS.length,
  );
  const totalClaims = Number(data?.total_claims ?? 0);
  const lastClaimedAt = data?.last_claimed_at
    ? new Date(data.last_claimed_at).getTime()
    : null;

  if (!lastClaimedAt) {
    return {
      nextDay: nextDayBase,
      rewardAmount: DAILY_STREAK_REWARDS[nextDayBase - 1],
      canClaim: true,
      remainingMs: 0,
      totalClaims,
    };
  }

  const elapsed = Date.now() - lastClaimedAt;
  if (elapsed >= DAILY_STREAK_RESET_MS) {
    return {
      nextDay: 1,
      rewardAmount: DAILY_STREAK_REWARDS[0],
      canClaim: true,
      remainingMs: 0,
      totalClaims,
    };
  }

  const canClaim = elapsed >= DAILY_STREAK_COOLDOWN_MS;
  const remainingMs = canClaim
    ? 0
    : DAILY_STREAK_COOLDOWN_MS - elapsed;

  return {
    nextDay: nextDayBase,
    rewardAmount: DAILY_STREAK_REWARDS[nextDayBase - 1],
    canClaim,
    remainingMs,
    totalClaims,
  };
}

export async function claimDailyStreak(userId: string) {
  assertSupabase();
  const state = await getDailyStreakState(userId);
  if (!state.canClaim) {
    throw new Error("Daily streak cooldown active");
  }

  const claimedDay = state.nextDay;
  const amount = DAILY_STREAK_REWARDS[claimedDay - 1];
  const nextDay = getNextStreakDay(claimedDay);
  const supabase = createBrowserClient();

  const { error } = await supabase.from("coin_daily_streaks").upsert(
    {
      user_id: userId,
      next_day: nextDay,
      last_claimed_at: new Date().toISOString(),
      total_claims: state.totalClaims + 1,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;

  const balance = await addDemoBalance(userId, amount);
  return { claimedDay, amount, balance };
}

export function pickWheelPrize(): WheelPrize {
  // Keep item prizes in the wheel catalog for future campaigns,
  // but current drop policy is coin-only (item probability = 0).
  const coinPrizes = WHEEL_PRIZES.filter((row) => row.type === "coins");
  const roll = Math.random();
  if (roll < 0.68) return coinPrizes[Math.floor(Math.random() * 4)];
  if (roll < 0.94) return coinPrizes[4 + Math.floor(Math.random() * 2)];
  return coinPrizes[6 + Math.floor(Math.random() * 2)];
}

export async function spinRewardWheel(userId: string) {
  assertSupabase();
  const prize = pickWheelPrize();
  const supabase = createBrowserClient();

  const { error: insertError } = await supabase.from("coin_wheel_spins").insert({
    user_id: userId,
    prize_id: prize.id,
    prize_label: prize.label,
    prize_type: prize.type,
    coin_amount: prize.amount,
  });
  if (insertError) throw insertError;

  let balance: number | null = null;
  if (prize.type === "coins" && prize.amount > 0) {
    balance = await addDemoBalance(userId, prize.amount);
  }

  return { prize, balance };
}
