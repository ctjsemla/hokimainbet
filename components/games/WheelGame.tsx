"use client";

import { AnimatePresence, m } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GamePageShell,
  gamePanelLeft,
  gamePanelRight,
} from "@/components/games/GamePageShell";
import { WheelConfetti } from "@/components/games/WheelConfetti";
import {
  WheelSvg,
  type WheelHighlightPhase,
} from "@/components/games/WheelSvg";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DemoBalanceAlerts } from "@/components/ui/DemoBalanceAlerts";
import { usePersistDemoBalance } from "@/hooks/usePersistDemoBalance";
import { saveScore } from "@/lib/scores";
import {
  buildWheelMultipliers,
  computeLandingRotation,
  formatWheelMultiplier,
  pickWheelSegmentIndex,
  WHEEL_COOLDOWN_MS,
  WHEEL_IDLE_RPM,
  WHEEL_RESULT_CLEAR_MS,
  WHEEL_SEGMENT_OPTIONS,
  WHEEL_SPIN_DURATION_S,
  type WheelRisk,
  type WheelSegmentCount,
} from "@/lib/wheel";
import { cn } from "@/lib/utils";

interface SpinHistoryItem {
  id: string;
  multiplier: number;
  won: boolean;
}

const MIN_BET = 10;
const LIVE_RESULTS_COUNT = 5;

