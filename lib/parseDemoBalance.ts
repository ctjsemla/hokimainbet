import { DEMO_WELCOME_BALANCE } from "@/lib/balance";
import type { Profile } from "@/types/database.types";

export function parseDemoBalance(
  profile: Pick<Profile, "demo_balance"> | null | undefined,
): number {
  if (!profile) return DEMO_WELCOME_BALANCE;
  const value = Number(profile.demo_balance);
  return Number.isFinite(value) ? value : DEMO_WELCOME_BALANCE;
}
