import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export const DEMO_WELCOME_BALANCE = 1000;

export async function updateDemoBalance(userId: string, balance: number) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ demo_balance: balance })
    .eq("id", userId);

  if (error) throw error;
}

export async function resetDemoBalance(userId: string) {
  await updateDemoBalance(userId, DEMO_WELCOME_BALANCE);
  return DEMO_WELCOME_BALANCE;
}
