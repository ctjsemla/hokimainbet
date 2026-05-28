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
import { useAuth } from "@/components/providers/AuthProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DemoBalanceAlerts } from "@/components/ui/DemoBalanceAlerts";
import { useLoginRequiredAction } from "@/hooks/useLoginRequiredAction";
import { usePersistDemoBalance } from "@/hooks/usePersistDemoBalance";
import {
  countKenoMatches,
  drawKenoNumbers,
  formatKenoMultiplier,
  getKenoMultiplier,
  KENO_DRAW_COUNT,
  KENO_DRAW_INTERVAL_MS,
  KENO_MAX_PICKS,
  KENO_MIN_PICKS,
  KENO_NUMBERS,
  KENO_PAYOUT_TABLES,
  shuffleDrawOrder,
  type KenoPhase,
} from "@/lib/keno";
import { saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  multiplier: number;
  matches: number;
  picks: number;
  won: boolean;
}

const MIN_BET = 10;
const FLASH_MS = 100;
const RESULT_RESET_MS = 4000;

type CellPhase = "idle" | "flash" | "revealed";

interface CellVisual {
  phase: CellPhase;
  isSelected: boolean;
  isMatch: boolean;
  isDrawn: boolean;
}

export function KenoGame() {
  const t = useTranslations("keno");
  const { user } = useAuth();
  const { requireLogin } = useLoginRequiredAction();
  const { balance, persistBalance } = usePersistDemoBalance();

  const [phase, setPhase] = useState<KenoPhase>("picking");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [betAmount, setBetAmount] = useState(50);
  const [betError, setBetError] = useState<string | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [revealedDrawn, setRevealedDrawn] = useState<Set<number>>(new Set());
  const [flashingNumber, setFlashingNumber] = useState<number | null>(null);
  const [drawProgress, setDrawProgress] = useState(0);
  const [result, setResult] = useState<{
    matches: number;
    multiplier: number;
    payout: number;
  } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const drawSessionRef = useRef<{
    fullDraw: number[];
    drawOrder: number[];
    selected: number[];
    bet: number;
    balanceAfterBet: number;
  } | null>(null);

  const pickCount = selected.size;
  const payoutTable = useMemo(
    () => (pickCount > 0 ? [...KENO_PAYOUT_TABLES[pickCount]] : []),
    [pickCount],
  );

  const resetRound = useCallback(() => {
    setPhase("picking");
    setDrawnNumbers([]);
    setRevealedDrawn(new Set());
    setFlashingNumber(null);
    setDrawProgress(0);
    setResult(null);
    drawSessionRef.current = null;
  }, []);

  const finishDraw = useCallback(
    async (session: NonNullable<typeof drawSessionRef.current>) => {
      const matches = countKenoMatches(session.selected, session.fullDraw);
      const multiplier = getKenoMultiplier(session.selected.length, matches);
      const payout =
        multiplier > 0
          ? Math.round(session.bet * multiplier * 100) / 100
          : 0;
      const won = payout > 0;

      setResult({ matches, multiplier, payout });
      setPhase("result");

      if (won) {
        await persistBalance(session.balanceAfterBet + payout);
        if (user) {
          await saveScore("keno", multiplier, session.bet, payout);
        }
      } else if (user) {
        await saveScore("keno", 0, session.bet, 0);
      }

      setHistory((prev) =>
        [
          {
            id: `${Date.now()}`,
            multiplier,
            matches,
            picks: session.selected.length,
            won,
          },
          ...prev,
        ].slice(0, 5),
      );

      setTimeout(resetRound, RESULT_RESET_MS);
    },
    [persistBalance, resetRound, user],
  );

  useEffect(() => {
    if (phase !== "drawing" || !drawSessionRef.current) return;

    const session = drawSessionRef.current;
    let cancelled = false;

    async function runDraw() {
      for (let step = 0; step < session.drawOrder.length; step++) {
        if (cancelled) return;

        const num = session.drawOrder[step];
        setDrawProgress(step + 1);
        setFlashingNumber(num);
        await new Promise((resolve) => setTimeout(resolve, FLASH_MS));
        if (cancelled) return;

        setFlashingNumber(null);
        setRevealedDrawn((prev) => new Set(prev).add(num));
        await new Promise((resolve) =>
          setTimeout(resolve, KENO_DRAW_INTERVAL_MS - FLASH_MS),
        );
      }

      if (!cancelled) {
        await finishDraw(session);
      }
    }

    void runDraw();
    return () => {
      cancelled = true;
    };
  }, [phase, finishDraw]);

  async function handleStart() {
    if (phase !== "picking") return;
    if (!requireLogin(Boolean(user), setBetError)) return;

    if (pickCount < KENO_MIN_PICKS) return;

    if (betAmount < MIN_BET) {
      setBetError(t("minBet"));
      return;
    }

    if (betAmount > balance) {
      setBetError(t("insufficientBalance"));
      return;
    }

    setBetError(null);
    const fullDraw = drawKenoNumbers();
    const drawOrder = shuffleDrawOrder(fullDraw);
    const selectedArr = Array.from(selected);
    const balanceAfterBet = balance - betAmount;

    await persistBalance(balanceAfterBet);

    drawSessionRef.current = {
      fullDraw,
      drawOrder,
      selected: selectedArr,
      bet: betAmount,
      balanceAfterBet,
    };

    setDrawnNumbers(fullDraw);
    setRevealedDrawn(new Set());
    setDrawProgress(0);
    setResult(null);
    setPhase("drawing");
  }

  function toggleNumber(num: number) {
    if (phase !== "picking") return;

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else if (next.size < KENO_MAX_PICKS) {
        next.add(num);
      }
      return next;
    });
    setBetError(null);
  }

  function clearSelection() {
    if (phase !== "picking") return;
    setSelected(new Set());
  }

  function adjustBet(delta: number) {
    setBetAmount((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.max(MIN_BET, Math.min(balance, next));
    });
    setBetError(null);
  }

  function getCellVisual(num: number): CellVisual {
    const isSelected = selected.has(num);
    const isDrawn = drawnNumbers.includes(num);
    const isRevealed = revealedDrawn.has(num);
    const isMatch = isSelected && isRevealed && isDrawn;
    const isFlash = flashingNumber === num;

    if (isFlash) {
      return {
        phase: "flash",
        isSelected,
        isMatch,
        isDrawn: true,
      };
    }

    if (isRevealed && isDrawn) {
      return {
        phase: "revealed",
        isSelected,
        isMatch,
        isDrawn: true,
      };
    }

    return {
      phase: "idle",
      isSelected: phase === "picking" ? isSelected : isSelected,
      isMatch: false,
      isDrawn: false,
    };
  }

  const isInteractive = phase === "picking";
  const canStart = pickCount >= KENO_MIN_PICKS && phase === "picking";

  return (
    <GamePageShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
        <m.div variants={gamePanelLeft} className="w-full space-y-5 lg:w-[35%]">
          <div className="panel-interactive p-5">
            <p className="mb-2 text-sm text-[#94a3b8]">{t("betAmount")}</p>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                disabled={!isInteractive}
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
                disabled={!isInteractive}
                onChange={(e) => {
                  setBetAmount(Number(e.target.value) || MIN_BET);
                  setBetError(null);
                }}
                className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-center text-white outline-none focus:border-orange-500 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={!isInteractive}
                onClick={() => adjustBet(10)}
                className="rounded-md bg-navy-800 p-2 text-white transition-colors hover:bg-navy-700 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-5 flex gap-2">
              <button
                type="button"
                disabled={!isInteractive}
                onClick={() =>
                  setBetAmount(Math.max(MIN_BET, Math.floor(betAmount / 2)))
                }
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-[#94a3b8] hover:bg-navy-700 disabled:opacity-40"
              >
                {t("half")}
              </button>
              <button
                type="button"
                disabled={!isInteractive}
                onClick={() =>
                  setBetAmount(
                    Math.min(balance, Math.max(MIN_BET, betAmount * 2)),
                  )
                }
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-[#94a3b8] hover:bg-navy-700 disabled:opacity-40"
              >
                {t("double")}
              </button>
            </div>

            <p className="mb-4 font-sans text-sm text-[#94a3b8]">
              {t("selectedCount", { count: pickCount, max: KENO_MAX_PICKS })}
            </p>

            {pickCount > 0 && (
              <div className="mb-5 rounded-md border border-navy-700 bg-navy-950/80 p-3">
                <p className="mb-2 text-xs uppercase tracking-wider text-[#94a3b8]">
                  {t("payoutTable")}
                </p>
                <div className="space-y-1">
                  {payoutTable.map((mult, matchIndex) => (
                    <div
                      key={matchIndex}
                      className={cn(
                        "flex items-center justify-between rounded px-2 py-1 font-sans text-xs",
                        result?.matches === matchIndex && phase === "result"
                          ? "bg-orange-500/20 text-orange-400"
                          : "text-[#94a3b8]",
                      )}
                    >
                      <span>
                        {t("matchRow", { count: matchIndex, total: pickCount })}
                      </span>
                      <span className="font-semibold text-white">
                        {formatKenoMultiplier(mult)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {betError && (
              <p className="mb-3 text-sm text-orange-400">{betError}</p>
            )}

            <m.button
              type="button"
              disabled={!canStart}
              onClick={() => void handleStart()}
              whileHover={canStart ? { scale: 1.02 } : undefined}
              whileTap={canStart ? { scale: 0.98 } : undefined}
              className="btn-press btn-cta-shimmer mb-3 flex h-14 w-full items-center justify-center rounded-lg bg-orange-500 font-display text-3xl tracking-[0.08em] text-white disabled:opacity-50"
            >
              {canStart ? t("start") : t("pickMinimum")}
            </m.button>

            <button
              type="button"
              disabled={!isInteractive || pickCount === 0}
              onClick={clearSelection}
              className="w-full rounded-lg border border-navy-700 py-2.5 font-sans text-sm font-medium text-[#94a3b8] transition-colors hover:border-orange-500/50 hover:text-white disabled:opacity-40"
            >
              {t("clear")}
            </button>
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
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                      item.won
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "bg-[#ef4444]/10 text-[#ef4444]",
                    )}
                  >
                    <span>
                      {t("historyLine", {
                        matches: item.matches,
                        picks: item.picks,
                      })}
                    </span>
                    <span className="font-display tracking-wide">
                      {formatKenoMultiplier(item.multiplier)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </m.div>

        <m.div variants={gamePanelRight} className="w-full lg:w-[65%]">
          <AnimatePresence>
            {phase === "drawing" && (
              <m.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 text-center font-sans text-sm text-[#94a3b8]"
              >
                {t("drawing", {
                  current: drawProgress,
                  total: KENO_DRAW_COUNT,
                })}
              </m.p>
            )}

            {phase === "result" && result && (
              <m.div
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-4 rounded-lg border border-navy-700 bg-navy-800/80 px-6 py-4 text-center"
              >
                <p
                  className={cn(
                    "font-display text-4xl tracking-wide md:text-5xl",
                    result.multiplier > 0
                      ? "text-orange-500"
                      : "text-[#94a3b8]",
                  )}
                >
                  {result.multiplier > 0
                    ? t("winBanner", {
                        multiplier: formatKenoMultiplier(result.multiplier),
                      })
                    : t("loseBanner")}
                </p>
                <p className="mt-2 font-sans text-sm text-orange-400">
                  {t("matchSummary", {
                    matches: result.matches,
                    total: pickCount,
                  })}
                </p>
              </m.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-10 gap-2">
            {KENO_NUMBERS.map((num, index) => {
              const cell = getCellVisual(num);
              return (
                <m.button
                  key={num}
                  type="button"
                  disabled={!isInteractive}
                  onClick={() => toggleNumber(num)}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    scale:
                      cell.phase === "flash" && cell.isMatch
                        ? 1.3
                        : cell.isSelected && cell.phase === "idle"
                          ? 1.05
                          : cell.phase === "revealed" && cell.isMatch
                            ? 1
                            : cell.phase === "revealed" && !cell.isMatch
                              ? [1, 0.92, 1]
                              : 1,
                    backgroundColor:
                      cell.phase === "flash"
                        ? "#ffffff"
                        : cell.phase === "revealed" && cell.isMatch
                          ? "#22c55e"
                          : cell.phase === "revealed" && !cell.isMatch
                            ? "#1a3360"
                            : cell.isSelected
                              ? "#f97316"
                              : "#0f2040",
                    color:
                      cell.phase === "flash"
                        ? "#0a1628"
                        : cell.phase === "revealed" && !cell.isMatch
                          ? "#64748b"
                          : cell.isSelected || cell.isMatch
                            ? "#ffffff"
                            : "#cbd5e1",
                    boxShadow:
                      cell.phase === "revealed" && cell.isMatch
                        ? "0 0 20px rgba(34, 197, 94, 0.55)"
                        : cell.isSelected && cell.phase === "idle"
                          ? "0 0 0 2px rgba(249, 115, 22, 0.5)"
                          : "none",
                  }}
                  transition={{
                    opacity: { delay: index * 0.012, duration: 0.25 },
                    scale: {
                      type: "spring",
                      stiffness: 420,
                      damping: 22,
                      duration:
                        cell.phase === "revealed" && !cell.isMatch ? 0.35 : 0.2,
                    },
                    backgroundColor: { duration: 0.12 },
                    color: { duration: 0.12 },
                  }}
                  className={cn(
                    "flex h-[52px] w-full items-center justify-center rounded-lg font-display text-lg tracking-wide",
                    isInteractive && !cell.isSelected && "hover:bg-navy-700",
                    cell.isSelected &&
                      cell.phase === "idle" &&
                      "ring-2 ring-orange-400/60 ring-offset-2 ring-offset-navy-950",
                    cell.phase === "revealed" &&
                      cell.isMatch &&
                      "ring-2 ring-[#22c55e]/80",
                    !isInteractive && "cursor-default",
                  )}
                >
                  {num}
                </m.button>
              );
            })}
          </div>
        </m.div>
      </div>
    </GamePageShell>
  );
}
