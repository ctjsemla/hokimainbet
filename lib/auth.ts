import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/types/database.types";
import { DEMO_WELCOME_BALANCE } from "@/lib/balance";

const AUTH_TIMEOUT_MS = 12_000;

function withAuthTimeout<T>(promise: PromiseLike<T>): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("AUTH_TIMEOUT")), AUTH_TIMEOUT_MS);
    }),
  ]);
}

function getClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    );
  }
  return createBrowserClient();
}

async function ensureProfile(
  userId: string,
  usernameSeed?: string | null,
): Promise<void> {
  const supabase = getClient();
  const fallbackUsername = `user_${userId.slice(0, 8)}`;
  const username = (usernameSeed?.trim() || fallbackUsername).slice(0, 20);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username,
      demo_balance: DEMO_WELCOME_BALANCE,
    },
    { onConflict: "id" },
  );

  // Never block auth flow if profile already exists or policy rejects after creation.
  if (error && error.code !== "23505") {
    console.warn("ensure profile skipped:", error.message);
  }
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  subscribeEmail: boolean,
) {
  const supabase = getClient();

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
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
        email: normalizedEmail,
      });

    // Newsletter opt-in should never block successful account creation.
    if (subscribeError && subscribeError.code !== "23505") {
      console.warn("newsletter subscribe skipped:", subscribeError.message);
    }
  }

  if (data.session) {
    void ensureProfile(data.user.id, username);
    return data;
  }

  // Force immediate session for demo-mode onboarding.
  const { data: signInData, error: signInError } = await withAuthTimeout(
    supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    }),
  );

  if (!signInError && signInData.session) {
    void ensureProfile(data.user.id, username);
    return signInData;
  }
  if (signInError) throw signInError;
  throw new Error("Auto-login failed after sign up");
}

export async function signIn(email: string, password: string) {
  const supabase = getClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await withAuthTimeout(
    supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    }),
  );

  if (error) throw error;
  if (data.user) {
    const username = (data.user.user_metadata?.username as string | undefined) ?? null;
    void ensureProfile(data.user.id, username);
  }
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