export function WheelGame() {
  const t = useTranslations("wheel");
  const { user } = useAuth();
  const { balance, persistBalance } = usePersistDemoBalance();

  const [risk, setRisk] = useState<WheelRisk>("medium");
  const [segmentCount, setSegmentCount] = useState<WheelSegmentCount>(10);
  const [betAmount, setBetAmount] = useState(50);
  const [betError, setBetError] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [postSpinWobble, setPostSpinWobble] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [highlightPhase, setHighlightPhase] = useState<WheelHighlightPhase>("none");
  const [pointerWobble, setPointerWobble] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastResult, setLastResult] = useState<{
    multiplier: number;
    won: boolean;
  } | null>(null);
  const [history, setHistory] = useState<SpinHistoryItem[]>([]);
  const [liveResults, setLiveResults] = useState<SpinHistoryItem[]>([]);

  const pendingSpinRef = useRef<{
    bet: number;
    index: number;
    multiplier: number;
    balanceAfterBet: number;
  } | null>(null);
  const spinSafetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const isLocked = isSpinning || postSpinWobble || cooldownMs > 0;
  const cooldownActive = cooldownMs > 0;

  const multipliers = useMemo(
    () => buildWheelMultipliers(risk, segmentCount),
    [risk, segmentCount],
  );

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    if (!cooldownActive) return;
    const id = setInterval(() => {
      setCooldownMs((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(id);
  }, [cooldownActive]);

  useEffect(() => {
    if (isSpinning || postSpinWobble) return;

    let frameId = 0;
    let last = performance.now();
    const degPerMs = (WHEEL_IDLE_RPM * 360) / 60_000;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      rotationRef.current += degPerMs * dt;
      setRotation(rotationRef.current);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isSpinning, postSpinWobble]);

  const finishSpin = useCallback(async () => {
    const pending = pendingSpinRef.current;
    if (!pending) return;

    const { bet, index, multiplier, balanceAfterBet } = pending;
    pendingSpinRef.current = null;

    if (spinSafetyTimeoutRef.current) {
      clearTimeout(spinSafetyTimeoutRef.current);
      spinSafetyTimeoutRef.current = null;
    }

    const won = multiplier > 0;
    const payout = won ? Math.round(bet * multiplier * 100) / 100 : 0;

    setIsSpinning(false);
    setHighlightIndex(index);
    setHighlightPhase("white");
    setPointerWobble(true);
    setPostSpinWobble(true);
    setLastResult({ multiplier, won });
    setCooldownMs(WHEEL_COOLDOWN_MS);

    if (multiplier >= 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 900);
    }

    setTimeout(() => setHighlightPhase("gold"), 120);

    if (won) {
      await persistBalance(balanceAfterBet + payout);
      if (user) {
        await saveScore("wheel", multiplier, bet, payout);
      }
    } else if (user) {
      await saveScore("wheel", 0, bet, 0);
    }

    const item: SpinHistoryItem = {
      id: `${Date.now()}`,
      multiplier,
      won,
    };

    setHistory((prev) => [item, ...prev].slice(0, 8));
    setLiveResults((prev) => [item, ...prev].slice(0, LIVE_RESULTS_COUNT));

    setTimeout(() => {
      setPointerWobble(false);
      setPostSpinWobble(false);
    }, 700);

    setTimeout(() => {
      setHighlightPhase("none");
      setHighlightIndex(null);
      setLastResult(null);
    }, WHEEL_RESULT_CLEAR_MS);
  }, [persistBalance, user]);

  const forceResetSpin = useCallback(() => {
    if (spinSafetyTimeoutRef.current) {
      clearTimeout(spinSafetyTimeoutRef.current);
      spinSafetyTimeoutRef.current = null;
    }
    pendingSpinRef.current = null;
    setIsSpinning(false);
    setPostSpinWobble(false);
    setPointerWobble(false);
    setCooldownMs(WHEEL_COOLDOWN_MS);
  }, []);

  async function handleSpin() {
    if (isLocked) return;

    if (betAmount < MIN_BET) {
      setBetError(t("minBet"));
      return;
    }

    if (betAmount > balance) {
      setBetError(t("insufficientBalance"));
      return;
    }

    setBetError(null);
    setLastResult(null);
    setHighlightPhase("none");
    setHighlightIndex(null);
    setShowConfetti(false);
    setPostSpinWobble(false);

    const targetIndex = pickWheelSegmentIndex(multipliers.length);
    const multiplier = multipliers[targetIndex];
    const balanceAfterBet = balance - betAmount;
    void persistBalance(balanceAfterBet);

    pendingSpinRef.current = {
      bet: betAmount,
      index: targetIndex,
      multiplier,
      balanceAfterBet,
    };

    const nextRotation = computeLandingRotation(
      targetIndex,
      multipliers.length,
      rotationRef.current,
      3,
    );
    rotationRef.current = nextRotation;
    setRotation(nextRotation);
    setIsSpinning(true);

    if (spinSafetyTimeoutRef.current) {
      clearTimeout(spinSafetyTimeoutRef.current);
    }
    spinSafetyTimeoutRef.current = setTimeout(() => {
      if (pendingSpinRef.current) {
        void finishSpin();
      } else {
        forceResetSpin();
      }
    }, (WHEEL_SPIN_DURATION_S + 1.5) * 1000);
  }

  const cooldownSeconds = Math.ceil(cooldownMs / 1000);

  const spinButtonLabel = isSpinning
    ? t("spinning")
    : cooldownMs > 0
      ? t("cooldown", { seconds: cooldownSeconds })
      : t("spin");

  function adjustBet(delta: number) {
    setBetAmount((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.max(MIN_BET, Math.min(balance, next));
    });
    setBetError(null);
  }

  return (
    <GamePageShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-stretch">
        <m.div variants={gamePanelLeft} className="w-full space-y-5 lg:w-[35%]">
          <div className="panel-interactive p-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-[#94a3b8]">
              {t("risk")}
            </p>
            <div className="mb-6 flex gap-1 rounded-full bg-navy-800 p-1">
              {(["low", "medium", "high"] as WheelRisk[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setRisk(level)}
                  className={cn(
                    "flex-1 rounded-full py-2.5 text-xs font-semibold capitalize transition-colors duration-200",
                    risk === level
                      ? "bg-orange-500 text-white"
                      : "text-[#94a3b8] hover:text-white",
                    isLocked && "opacity-50",
                  )}
                >
                  {t(`risk_${level}`)}
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs uppercase tracking-wider text-[#94a3b8]">
              {t("segments")}
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {WHEEL_SEGMENT_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setSegmentCount(count)}
                  className={cn(
                    "min-w-[3rem] flex-1 rounded-md py-2 text-sm font-semibold transition-colors duration-200",
                    segmentCount === count
                      ? "bg-orange-500 text-white"
                      : "bg-navy-700 text-[#94a3b8] hover:bg-navy-600 hover:text-white",
                    isLocked && "opacity-50",
                  )}
                >
                  {count}
                </button>
              ))}
            </div>

            <p className="mb-2 text-sm text-[#94a3b8]">{t("betAmount")}</p>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                disabled={isLocked}
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
                disabled={isLocked}
                onChange={(e) => {
                  setBetAmount(Number(e.target.value) || MIN_BET);
                  setBetError(null);
                }}
                className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-center text-white outline-none focus:border-orange-500 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={isLocked}
                onClick={() => adjustBet(10)}
                className="rounded-md bg-navy-800 p-2 text-white transition-colors hover:bg-navy-700 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                disabled={isLocked}
                onClick={() =>
                  setBetAmount(Math.max(MIN_BET, Math.floor(betAmount / 2)))
                }
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-[#94a3b8] transition-colors hover:bg-navy-700 disabled:opacity-40"
              >
                {t("half")}
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={() =>
                  setBetAmount(
                    Math.min(balance, Math.max(MIN_BET, betAmount * 2)),
                  )
                }
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-[#94a3b8] transition-colors hover:bg-navy-700 disabled:opacity-40"
              >
                {t("double")}
              </button>
            </div>

            {betError && (
              <p className="mb-3 text-sm text-orange-400">{betError}</p>
            )}

            <m.button
              type="button"
              disabled={isLocked}
              onClick={() => void handleSpin()}
              whileHover={isLocked ? undefined : { scale: 1.02 }}
              whileTap={isLocked ? undefined : { scale: 0.98 }}
              className={cn(
                "btn-press flex h-14 w-full items-center justify-center rounded-lg font-display text-3xl tracking-[0.08em] text-white disabled:cursor-not-allowed",
                isSpinning && "bg-orange-600 opacity-70",
                !isSpinning && cooldownMs > 0 && "bg-navy-700 opacity-90",
                !isLocked && "btn-cta-shimmer bg-orange-500",
              )}
            >
              {spinButtonLabel}
            </m.button>
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
              <p className="mb-3 text-xs uppercase tracking-wider text-[#94a3b8]">
                {t("history")}
              </p>
              <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    title={formatWheelMultiplier(item.multiplier)}
                    className={cn(
                      "group relative h-9 w-9 cursor-default rounded-full border-2 transition-transform hover:scale-110",
                      item.won
                        ? "border-orange-500 bg-orange-500/20"
                        : "border-[#ef4444] bg-[#ef4444]/20",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy-800 px-2 py-0.5 text-xs group-hover:block",
                        item.won ? "text-orange-400" : "text-[#ef4444]",
                      )}
                    >
                      {formatWheelMultiplier(item.multiplier)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </m.div>

        <m.div
          variants={gamePanelRight}
          className="flex w-full flex-col items-center justify-center lg:w-[65%]"
        >
          <div className="relative w-full">
            <WheelConfetti active={showConfetti} />
            <WheelSvg
              multipliers={multipliers}
              rotation={rotation}
              isSpinning={isSpinning}
              postSpinWobble={postSpinWobble}
              highlightIndex={highlightIndex}
              highlightPhase={highlightPhase}
              pointerWobble={pointerWobble}
              onSpinComplete={() => void finishSpin()}
            />
          </div>

          <div className="mt-6 w-full max-w-lg">
            <p className="mb-2 text-center text-xs uppercase tracking-wider text-[#94a3b8]">
              {t("liveResults")}
            </p>
            <div className="flex min-h-[40px] flex-wrap items-center justify-center gap-2 overflow-hidden">
              <AnimatePresence initial={false}>
                {liveResults.map((item) => (
                  <m.span
                    key={item.id}
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-display text-sm tracking-wide",
                      item.won
                        ? "bg-orange-500/25 text-orange-400 ring-1 ring-orange-500/40"
                        : "bg-[#ef4444]/15 text-[#ef4444] ring-1 ring-[#ef4444]/30",
                    )}
                  >
                    {formatWheelMultiplier(item.multiplier)}
                  </m.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 flex min-h-[72px] items-center justify-center">
            <AnimatePresence mode="wait">
              {lastResult && (
                <m.div
                  key={`${lastResult.multiplier}-${lastResult.won}`}
                  initial={{ opacity: 0, scale: 0.85, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="text-center"
                >
                  {lastResult.won ? (
                    <p className="font-display text-5xl tracking-wide text-orange-500 md:text-6xl">
                      {t("win", {
                        multiplier: formatWheelMultiplier(lastResult.multiplier),
                      })}
                    </p>
                  ) : (
                    <p className="font-display text-4xl tracking-wide text-[#94a3b8] md:text-5xl">
                      {t("lose")}
                    </p>
                  )}
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </m.div>
      </div>
    </GamePageShell>
  );
}
