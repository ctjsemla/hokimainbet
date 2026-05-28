"use client";

import { AnimatePresence, m } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { GamePageShell } from "@/components/games/GamePageShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DemoBalanceAlerts } from "@/components/ui/DemoBalanceAlerts";
import { usePersistDemoBalance } from "@/hooks/usePersistDemoBalance";
import {
  checkDiceWin,
  getDiceMultiplier,
  getWinChance,
  randomDiceRoll,
  type RollMode,
} from "@/lib/dice";
import { saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

type GameState = "idle" | "rolling" | "win" | "lose";

interface RollHistoryItem {
  id: string;
  result: number;
  won: boolean;
  multiplier: number;
}

const MIN_BET = 10;
const REVEAL_DELAY_MS = 200;
const RESULT_PAUSE_MS = 2000;

export function DiceGame() {
  const t = useTranslations("dice");
  const { user } = useAuth();
  const { balance, persistBalance } = usePersistDemoBalance();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [betAmount, setBetAmount] = useState(50);
  const [threshold, setThreshold] = useState(50);
  const [mode, setMode] = useState<RollMode>("under");
  const [result, setResult] = useState<number | null>(null);
  const [displayResult, setDisplayResult] = useState<number | null>(null);
  const [betError, setBetError] = useState<string | null>(null);
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const [pulseWin, setPulseWin] = useState(false);
  const [flash, setFlash] = useState<"win" | "lose" | null>(null);

  const winChance = useMemo(
    () => getWinChance(threshold, mode),
    [threshold, mode],
  );
  const multiplier = useMemo(
    () => getDiceMultiplier(threshold, mode),
    [threshold, mode],
  );

  const isPlaying = gameState === "rolling";

  const winningZoneStyle = useMemo(() => {
    if (mode === "under") {
      return { left: "0%", width: `${threshold - 1}%` };
    }
    return { left: `${threshold}%`, width: `${100 - threshold}%` };
  }, [mode, threshold]);

  async function handleRoll() {
    if (isPlaying) return;

    if (betAmount < MIN_BET) {
      setBetError(t("minBet"));
      return;
    }

    if (betAmount > balance) {
      setBetError(t("insufficientBalance"));
      return;
    }

    setBetError(null);
    setGameState("rolling");
    setPulseWin(false);
    setFlash(null);
    setResult(null);
    setDisplayResult(null);

    const finalResult = randomDiceRoll();
    const won = checkDiceWin(finalResult, threshold, mode);
    const payout = won
      ? Math.round(betAmount * multiplier * 100) / 100
      : 0;

    const balanceAfterBet = balance - betAmount;
    await persistBalance(balanceAfterBet);

    const scrambleInterval = setInterval(() => {
      setDisplayResult(randomDiceRoll());
    }, 40);

    await new Promise((resolve) => setTimeout(resolve, REVEAL_DELAY_MS));

    clearInterval(scrambleInterval);
    setDisplayResult(finalResult);
    setResult(finalResult);

    if (won) {
      setGameState("win");
      setPulseWin(true);
      setFlash("win");
      await persistBalance(balanceAfterBet + payout);
      if (user) {
        await saveScore("dice", multiplier, betAmount, payout);
      }
    } else {
      setGameState("lose");
      setShakeKey((k) => k + 1);
      setFlash("lose");
      if (user) {
        await saveScore("dice", 0, betAmount, 0);
      }
    }

    setRollHistory((prev) =>
      [
        {
          id: `${Date.now()}`,
          result: finalResult,
          won,
          multiplier: won ? multiplier : 0,
        },
        ...prev,
      ].slice(0, 10),
    );

    setTimeout(() => {
      setGameState("idle");
      setPulseWin(false);
      setFlash(null);
    }, RESULT_PAUSE_MS);
  }

  function adjustBet(delta: number) {
    setBetAmount((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.max(MIN_BET, Math.min(balance, next));
    });
    setBetError(null);
  }

  const resultValue = displayResult ?? "—";
  const resultColor =
    gameState === "win"
      ? "text-[#22c55e]"
      : gameState === "lose"
        ? "text-[#ef4444]"
        : "text-slate-500";

  const markerLeft = result !== null ? `${result}%` : "0%";
  const thresholdLeft = `${threshold}%`;

  return (
    <GamePageShell>

      <AnimatePresence>
        {flash === "win" && (
          <m.div
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-40 bg-[#22c55e]"
          />
        )}
        {flash === "lose" && (
          <m.div
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none fixed inset-0 z-40 bg-[#ef4444]"
          />
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <m.div
          key={shakeKey}
          animate={
            gameState === "lose"
              ? { x: [0, -8, 8, -6, 6, 0] }
              : pulseWin
                ? { scale: [1, 1.06, 1] }
                : { x: 0, scale: 1 }
          }
          transition={{ duration: 0.35 }}
          className={cn(
            "font-display text-[104px] leading-none tracking-[0.08em] md:text-[128px]",
            resultColor,
            pulseWin && "drop-shadow-[0_0_24px_rgba(34,197,94,0.45)]",
          )}
        >
          {isPlaying ? displayResult ?? "—" : resultValue}
        </m.div>

        <AnimatePresence mode="wait">
          {(gameState === "win" || gameState === "lose") && (
            <m.p
              key={gameState}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "mt-2 font-display text-3xl tracking-wide",
                gameState === "win" ? "text-[#22c55e]" : "text-[#ef4444]",
              )}
            >
              {gameState === "win" ? t("win") : t("lose")}
            </m.p>
          )}
          {gameState === "rolling" && (
            <m.p
              key="rolling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm uppercase tracking-widest text-slate-500"
            >
              {t("rolling")}
            </m.p>
          )}
        </AnimatePresence>

        <div className="relative mt-10 h-10 w-full max-w-3xl">
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-navy-700" />
          <m.div
            className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-orange-500"
            animate={{
              left: winningZoneStyle.left,
              width: winningZoneStyle.width,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
          <m.div
            className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 border-l border-dashed border-slate-400"
            animate={{ left: thresholdLeft }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
          {result !== null && (
            <m.div
              className="absolute top-0 bottom-0 w-1 -translate-x-1/2 rounded-full bg-white shadow-lg shadow-white/30"
              initial={{ left: "0%" }}
              animate={{ left: markerLeft }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          )}
          <div className="absolute -bottom-6 inset-x-0 flex justify-between text-xs text-slate-600">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div className="panel-interactive mt-16 w-full max-w-4xl p-4 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm text-slate-400">{t("betAmount")}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => adjustBet(-10)}
                  className="rounded-md bg-navy-900 p-2 text-white transition-colors hover:bg-navy-700 disabled:opacity-40"
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
                  className="w-full rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-center text-white outline-none focus:border-orange-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => adjustBet(10)}
                  className="rounded-md bg-navy-900 p-2 text-white transition-colors hover:bg-navy-700 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() =>
                    setBetAmount(Math.max(MIN_BET, Math.floor(betAmount / 2)))
                  }
                  className="flex-1 rounded-md bg-navy-900 py-2 text-sm text-slate-300 hover:bg-navy-700 disabled:opacity-40"
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
                  className="flex-1 rounded-md bg-navy-900 py-2 text-sm text-slate-300 hover:bg-navy-700 disabled:opacity-40"
                >
                  {t("double")}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">{t("threshold")}</span>
                  <span className="font-semibold text-orange-500">
                    {threshold}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={98}
                  value={threshold}
                  disabled={isPlaying}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-navy-700 accent-orange-500 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-1 rounded-full bg-navy-900 p-1">
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setMode("under")}
                  className={cn(
                    "flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-200",
                    mode === "under"
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {t("rollUnder")}
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setMode("over")}
                  className={cn(
                    "flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-200",
                    mode === "over"
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-white",
                  )}
                >
                  {t("rollOver")}
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  {t("winChance")}:{" "}
                  <span className="font-semibold text-white">
                    {winChance.toFixed(1)}%
                  </span>
                </span>
                <span className="text-slate-400">
                  {t("multiplier")}:{" "}
                  <span className="font-semibold text-orange-500">
                    {multiplier.toFixed(2)}x
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 lg:items-end">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {t("balance")}
                </p>
                <p className="font-display text-4xl tracking-[0.04em] text-white">
                  <AnimatedNumber value={balance} />
                </p>
                <DemoBalanceAlerts align="right" className="mt-1" />
              </div>
              {betError && (
                <p className="text-right text-sm text-orange-400">
                  {betError}
                </p>
              )}
              <m.button
                type="button"
                disabled={isPlaying}
                onClick={handleRoll}
                className="btn-press btn-shimmer w-full rounded-lg py-4 font-display text-3xl tracking-[0.06em] text-white disabled:opacity-60 lg:min-w-[200px]"
              >
                {isPlaying ? t("rolling") : t("roll")}
              </m.button>
            </div>
          </div>
        </div>

        {rollHistory.length > 0 && (
          <div className="mt-10 w-full max-w-4xl">
            <p className="mb-3 text-xs uppercase tracking-wider text-slate-500">
              {t("rollHistory")}
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {rollHistory.map((item) => (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, x: -24, scale: 0.6 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    title={
                      item.won
                        ? t("historyMultiplier", {
                            multiplier: item.multiplier.toFixed(2),
                          })
                        : `${item.result}`
                    }
                    className={cn(
                      "group relative h-9 w-9 cursor-default rounded-full border-2 transition-transform hover:scale-110",
                      item.won
                        ? "border-[#22c55e] bg-[#22c55e]/20"
                        : "border-[#ef4444] bg-[#ef4444]/20",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy-800 px-2 py-0.5 text-xs group-hover:block",
                        item.won ? "text-[#22c55e]" : "text-[#ef4444]",
                      )}
                    >
                      {item.won
                        ? t("historyMultiplier", {
                            multiplier: item.multiplier.toFixed(2),
                          })
                        : item.result}
                    </span>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </GamePageShell>
  );
}
