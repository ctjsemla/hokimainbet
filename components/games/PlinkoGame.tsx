"use client";

import { AnimatePresence, m } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlinkoBoard, BOARD_HEIGHT, BOARD_WIDTH } from "@/components/games/PlinkoBoard";
import { GamePageShell } from "@/components/games/GamePageShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DemoBalanceAlerts } from "@/components/ui/DemoBalanceAlerts";
import { usePersistDemoBalance } from "@/hooks/usePersistDemoBalance";
import {
  MULTIPLIERS,
  ROW_OPTIONS,
  formatMultiplier,
  getDropDurationMs,
  getPegFlashKey,
  resolvePlinkoDrop,
  type RiskLevel,
  type RowCount,
} from "@/lib/plinko";
import { saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

interface ActiveBall {
  id: string;
  waypoints: { x: number; y: number }[];
  duration: number;
  slotIndex: number;
  multiplier: number;
  bet: number;
}

interface ResultHistory {
  id: string;
  multiplier: number;
}

const MIN_BET = 10;
const MAX_BALLS = 5;
const DROP_COOLDOWN_MS = 500;
const AUTO_DROP_MS = 1500;

export function PlinkoGame() {
  const t = useTranslations("plinko");
  const { user } = useAuth();
  const { balance, persistBalance: syncBalance } = usePersistDemoBalance();

  const [betAmount, setBetAmount] = useState(50);
  const [risk, setRisk] = useState<RiskLevel>("medium");
  const [rows, setRows] = useState<RowCount>(8);
  const [autoMode, setAutoMode] = useState(false);
  const [activeBalls, setActiveBalls] = useState<ActiveBall[]>([]);
  const [history, setHistory] = useState<ResultHistory[]>([]);
  const [betError, setBetError] = useState<string | null>(null);
  const [flashingPeg, setFlashingPeg] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [landingPulse, setLandingPulse] = useState<{
    slot: number;
    win: boolean;
  } | null>(null);

  const lastDropRef = useRef(0);
  const balanceRef = useRef(balance);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const multipliers = useMemo(
    () => MULTIPLIERS[rows][risk],
    [rows, risk],
  );

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  const canDropMore = activeBalls.length < MAX_BALLS;

  const persistBalance = useCallback(
    async (newBalance: number) => {
      balanceRef.current = newBalance;
      await syncBalance(newBalance);
    },
    [syncBalance],
  );

  const schedulePegFlashes = useCallback(
    (path: Parameters<typeof getPegFlashKey>[1], duration: number) => {
      const step = duration / path.length;
      path.forEach((_dir, r) => {
        setTimeout(() => {
          setFlashingPeg(getPegFlashKey(rows, path, r));
          setTimeout(() => setFlashingPeg(null), 80);
        }, step * r);
      });
    },
    [rows],
  );

  const handleBallLand = useCallback(
    async (ball: ActiveBall) => {
      const payout =
        Math.round(ball.bet * ball.multiplier * 100) / 100;
      const newBalance = balanceRef.current + payout;

      await persistBalance(newBalance);

      if (user) {
        await saveScore("plinko", ball.multiplier, ball.bet, payout);
      }

      setHistory((prev) =>
        [{ id: ball.id, multiplier: ball.multiplier }, ...prev].slice(0, 5),
      );

      setActiveSlot(ball.slotIndex);
      setLandingPulse({
        slot: ball.slotIndex,
        win: ball.multiplier >= 1,
      });

      setTimeout(() => {
        setLandingPulse(null);
        setActiveSlot(null);
      }, 600);

      setActiveBalls((prev) => prev.filter((b) => b.id !== ball.id));
    },
    [persistBalance, user],
  );

  const dropBall = useCallback(async () => {
    const now = Date.now();
    if (now - lastDropRef.current < DROP_COOLDOWN_MS) return false;
    if (!canDropMore) return false;

    if (betAmount < MIN_BET) {
      setBetError(t("minBet"));
      return false;
    }

    if (betAmount > balanceRef.current) {
      setBetError(t("insufficientBalance"));
      return false;
    }

    setBetError(null);
    lastDropRef.current = now;

    await persistBalance(balanceRef.current - betAmount);

    const { path, slotIndex, multiplier, waypoints } = resolvePlinkoDrop(
      rows,
      multipliers,
      BOARD_WIDTH,
      BOARD_HEIGHT,
    );
    const duration = getDropDurationMs(rows);
    const id = `${now}-${Math.random().toString(36).slice(2, 7)}`;

    const ball: ActiveBall = {
      id,
      waypoints,
      duration,
      slotIndex,
      multiplier,
      bet: betAmount,
    };

    setActiveBalls((prev) => [...prev, ball].slice(-MAX_BALLS));
    schedulePegFlashes(path, duration);

    setTimeout(() => {
      handleBallLand(ball);
    }, duration);

    return true;
  }, [
    betAmount,
    canDropMore,
    handleBallLand,
    multipliers,
    rows,
    persistBalance,
    schedulePegFlashes,
    t,
    user,
  ]);

  useEffect(() => {
    if (!autoMode) {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      return;
    }

    autoTimerRef.current = setInterval(() => {
      void dropBall();
    }, AUTO_DROP_MS);

    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [autoMode, dropBall]);

  function adjustBet(delta: number) {
    setBetAmount((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.max(MIN_BET, Math.min(balanceRef.current, next));
    });
    setBetError(null);
  }

  return (
    <GamePageShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-5 lg:w-[35%]">
          <div className="panel-interactive p-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
              {t("risk")}
            </p>
            <div className="mb-5 flex gap-1 rounded-full bg-navy-800 p-1">
              {(["low", "medium", "high"] as RiskLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRisk(level)}
                  disabled={activeBalls.length > 0 && !autoMode}
                  className={cn(
                    "flex-1 rounded-full py-2 text-xs font-semibold capitalize transition-colors duration-200",
                    risk === level
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {t(`risk_${level}`)}
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
              {t("rows")}
            </p>
            <div className="mb-5 flex gap-2">
              {ROW_OPTIONS.map((rowOption) => (
                <button
                  key={rowOption}
                  type="button"
                  onClick={() => setRows(rowOption)}
                  disabled={activeBalls.length > 0 && !autoMode}
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-semibold transition-colors duration-200",
                    rows === rowOption
                      ? "bg-orange-500 text-white"
                      : "bg-navy-700 text-slate-300 hover:bg-navy-600",
                  )}
                >
                  {rowOption}
                </button>
              ))}
            </div>

            <p className="mb-2 text-sm text-slate-400">{t("betAmount")}</p>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustBet(-10)}
                className="rounded-md bg-navy-800 p-2 text-white hover:bg-navy-700"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={MIN_BET}
                max={balance}
                value={betAmount}
                onChange={(e) => {
                  setBetAmount(Number(e.target.value) || MIN_BET);
                  setBetError(null);
                }}
                className="glass-input"
              />
              <button
                type="button"
                onClick={() => adjustBet(10)}
                className="rounded-md bg-navy-800 p-2 text-white hover:bg-navy-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-5 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setBetAmount(Math.max(MIN_BET, Math.floor(betAmount / 2)))
                }
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-slate-300 hover:bg-navy-700"
              >
                {t("half")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setBetAmount(
                    Math.min(
                      balanceRef.current,
                      Math.max(MIN_BET, betAmount * 2),
                    ),
                  )
                }
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-slate-300 hover:bg-navy-700"
              >
                {t("double")}
              </button>
            </div>

            {betError && (
              <p className="mb-3 text-sm text-orange-400">{betError}</p>
            )}

            <m.button
              type="button"
              onClick={() => void dropBall()}
              disabled={!canDropMore && !autoMode}
              className="btn-press btn-shimmer w-full rounded-lg py-3.5 font-display text-3xl tracking-[0.06em] text-white disabled:opacity-50"
            >
              {t("drop")}
            </m.button>

            <div className="mt-4 flex items-center justify-between rounded-md bg-navy-800 px-3 py-2.5">
              <span className="text-sm text-slate-400">{t("autoMode")}</span>
              <button
                type="button"
                onClick={() => setAutoMode((v) => !v)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors duration-200",
                  autoMode ? "bg-orange-500" : "bg-navy-700",
                )}
                aria-pressed={autoMode}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200",
                    autoMode ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>

            {autoMode && (
              <button
                type="button"
                onClick={() => setAutoMode(false)}
                className="mt-2 w-full rounded-md border border-navy-700 py-2 text-sm text-slate-300 hover:bg-navy-800"
              >
                {t("stopAuto")}
              </button>
            )}
          </div>

          <div className="panel-interactive px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-[#94a3b8]">
              {t("balance")}
            </p>
            <p className="font-display text-4xl tracking-[0.04em] text-white">
              <AnimatedNumber value={balance} />
            </p>
            <DemoBalanceAlerts align="right" className="mt-1" />
          </div>

          {history.length > 0 && (
            <div className="panel-interactive p-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
                {t("history")}
              </p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence initial={false}>
                  {history.map((item) => (
                    <m.span
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        item.multiplier >= 1
                          ? "bg-[#22c55e]/20 text-[#22c55e]"
                          : "bg-[#ef4444]/20 text-[#ef4444]",
                      )}
                    >
                      {formatMultiplier(item.multiplier)}
                    </m.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[65%]">
          <PlinkoBoard
            rows={rows}
            multipliers={multipliers}
            activeBalls={activeBalls}
            flashingPeg={flashingPeg}
            activeSlot={activeSlot}
            landingPulse={landingPulse}
          />
        </div>
      </div>
    </GamePageShell>
  );
}
