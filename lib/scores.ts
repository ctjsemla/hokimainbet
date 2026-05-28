import { getUser, getUserProfile } from "@/lib/auth";
import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { GameScore, GameType } from "@/types/database.types";

function getClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }
  return createBrowserClient();
}

export async function saveScore(
  game: GameType,
  multiplier: number,
  betAmount: number,
  score: number,
) {
  try {
    const supabase = getClient();
    const user = await getUser();

    if (!user) {
      return null;
    }

    const profile = await getUserProfile(user.id);

    if (!profile) {
      return null;
    }

    const { data, error } = await supabase
      .from("game_scores")
      .insert({
        user_id: user.id,
        username: profile.username,
        game,
        score,
        multiplier,
        bet_amount: betAmount,
      })
      .select()
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getLeaderboard(game: GameType, limit = 10) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("game_scores")
    .select("*")
    .eq("game", game)
    .order("multiplier", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as GameScore[];
}

export async function getUserScores(userId: string) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("game_scores")
    .select("*")
    .eq("user_id", userId)
    .order("played_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GameScore[];
}
