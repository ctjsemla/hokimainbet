"use client";

import { useCallback, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DEMO_WELCOME_BALANCE,
  scheduleDemoBalanceSync,
} from "@/lib/balance";

const DEMO_BALANCE_STORAGE_KEY = "hokimainbet.demoBalance";

function normalizeBalance(value: number): number {
  return Math.max(0, Math.round(value * 100) / 100);
}

function readStoredBalance(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_BALANCE_STORAGE_KEY);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? normalizeBalance(parsed) : null;
  } catch {
    return null;
  }
}

function writeStoredBalance(value: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_BALANCE_STORAGE_KEY, String(value));
  } catch {
    // Ignore storage failures and keep in-memory demo play working.
  }
}

export function usePersistDemoBalance() {
  const { user, balance, setDemoBalance, refreshBalance } = useAuth();

  useEffect(() => {
    if (user) return;
    const stored = readStoredBalance();
    if (stored !== null) {
      setDemoBalance(stored);
      return;
    }
    setDemoBalance(DEMO_WELCOME_BALANCE);
    writeStoredBalance(DEMO_WELCOME_BALANCE);
  }, [user, setDemoBalance]);

  const persistBalance = useCallback(
    async (newBalance: number) => {
      const normalized = normalizeBalance(newBalance);
      setDemoBalance(normalized);
      writeStoredBalance(normalized);

      if (user) {
        scheduleDemoBalanceSync(user.id, normalized);
      }
    },
    [user, setDemoBalance],
  );

  return { balance, persistBalance, refreshBalance };
}
