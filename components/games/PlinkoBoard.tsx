"use client";

import { m } from "framer-motion";
import { useMemo } from "react";
import {
  formatMultiplier,
  getPegPositions,
  getSlotFill,
  type PlinkoPoint,
} from "@/lib/plinko";

const BOARD_WIDTH = 520;
const BOARD_HEIGHT = 560;

interface ActiveBall {
  id: string;
  waypoints: PlinkoPoint[];
  duration: number;
  slotIndex: number;
  multiplier: number;
}

interface PlinkoBoardProps {
  rows: number;
  multipliers: number[];
  activeBalls: ActiveBall[];
  flashingPeg: string | null;
  activeSlot: number | null;
  landingPulse: { slot: number; win: boolean } | null;
}

export function PlinkoBoard({
  rows,
  multipliers,
  activeBalls,
  flashingPeg,
  activeSlot,
  landingPulse,
}: PlinkoBoardProps) {
  const pegs = useMemo(
    () => getPegPositions(rows, BOARD_WIDTH, BOARD_HEIGHT),
    [rows],
  );

  const maxMult = Math.max(...multipliers, 1);
  const slotCount = multipliers.length;
  const paddingX = 28;
  const slotWidth = (BOARD_WIDTH - paddingX * 2) / slotCount;
  const slotBaseY = BOARD_HEIGHT - 48;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-navy-800 bg-navy-900">
      <svg
        viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Plinko board"
      >
        {pegs.map((peg) => {
          const pegKey = `${peg.row}-${peg.col}`;
          return (
            <circle
              key={pegKey}
              cx={peg.x}
              cy={peg.y}
              r={4}
              fill={flashingPeg === pegKey ? "#ffffff" : "#94a3b8"}
              opacity={flashingPeg === pegKey ? 1 : 0.65}
            />
          );
        })}

        {multipliers.map((mult, i) => {
          const height = 20 + (mult / maxMult) * 40;
          const x = paddingX + i * slotWidth + 2;
          const y = slotBaseY - height;
          const w = slotWidth - 4;
          const isActive = activeSlot === i;
          const isLanding = landingPulse?.slot === i;
          const isWin = landingPulse?.win ?? false;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={height}
                rx={4}
                fill={getSlotFill(mult)}
                opacity={isActive || isLanding ? 1 : 0.88}
              />
              {isLanding && (
                <m.rect
                  x={x - 2}
                  y={y - 2}
                  width={w + 4}
                  height={height + 4}
                  rx={6}
                  fill="none"
                  stroke={isWin ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <text
                x={x + w / 2}
                y={y + height - 6}
                textAnchor="middle"
                className="fill-white text-[9px] font-bold md:text-[10px]"
              >
                {formatMultiplier(mult)}
              </text>
            </g>
          );
        })}

        {activeBalls.map((ball) => {
          const cx = ball.waypoints.map((p) => p.x);
          const cy = ball.waypoints.map((p) => p.y);
          const times = cx.map((_, i) => i / (cx.length - 1));

          return (
            <m.circle
              key={ball.id}
              r={9}
              fill="#f97316"
              initial={{ cx: cx[0], cy: cy[0] }}
              animate={{ cx, cy }}
              transition={{
                duration: ball.duration / 1000,
                ease: "easeInOut",
                times,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export { BOARD_HEIGHT, BOARD_WIDTH };
