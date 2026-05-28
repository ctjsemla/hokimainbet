import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/types/database.types";

function getClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    );
  }
  return createBrowserClient();
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  subscribeEmail: boolean,
) {
  const supabase = getClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Registration failed");

  if (subscribeEmail) {
    const { error: subscribeError } = await supabase
      .from("email_subscribers")
      .insert({
        user_id: data.user.id,
        email,
      });

    if (subscribeError && subscribeError.code !== "23505") {
      throw subscribeError;
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = getClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const supabase = getClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function getUserProfile(userId?: string): Promise<Profile | null> {
  const supabase = getClient();

  let id = userId;
  if (!id) {
    const user = await getUser();
    if (!user) return null;
    id = user.id;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
