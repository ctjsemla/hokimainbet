"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUserProfile, signOut as authSignOut } from "@/lib/auth";
import { DEMO_WELCOME_BALANCE } from "@/lib/balance";
import { parseDemoBalance } from "@/lib/parseDemoBalance";
import { createBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/types/database.types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  balance: number;
  /** @deprecated Use `balance` */
  demoBalance: number;
  loading: boolean;
  setDemoBalance: (balance: number) => void;
  refreshBalance: () => Promise<void>;
  /** @deprecated Use `refreshBalance` */
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfileForUser(userId: string): Promise<Profile | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balance, setBalance] = useState(DEMO_WELCOME_BALANCE);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const applyProfile = useCallback((nextProfile: Profile | null) => {
    setProfile(nextProfile);
    setBalance(parseDemoBalance(nextProfile));
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!isSupabaseConfigured || !mounted) return;

    try {
      const nextProfile = await getUserProfile();
      applyProfile(nextProfile);
    } catch {
      setProfile(null);
      setBalance(DEMO_WELCOME_BALANCE);
    }
  }, [applyProfile, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isSupabaseConfigured) {
      if (!isSupabaseConfigured) {
        setLoading(false);
      }
      return;
    }

    const supabase = createBrowserClient();

    const syncSession = async (session: Session | null) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        try {
          const profileData = await fetchProfileForUser(nextUser.id);
          applyProfile(profileData);
        } catch {
          applyProfile(null);
        }
      } else {
        applyProfile(null);
      }

      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void syncSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        await syncSession(session);
      },
    );

    return () => subscription.unsubscribe();
  }, [applyProfile, mounted]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await authSignOut();
    }
    setUser(null);
    applyProfile(null);
  }, [applyProfile]);

  const setDemoBalance = useCallback((nextBalance: number) => {
    setBalance(nextBalance);
  }, []);

  const value = useMemo(
    () => ({
      user: mounted ? user : null,
      profile: mounted ? profile : null,
      balance,
      demoBalance: balance,
      loading: !mounted || loading,
      setDemoBalance,
      refreshBalance,
      refreshProfile: refreshBalance,
      signOut,
    }),
    [
      user,
      profile,
      balance,
      loading,
      mounted,
      refreshBalance,
      signOut,
      setDemoBalance,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
