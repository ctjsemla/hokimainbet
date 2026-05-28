"use client";

import { AnimatePresence, m } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { CrashChart } from "@/components/games/CrashChart";
import { CrashExplosion } from "@/components/games/CrashExplosion";
import { CrashHistoryPills } from "@/components/games/CrashHistoryPills";
import { GamePageShell, gamePanelLeft, gamePanelRight } from "@/components/games/GamePageShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DemoBalanceAlerts } from "@/components/ui/DemoBalanceAlerts";
import { usePersistDemoBalance } from "@/hooks/usePersistDemoBalance";
import { generateCrashPoint, tickCrashMultiplier } from "@/lib/crash";
import { getUserScores, saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";
import type { GameScore } from "@/types/database.types";

type GameState = "idle" | "countdown" | "flying" | "crashed" | "cashed";

interface PersonalRound {
  multiplier: number;
  bet: number;
  winnings: number;
  crashed: boolean;
}

const MIN_BET = 10;
const ROUND_PAUSE_MS = 3000;
const TICK_MS = 100;

function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}

function multiplierDisplayStyle(
  value: number,
  state: GameState,
): { color: string; textShadow: string } {
  if (state === "crashed") {
    return { color: "#ef4444", textShadow: "none" };
  }
  if (state === "cashed") {
    return { color: "#22c55e", textShadow: "0 0 24px rgba(34,197,94,0.45)" };
  }
  if (value < 1.5) return { color: "#ffffff", textShadow: "none" };
  if (value < 3) return { color: "#fb923c", textShadow: "0 0 20px rgba(249,115,22,0.3)" };
  if (value < 5) return { color: "#f97316", textShadow: "0 0 32px rgba(249,115,22,0.55)" };
  if (value < 10) return { color: "#f97316", textShadow: "0 0 40px rgba(249,115,22,0.7)" };
  return { color: "#fbbf24", textShadow: "0 0 60px rgba(251,191,36,1)" };
}

