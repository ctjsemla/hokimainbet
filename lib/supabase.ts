import {
  createBrowserClient as createSupabaseBrowserClient,
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database.types";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * Browser-only Supabase client. Use only in `'use client'` components/hooks.
 * Server code should use `createServerClient` in middleware or route handlers.
 */
export function createBrowserClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    );
  }

  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
