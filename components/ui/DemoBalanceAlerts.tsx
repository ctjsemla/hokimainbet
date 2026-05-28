"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { resetDemoBalance } from "@/lib/balance";
import { cn } from "@/lib/utils";

interface DemoBalanceAlertsProps {
  className?: string;
  align?: "left" | "right" | "center";
}

export function DemoBalanceAlerts({
  className,
  align = "left",
}: DemoBalanceAlertsProps) {
  const t = useTranslations("balance");
  const { user, balance, refreshBalance, setDemoBalance } = useAuth();
  const [resetting, setResetting] = useState(false);

  if (!user) return null;

  const alignClass =
    align === "right"
      ? "text-right items-end"
      : align === "center"
        ? "text-center items-center"
        : "text-left items-start";

  async function handleReset() {
    if (!user || resetting) return;
    setResetting(true);
    try {
      const next = await resetDemoBalance(user.id);
      setDemoBalance(next);
      await refreshBalance();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", alignClass, className)}>
      {balance > 0 && balance < 50 && (
        <p className="text-xs text-orange-400">{t("lowBalance")}</p>
      )}
      {balance <= 0 && (
        <button
          type="button"
          onClick={handleReset}
          disabled={resetting}
          className="text-xs font-medium text-orange-400 underline-offset-2 transition hover:text-orange-300 hover:underline disabled:opacity-60"
        >
          {resetting ? t("resetting") : t("resetDemo")}
        </button>
      )}
    </div>
  );
}