export function CrashGame() {
  const t = useTranslations("crash");
  const { user } = useAuth();
  const { balance, persistBalance } = usePersistDemoBalance();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [betAmount, setBetAmount] = useState(50);
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [chartPoints, setChartPoints] = useState<{ multiplier: number }[]>([
    { multiplier: 1 },
  ]);
  const [crashHistory, setCrashHistory] = useState<number[]>([]);
  const [personalHistory, setPersonalHistory] = useState<PersonalRound[]>([]);
  const [betError, setBetError] = useState<string | null>(null);
  const [flash, setFlash] = useState<"crash" | "cash" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  const [autoCashoutTarget, setAutoCashoutTarget] = useState(2);

  const crashPointRef = useRef(1);
  const activeBetRef = useRef(0);
  const balanceRef = useRef(balance);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCashoutRef = useRef<number | null>(null);
  const cashingOutRef = useRef(false);
  const multiplierRef = useRef(1);
  const flyingRef = useRef(false);

  const loadPersonalHistory = useCallback(async () => {
    if (!user) return;

    try {
      const scores = await getUserScores(user.id);
      const rounds = scores
        .filter((s) => s.game === "crash")
        .slice(0, 5)
        .map((s) => scoreToRound(s));
      setPersonalHistory(rounds);
    } catch {
      /* keep local history */
    }
  }, [user]);

  useEffect(() => {
    loadPersonalHistory();
  }, [loadPersonalHistory]);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  function scoreToRound(score: GameScore): PersonalRound {
    const crashed = Number(score.score) === 0;
    return {
      multiplier: crashed ? 0 : Number(score.multiplier),
      bet: Number(score.bet_amount),
      winnings: Number(score.score),
      crashed,
    };
  }

  function clearTimers() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (roundEndRef.current) {
      clearTimeout(roundEndRef.current);
      roundEndRef.current = null;
    }
  }

  function scheduleIdle() {
    roundEndRef.current = setTimeout(() => {
      flyingRef.current = false;
      setGameState("idle");
      setMultiplier(1);
      setCountdown(3);
      setChartPoints([{ multiplier: 1 }]);
      setFlash(null);
      setShowConfetti(false);
    }, ROUND_PAUSE_MS);
  }

  useEffect(() => () => clearTimers(), []);

  async function finishRound(
    outcome: "crashed" | "cashed",
    finalMultiplier: number,
    winnings: number,
  ) {
    const bet = activeBetRef.current;

    if (outcome === "crashed") {
      await persistBalance(balanceRef.current);

      if (user) {
        await saveScore("crash", 0, bet, 0);
      }

      setCrashHistory((prev) => [finalMultiplier, ...prev].slice(0, 20));
      setPersonalHistory((prev) =>
        [
          {
            multiplier: finalMultiplier,
            bet,
            winnings: 0,
            crashed: true,
          },
          ...prev,
        ].slice(0, 5),
      );
    } else {
      const newBalance = balanceRef.current + winnings;
      await persistBalance(newBalance);

      if (user) {
        await saveScore("crash", finalMultiplier, bet, winnings);
      }

      setCrashHistory((prev) => [finalMultiplier, ...prev].slice(0, 20));
      setPersonalHistory((prev) =>
        [
          { multiplier: finalMultiplier, bet, winnings, crashed: false },
          ...prev,
        ].slice(0, 5),
      );
    }

    loadPersonalHistory();
  }

  function crashAtPoint(crashAt: number) {
    flyingRef.current = false;
    clearTimers();
    setMultiplier(crashAt);
    setChartPoints((pts) => [...pts, { multiplier: crashAt }]);
    setGameState("crashed");
    setFlash("crash");
    setPulseKey((k) => k + 1);
    void finishRound("crashed", crashAt, 0);
    scheduleIdle();
  }

  async function triggerCashOut(atMultiplier: number) {
    if (cashingOutRef.current || !flyingRef.current) return;
    cashingOutRef.current = true;

    clearTimers();
    const bet = activeBetRef.current;
    const winnings = Math.round(bet * atMultiplier * 100) / 100;

    setMultiplier(atMultiplier);
    multiplierRef.current = atMultiplier;
    setGameState("cashed");
    setFlash("cash");
    setShowConfetti(true);
    setPulseKey((k) => k + 1);

    await finishRound("cashed", atMultiplier, winnings);
    scheduleIdle();
    cashingOutRef.current = false;
  }

  function startFlying() {
    flyingRef.current = true;
    setGameState("flying");
    setMultiplier(1);
    multiplierRef.current = 1;
    cashingOutRef.current = false;
    autoCashoutRef.current =
      autoCashoutEnabled && autoCashoutTarget >= 1.01
        ? autoCashoutTarget
        : null;
    setChartPoints([{ multiplier: 1 }]);

    if (crashPointRef.current <= 1) {
      crashAtPoint(1);
      return;
    }

    tickRef.current = setInterval(() => {
      setMultiplier((prev) => {
        if (prev >= crashPointRef.current) {
          crashAtPoint(crashPointRef.current);
          return crashPointRef.current;
        }

        const next = tickCrashMultiplier(prev);

        if (
          autoCashoutRef.current &&
          next >= autoCashoutRef.current &&
          !cashingOutRef.current
        ) {
          void triggerCashOut(next);
          return next;
        }

        if (next >= crashPointRef.current) {
          crashAtPoint(crashPointRef.current);
          return crashPointRef.current;
        }

        multiplierRef.current = next;
        setChartPoints((pts) => [...pts, { multiplier: next }]);
        setPulseKey((k) => k + 1);
        return next;
      });
    }, TICK_MS);
  }

  async function handleStart() {
    if (gameState !== "idle") return;

    if (betAmount < MIN_BET) {
      setBetError(t("minBet"));
      return;
    }

    if (betAmount > balance) {
      setBetError(t("insufficientBalance"));
      return;
    }

    setBetError(null);
    activeBetRef.current = betAmount;
    const balanceAfterBet = balance - betAmount;
    balanceRef.current = balanceAfterBet;
    crashPointRef.current = generateCrashPoint();
    setMultiplier(1);
    setCountdown(3);
    setGameState("countdown");
    void persistBalance(balanceAfterBet);
  }

  useEffect(() => {
    if (gameState !== "countdown") return;

    if (countdown <= 0) {
      startFlying();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, countdown]);

  async function handleCashOut() {
    if (gameState !== "flying") return;
    await triggerCashOut(multiplierRef.current);
  }

  function adjustBet(delta: number) {
    setBetAmount((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.max(MIN_BET, Math.min(balance, next));
    });
    setBetError(null);
  }

  const isPlaying = gameState !== "idle";
  const multStyle = multiplierDisplayStyle(multiplier, gameState);
  const showAutoLine =
    gameState === "flying" && autoCashoutEnabled && autoCashoutTarget > 1;

  return (
    <GamePageShell>
      <AnimatePresence>
        {flash === "crash" && (
          <m.div
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none fixed inset-0 z-40 bg-[#ef4444]"
          />
        )}
        {flash === "cash" && (
          <m.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-40 bg-[#22c55e]"
          />
        )}
      </AnimatePresence>

      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <m.span
              key={i}
              initial={{
                opacity: 1,
                x: "50vw",
                y: "40vh",
                scale: 0,
              }}
              animate={{
                opacity: 0,
                x: `${20 + Math.random() * 60}vw`,
                y: `${10 + Math.random() * 70}vh`,
                scale: 1,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="absolute h-2 w-2 rounded-full bg-[#22c55e]"
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <m.div variants={gamePanelLeft} className="flex w-full flex-col lg:w-[65%]">
          <div className="panel-interactive relative flex flex-col overflow-hidden p-4 md:p-6">
            <CrashHistoryPills
              history={crashHistory}
              formatMultiplier={formatMultiplier}
              label={t("previousRounds")}
            />

            <AnimatePresence mode="wait">
              {gameState === "countdown" && (
                <m.div
                  key={countdown}
                  initial={{ scale: 2.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-navy-900/80"
                >
                  <span className="font-display text-8xl text-orange-500 md:text-9xl">
                    {t("countdown", { n: countdown })}
                  </span>
                </m.div>
              )}
            </AnimatePresence>

            {gameState === "crashed" && <CrashExplosion />}

            {gameState === "crashed" && (
              <m.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute left-1/2 top-24 z-20 -translate-x-1/2 font-display text-5xl tracking-[0.06em] text-[#ef4444] md:text-6xl"
              >
                {t("crashed")}
              </m.p>
            )}

            {gameState === "cashed" && (
              <m.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute left-1/2 top-24 z-20 -translate-x-1/2 font-display text-4xl text-[#22c55e] md:text-5xl"
              >
                {t("cashedOut", {
                  amount: (
                    activeBetRef.current * multiplier
                  ).toFixed(0),
                })}
              </m.p>
            )}

            <m.div
              key={pulseKey}
              initial={{ scale: 1 }}
              animate={{ scale: gameState === "flying" ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 0.12 }}
              className="relative z-10 text-center font-display text-[120px] leading-none tracking-[0.06em]"
              style={{
                color: multStyle.color,
                textShadow: multStyle.textShadow,
              }}
            >
              {formatMultiplier(multiplier)}
            </m.div>

            <div className="relative z-10 mt-2 h-56 md:h-80">
              <CrashChart
                points={chartPoints}
                crashed={gameState === "crashed"}
                exploded={gameState === "crashed"}
                autoCashoutMultiplier={showAutoLine ? autoCashoutTarget : null}
              />
            </div>
          </div>
        </m.div>

        <m.div variants={gamePanelRight} className="w-full lg:w-[35%]">
          <div className="panel-interactive p-5">
            <p className="mb-1 text-xs uppercase tracking-wider text-[#94a3b8]">
              {t("balance")}
            </p>
            <p className="mb-6 font-display text-4xl tracking-[0.04em] text-white">
              <AnimatedNumber value={balance} duration={300} />
            </p>
            <DemoBalanceAlerts align="right" className="mb-4" />

            <p className="mb-2 text-sm text-slate-400">{t("betAmount")}</p>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => adjustBet(-10)}
                className="rounded-md bg-navy-800 p-2 text-white transition-colors hover:bg-navy-700 disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={MIN_BET}
                max={balance}
                value={betAmount}
                disabled={isPlaying}
                onChange={(e) => {
                  setBetAmount(Number(e.target.value) || MIN_BET);
                  setBetError(null);
                }}
                className="glass-input focus:shadow-[0_0_0_3px_rgba(249,115,22,0.35)] disabled:opacity-50"
              />
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => adjustBet(10)}
                className="rounded-md bg-navy-800 p-2 text-white transition-colors hover:bg-navy-700 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                disabled={isPlaying}
                onClick={() =>
                  setBetAmount(Math.max(MIN_BET, Math.floor(betAmount / 2)))
                }
                className="flex-1 rounded-md bg-navy-700 py-2 font-sans text-sm font-medium text-[#94a3b8] transition-colors hover:bg-navy-600 disabled:opacity-40"
              >
                {t("half")}
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={() =>
                  setBetAmount(
                    Math.min(balance, Math.max(MIN_BET, betAmount * 2)),
                  )
                }
                className="flex-1 rounded-md bg-navy-700 py-2 font-sans text-sm font-medium text-[#94a3b8] transition-colors hover:bg-navy-600 disabled:opacity-40"
              >
                {t("double")}
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 flex items-center justify-between font-sans text-sm text-[#94a3b8]">
                <span>
                  {t("autoCashout")} at:
                </span>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setAutoCashoutEnabled((v) => !v)}
                  className={cn(
                    "btn-press rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                    autoCashoutEnabled
                      ? "bg-orange-500 text-white"
                      : "bg-navy-700 text-[#94a3b8]",
                  )}
                >
                  {autoCashoutEnabled ? "ON" : "OFF"}
                </button>
              </label>
              <input
                type="number"
                min={1.01}
                step={0.01}
                disabled={isPlaying || !autoCashoutEnabled}
                value={autoCashoutTarget}
                onChange={(e) =>
                  setAutoCashoutTarget(
                    Math.max(1.01, Number(e.target.value) || 1.01),
                  )
                }
                placeholder={t("autoCashoutPlaceholder")}
                className="glass-input disabled:opacity-40"
              />
            </div>

            {betError && (
              <p className="mb-3 text-sm text-orange-400">{betError}</p>
            )}

            {gameState === "idle" && (
              <m.button
                type="button"
                onClick={() => void handleStart()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="btn-cta-shimmer w-full rounded-lg bg-orange-500 py-4 font-display text-2xl uppercase tracking-[0.08em] text-white shadow-lg shadow-orange-500/30"
              >
                {t("start")}
              </m.button>
            )}

            {gameState === "flying" && (
              <m.button
                type="button"
                onClick={handleCashOut}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: [1, 1.02, 1], opacity: 1 }}
                transition={{
                  scale: { repeat: Infinity, duration: 0.6, ease: "easeInOut" },
                  opacity: { type: "spring", stiffness: 400, damping: 20 },
                }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-lg bg-[#22c55e] py-5 font-display text-2xl uppercase tracking-wide text-white shadow-[0_0_32px_rgba(34,197,94,0.45)] hover:bg-[#16a34a]"
              >
                {t("cashOut", { multiplier: multiplier.toFixed(2) })}
              </m.button>
            )}

            {(gameState === "countdown" ||
              gameState === "crashed" ||
              gameState === "cashed") && (
              <div className="w-full rounded-md bg-navy-800 py-3.5 text-center font-display text-xl text-slate-500">
                {gameState === "countdown"
                  ? t("countdown", { n: countdown })
                  : gameState === "crashed"
                    ? t("crashed")
                    : t("cashedOut", {
                        amount: (
                          activeBetRef.current * multiplier
                        ).toFixed(0),
                      })}
              </div>
            )}

            <div className="mt-8 border-t border-navy-800 pt-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
                {t("history")}
              </p>
              {personalHistory.length === 0 ? (
                <p className="text-sm text-slate-600">—</p>
              ) : (
                <ul className="space-y-2">
                  {personalHistory.map((round, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-md bg-navy-800 px-3 py-2 text-sm"
                    >
                      <span
                        className={cn(
                          "font-semibold",
                          round.crashed ? "text-[#ef4444]" : "text-[#22c55e]",
                        )}
                      >
                        {round.crashed
                          ? t("roundCrashed")
                          : formatMultiplier(round.multiplier)}
                      </span>
                      <span className="text-slate-400">
                        {round.crashed
                          ? `-${round.bet}`
                          : `+${round.winnings.toFixed(0)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </m.div>
      </div>
    </GamePageShell>
  );
}
