"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateDemoBalance } from "@/lib/balance";

export function usePersistDemoBalance() {
  const { user, balance, setDemoBalance, refreshBalance } = useAuth();

  const persistBalance = useCallback(
    async (newBalance: number) => {
      setDemoBalance(newBalance);
      if (user) {
        await updateDemoBalance(user.id, newBalance);
        await refreshBalance();
      }
    },
    [user, setDemoBalance, refreshBalance],
  );

  return { balance, persistBalance, refreshBalance };
}
