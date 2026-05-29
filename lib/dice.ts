import { PLAYER_RETURN_FACTOR } from "@/lib/gameEconomy";

export type RollMode = "under" | "over";

export function randomDiceRoll(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function getWinChance(threshold: number, mode: RollMode): number {
  return mode === "under" ? threshold - 1 : 100 - threshold;
}

export function getDiceMultiplier(threshold: number, mode: RollMode): number {
  if (mode === "under") {
    return (100 / (threshold - 1)) * PLAYER_RETURN_FACTOR;
  }
  return (100 / (100 - threshold)) * PLAYER_RETURN_FACTOR;
}

export function checkDiceWin(
  result: number,
  threshold: number,
  mode: RollMode,
): boolean {
  return mode === "under" ? result < threshold : result > threshold;
}
