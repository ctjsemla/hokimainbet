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

const REMOTE_SYNC_TIMEOUT_MS = 5000;

/** Fire-and-forget profile sync; never blocks gameplay UI. */
export function scheduleDemoBalanceSync(userId: string, balance: number) {
  if (!isSupabaseConfigured) return;

  const normalized = Math.max(0, Math.round(balance * 100) / 100);

  void (async () => {
    try {
      await Promise.race([
        updateDemoBalance(userId, normalized),
        new Promise<void>((_, reject) => {
          setTimeout(
            () => reject(new Error("demo balance sync timeout")),
            REMOTE_SYNC_TIMEOUT_MS,
          );
        }),
      ]);
    } catch {
      // Demo play must continue even if remote sync fails or stalls.
    }
  })();
}

export async function resetDemoBalance(userId: string) {
  await updateDemoBalance(userId, DEMO_WELCOME_BALANCE);
  return DEMO_WELCOME_BALANCE;
}

export async function getDemoBalance(userId: string): Promise<number> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("demo_balance")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return Number(data?.demo_balance ?? DEMO_WELCOME_BALANCE);
}

export async function addDemoBalance(
  userId: string,
  delta: number,
): Promise<number> {
  const current = await getDemoBalance(userId);
  const next = Math.max(0, Math.round((current + delta) * 100) / 100);
  await updateDemoBalance(userId, next);
  return next;
}
