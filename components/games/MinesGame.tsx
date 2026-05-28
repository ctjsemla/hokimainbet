"use client";

import { AnimatePresence, m } from "framer-motion";
import { Bomb, Check, Gem, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { GamePageShell } from "@/components/games/GamePageShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DemoBalanceAlerts } from "@/components/ui/DemoBalanceAlerts";
import { useLoginRequiredAction } from "@/hooks/useLoginRequiredAction";
import { usePersistDemoBalance } from "@/hooks/usePersistDemoBalance";
import {
  calculateMinesMultiplier,
  generateMines,
  TOTAL_TILES,
} from "@/lib/mines";
import { saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

type GameState = "idle" | "playing" | "won" | "dead";
type TileState = "hidden" | "safe" | "mine" | "cashed";

interface TileData {
  index: number;
  isMine: boolean;
  state: TileState;
}

const MIN_BET = 10;
const MINE_PRESETS = [3, 5, 10, 24] as const;

function createInitialTiles(): TileData[] {
  return Array.from({ length: TOTAL_TILES }, (_, index) => ({
    index,
    isMine: false,
    state: "hidden" as TileState,
  }));
}

export function MinesGame() {
  const t = useTranslations("mines");
  const { user } = useAuth();
  const { requireLogin } = useLoginRequiredAction();
  const { balance, persistBalance } = usePersistDemoBalance();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [betAmount, setBetAmount] = useState(50);
  const [mineCount, setMineCount] = useState(5);
  const [tiles, setTiles] = useState<TileData[]>(createInitialTiles);
  const [safeReveals, setSafeReveals] = useState(0);
  const [betError, setBetError] = useState<string | null>(null);
  const [flashRed, setFlashRed] = useState(false);
  const [pulseGreen, setPulseGreen] = useState(false);
  const [gridKey, setGridKey] = useState(0);
  const [explodedIndex, setExplodedIndex] = useState<number | null>(null);

  const activeBetRef = useRef(0);
  const balanceAfterBetRef = useRef(0);
  const minesRef = useRef<Set<number>>(new Set());

  const multiplier = useMemo(
    () => calculateMinesMultiplier(mineCount, safeReveals),
    [mineCount, safeReveals],
  );

  const potentialWin = Math.round(betAmount * multiplier * 100) / 100;
  const isPlaying = gameState === "playing";
  const canCashOut = isPlaying && safeReveals > 0;
  const totalSafe = TOTAL_TILES - mineCount;

  async function finishGame(won: boolean, finalMultiplier: number) {
    const bet = activeBetRef.current;
    const payout = won ? Math.round(bet * finalMultiplier * 100) / 100 : 0;
    const newBalance = won
      ? balanceAfterBetRef.current + payout
      : balanceAfterBetRef.current;

    await persistBalance(newBalance);

    if (user) {
      await saveScore(
        "mines",
        won ? finalMultiplier : 0,
        bet,
        payout,
      );
    }
  }

  async function handleStart() {
    if (gameState === "playing") return;
    if (!requireLogin(Boolean(user), setBetError)) return;

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
    minesRef.current = generateMines(mineCount);
    balanceAfterBetRef.current = balance - betAmount;
    await persistBalance(balanceAfterBetRef.current);

    const nextTiles: TileData[] = Array.from({ length: TOTAL_TILES }, (_, index) => ({
      index,
      isMine: minesRef.current.has(index),
      state: "hidden",
    }));

    setTiles(nextTiles);
    setSafeReveals(0);
    setExplodedIndex(null);
    setFlashRed(false);
    setPulseGreen(false);
    setGameState("playing");
    setGridKey((k) => k + 1);
  }

  async function handleCashOut() {
    if (!canCashOut) return;

    setGameState("won");
    setPulseGreen(true);

    setTiles((prev) =>
      prev.map((tile) => {
        if (tile.state === "safe") return { ...tile, state: "cashed" };
        return tile;
      }),
    );

    await finishGame(true, multiplier);

    setTimeout(() => setPulseGreen(false), 1200);
  }

  async function revealMineHit(clickedIndex: number) {
    setExplodedIndex(clickedIndex);
    setFlashRed(true);
    setGameState("dead");

    setTiles((prev) =>
      prev.map((tile) =>
        tile.index === clickedIndex ? { ...tile, state: "mine" } : tile,
      ),
    );

    const otherMines = Array.from(minesRef.current).filter(
      (i) => i !== clickedIndex,
    );

    otherMines.forEach((mineIndex, staggerIndex) => {
      setTimeout(() => {
        setTiles((prev) =>
          prev.map((tile) =>
            tile.index === mineIndex ? { ...tile, state: "mine" } : tile,
          ),
        );
      }, (staggerIndex + 1) * 50);
    });

    await finishGame(false, 0);

    setTimeout(() => setFlashRed(false), 450);
  }

  async function handleTileClick(index: number) {
    if (gameState !== "playing") return;

    const tile = tiles[index];
    if (tile.state !== "hidden") return;

    if (tile.isMine) {
      await revealMineHit(index);
      return;
    }

    const nextSafeReveals = safeReveals + 1;
    const nextMultiplier = calculateMinesMultiplier(mineCount, nextSafeReveals);

    setTiles((prev) =>
      prev.map((t) => (t.index === index ? { ...t, state: "safe" } : t)),
    );
    setSafeReveals(nextSafeReveals);

    if (nextSafeReveals >= totalSafe) {
      setGameState("won");
      setPulseGreen(true);
      setTiles((prev) =>
        prev.map((t) => (!t.isMine ? { ...t, state: "cashed" as TileState } : t)),
      );
      await finishGame(true, nextMultiplier);
      setTimeout(() => setPulseGreen(false), 1200);
    }
  }

  function adjustBet(delta: number) {
    setBetAmount((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      return Math.max(MIN_BET, Math.min(balance, next));
    });
    setBetError(null);
  }

  function resetToIdle() {
    setGameState("idle");
    setTiles(createInitialTiles());
    setSafeReveals(0);
    setExplodedIndex(null);
    setFlashRed(false);
    setPulseGreen(false);
  }

  return (
    <GamePageShell>

      <AnimatePresence>
        {flashRed && (
          <m.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none fixed inset-0 z-40 bg-[#ef4444]"
          />
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-5 lg:w-[40%]">
          <div className="panel-interactive p-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
              {t("preset")}
            </p>
            <div className="mb-3 flex gap-2">
              {MINE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setMineCount(preset)}
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-semibold transition-colors duration-200",
                    mineCount === preset
                      ? "bg-orange-500 text-white"
                      : "bg-navy-700 text-slate-300 hover:bg-navy-600",
                    isPlaying && "opacity-50",
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>

            <p className="mb-2 text-sm text-slate-400">
              {t("mineCount")}: {t("minesLabel", { count: mineCount })}
            </p>
            <div className="mb-4 flex max-h-24 flex-wrap gap-1 overflow-y-auto">
              {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setMineCount(n)}
                  className={cn(
                    "h-8 min-w-[2rem] rounded px-2 text-xs font-semibold transition-colors duration-200",
                    mineCount === n
                      ? "bg-orange-500 text-white"
                      : "bg-navy-700 text-slate-400 hover:bg-navy-600 hover:text-white",
                    isPlaying && "opacity-50",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            <p className="mb-2 text-sm text-slate-400">{t("betAmount")}</p>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                disabled={isPlaying}
                onClick={() => adjustBet(-10)}
                className="rounded-md bg-navy-800 p-2 text-white hover:bg-navy-700 disabled:opacity-40"
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
                className="rounded-md bg-navy-800 p-2 text-white hover:bg-navy-700 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                disabled={isPlaying}
                onClick={() =>
                  setBetAmount(Math.max(MIN_BET, Math.floor(betAmount / 2)))
                }
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-slate-300 hover:bg-navy-700 disabled:opacity-40"
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
                className="flex-1 rounded-md bg-navy-800 py-2 text-sm text-slate-300 hover:bg-navy-700 disabled:opacity-40"
              >
                {t("double")}
              </button>
            </div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              {t("multiplier")}
            </p>
            <AnimatePresence mode="wait">
              <m.p
                key={multiplier.toFixed(2)}
                initial={{ opacity: 0.6, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="font-display text-5xl tracking-[0.06em] text-orange-500 md:text-6xl"
              >
                {multiplier.toFixed(2)}x
              </m.p>
            </AnimatePresence>

            {betError && (
              <p className="mt-3 text-sm text-orange-400">{betError}</p>
            )}

            {gameState === "idle" && (
              <button
                type="button"
                onClick={handleStart}
                className="btn-press btn-shimmer mt-6 w-full rounded-lg py-3.5 font-display text-3xl tracking-[0.06em] text-white"
              >
                {t("start")}
              </button>
            )}

            {canCashOut && (
              <div className="mt-6 space-y-2">
                <m.button
                  type="button"
                  onClick={handleCashOut}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  className="w-full rounded-md bg-[#22c55e] py-3.5 font-display text-xl tracking-wide text-white hover:bg-[#16a34a]"
                >
                  {t("cashOut", { multiplier: multiplier.toFixed(2) })}
                </m.button>
                <p className="text-center text-sm text-slate-400">
                  {t("potentialWin")}:{" "}
                  <span className="font-semibold text-white">
                    {potentialWin.toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {(gameState === "won" || gameState === "dead") && (
              <button
                type="button"
                onClick={resetToIdle}
                className="mt-6 w-full rounded-md bg-navy-700 py-3 font-display text-xl text-white hover:bg-navy-600"
              >
                {t("start")}
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
        </div>

        <div className="w-full lg:w-[60%]">
          <div
            key={gridKey}
            className="panel-interactive grid grid-cols-5 gap-2 p-4 md:gap-2"
          >
            {tiles.map((tile, index) => (
              <MineTile
                key={`${gridKey}-${tile.index}`}
                tile={tile}
                index={index}
                gameState={gameState}
                isPlaying={isPlaying}
                explodedIndex={explodedIndex}
                pulseGreen={pulseGreen}
                onClick={() => handleTileClick(tile.index)}
              />
            ))}
          </div>
        </div>
      </div>
    </GamePageShell>
  );
}

interface MineTileProps {
  tile: TileData;
  index: number;
  gameState: GameState;
  isPlaying: boolean;
  explodedIndex: number | null;
  pulseGreen: boolean;
  onClick: () => void;
}

function MineTile({
  tile,
  index,
  gameState,
  isPlaying,
  explodedIndex,
  pulseGreen,
  onClick,
}: MineTileProps) {
  const isHidden = tile.state === "hidden";
  const isSafe = tile.state === "safe";
  const isMine = tile.state === "mine";
  const isCashed = tile.state === "cashed";
  const isExploded = explodedIndex === tile.index;

  const canClick = isPlaying && isHidden;

  return (
    <m.button
      type="button"
      disabled={!canClick}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85, rotateY: 0 }}
      animate={{
        opacity: 1,
        scale: isExploded ? [1, 1.25, 1] : pulseGreen && (isSafe || isCashed) ? [1, 1.06, 1] : 1,
        rotateY: isHidden ? 0 : 180,
      }}
      transition={{
        opacity: { delay: index * 0.02, duration: 0.2 },
        scale: isExploded
          ? { duration: 0.35 }
          : pulseGreen
            ? { repeat: Infinity, duration: 0.6 }
            : { delay: index * 0.02, duration: 0.2 },
        rotateY: { duration: 0.3 },
      }}
      className={cn(
        "relative aspect-square w-full rounded-md border transition-colors duration-200 [transform-style:preserve-3d]",
        isHidden &&
          "border-navy-700 bg-navy-800 hover:-translate-y-0.5 hover:border-navy-600 hover:bg-navy-700",
        isSafe && "border-orange-500/50 bg-navy-700 shadow-lg shadow-orange-500/20",
        isMine && "border-[#ef4444] bg-[#ef4444]",
        isCashed && "border-navy-600 bg-navy-600",
        isExploded && gameState === "dead" && "z-10",
        !canClick && isHidden && gameState !== "idle" && "cursor-default",
      )}
      style={{ perspective: 600 }}
    >
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center [backface-visibility:hidden]",
          isHidden ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
          !isHidden ? "opacity-100" : "opacity-0",
        )}
      >
        {isSafe && (
          <m.span
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: [0, 1.5, 1], opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 rounded-md bg-orange-500/30"
          />
        )}
        {isSafe && <Gem className="relative h-5 w-5 text-orange-500 md:h-6 md:w-6" strokeWidth={1.75} />}
        {isCashed && <Check className="h-5 w-5 text-[#22c55e] md:h-6 md:w-6" strokeWidth={2} />}
        {isMine && (
          <m.div
            animate={isExploded ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Bomb className="h-5 w-5 text-white md:h-6 md:w-6" strokeWidth={1.75} />
          </m.div>
        )}
      </span>
    </m.button>
  );
}
