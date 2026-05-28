"use client";

import { m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CardLiveTicker } from "@/components/home/CardLiveTicker";
import { useLiveTicker } from "@/hooks/useLiveTicker";
import { cn } from "@/lib/utils";
import {
  buildWheelMultipliers,
  getSegmentVisualStyle,
} from "@/lib/wheel";

const GRID_TEXTURE = {
  backgroundImage: `
    linear-gradient(rgba(26, 51, 96, 0.35) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 51, 96, 0.35) 1px, transparent 1px)
  `,
  backgroundSize: "32px 32px",
};

function VisualRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {children}
    </div>
  );
}

export function CrashCardVisual() {
  const ticker = useLiveTicker(
    () => `${(1.2 + Math.random() * 7).toFixed(2)}x`,
    1500,
    "2.41x",
  );
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setLoopKey((k) => k + 1), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <VisualRoot>
      <div className="absolute inset-0 opacity-40" style={GRID_TEXTURE} aria-hidden />
      <CardLiveTicker value={ticker} size="lg" />
      <div className="flex h-full w-full items-center justify-center p-2" aria-hidden>
        <svg
          viewBox="0 0 400 200"
          className="h-full w-full max-h-[220px] max-w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="home-crash-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f97316" floodOpacity="1" />
            </filter>
          </defs>
          <m.path
            key={loopKey}
            d="M 20 175 Q 100 155 160 115 T 280 45 T 375 22"
            fill="none"
            stroke="#f97316"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#home-crash-glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
          <m.g
            style={{ transformOrigin: "375px 22px" }}
            animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <polygon
              points="375,8 385,28 365,28"
              fill="#f97316"
              style={{ filter: "drop-shadow(0 0 10px #f97316)" }}
            />
          </m.g>
        </svg>
      </div>
    </VisualRoot>
  );
}

export function DiceCardVisual() {
  const ticker = useLiveTicker(
    () => `${Math.round(45 + Math.random() * 54)}`,
    1500,
    "84",
  );

  return (
    <VisualRoot>
      <CardLiveTicker value={ticker} />
      <div className="flex h-full items-center justify-end pr-4 md:pr-8" aria-hidden>
        <m.div
          className="opacity-[0.28] transition-opacity duration-300 group-hover:opacity-[0.38]"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 120 120" className="h-[140px] w-[140px] md:h-[160px] md:w-[160px]">
            <rect
              x="8"
              y="8"
              width="104"
              height="104"
              rx="16"
              fill="none"
              stroke="#1a3360"
              strokeWidth="4"
            />
            {[
              [32, 32],
              [88, 32],
              [60, 60],
              [32, 88],
              [88, 88],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill="#1a3360" />
            ))}
          </svg>
        </m.div>
      </div>
    </VisualRoot>
  );
}

const MINES_SIZE = 22;
const MINES_GAP = 5;

function MinesTile({
  index,
  revealed,
  flipIndex,
  bombIndex,
}: {
  index: number;
  revealed: boolean;
  flipIndex: number;
  bombIndex: number | null;
}) {
  const isFlipping = flipIndex === index;

  return (
    <m.div
      className="flex items-center justify-center rounded-md border border-navy-700 bg-navy-800"
      style={{ width: MINES_SIZE, height: MINES_SIZE }}
      animate={isFlipping ? { rotateY: [0, 90, 0], scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.4 }}
    >
      {bombIndex === index ? (
        <span className="text-sm leading-none">💣</span>
      ) : revealed || isFlipping ? (
        <span className="font-display text-sm text-orange-500">✦</span>
      ) : (
        <span className="h-2.5 w-2.5 rounded-sm bg-navy-700" />
      )}
    </m.div>
  );
}

export function MinesCardVisual() {
  const ticker = useLiveTicker(
    () => `${(1.5 + Math.random() * 5).toFixed(1)}x`,
    1500,
    "3.2x",
  );
  const [flipIndex, setFlipIndex] = useState(-1);
  const [bombIndex, setBombIndex] = useState<number | null>(null);

  const hiddenIndices = useMemo(
    () => Array.from({ length: 16 }, (_, i) => i).filter((i) => i % 2 === 1),
    [],
  );

  useEffect(() => {
    const flipId = setInterval(() => {
      const pick = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
      setFlipIndex(pick);
      setTimeout(() => setFlipIndex(-1), 500);
    }, 1800);
    return () => clearInterval(flipId);
  }, [hiddenIndices]);

  useEffect(() => {
    const bombId = setInterval(() => {
      const pick = Math.floor(Math.random() * 16);
      setBombIndex(pick);
      setTimeout(() => setBombIndex(null), 800);
    }, 4500);
    return () => clearInterval(bombId);
  }, []);

  return (
    <VisualRoot>
      <CardLiveTicker value={ticker} />
      <div
        className="flex h-full items-center justify-end pr-2 opacity-[0.32] md:pr-6"
        aria-hidden
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(4, ${MINES_SIZE}px)`,
            gap: MINES_GAP,
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <MinesTile
              key={i}
              index={i}
              revealed={i % 2 === 0}
              flipIndex={flipIndex}
              bombIndex={bombIndex}
            />
          ))}
        </div>
      </div>
    </VisualRoot>
  );
}

const PLINKO_SLOTS = [0.2, 0.5, 1, 2, 5, 10, 50, 110, 50, 10, 5, 2, 1, 0.5, 0.2];
const PLINKO_ROWS = 8;

function buildPlinkoPath(): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [{ x: 100, y: 6 }];
  let col = 0;
  for (let row = 0; row < PLINKO_ROWS; row++) {
    col += Math.random() > 0.5 ? 1 : 0;
    const cols = row + 1;
    const x = 100 + (col - (cols - 1) / 2) * 13;
    const y = 12 + row * 12;
    path.push({ x, y });
  }
  const slotIndex = Math.min(
    PLINKO_SLOTS.length - 1,
    Math.max(0, col + Math.floor(PLINKO_ROWS / 2)),
  );
  path.push({ x: 18 + slotIndex * 10.5, y: 118 });
  return path;
}

export function PlinkoCardVisual() {
  const [path, setPath] = useState(buildPlinkoPath);
  const [step, setStep] = useState(0);
  const [flashHigh, setFlashHigh] = useState(false);

  const ticker = useLiveTicker(
    () => `${Math.round(2 + Math.random() * 108)}x`,
    1500,
    "110x",
  );

  useEffect(() => {
    const runDrop = () => {
      const nextPath = buildPlinkoPath();
      setPath(nextPath);
      setStep(0);
      setFlashHigh(false);

      let i = 0;
      const stepId = setInterval(() => {
        i += 1;
        setStep(i);
        if (i >= nextPath.length - 1) {
          clearInterval(stepId);
          const landed = PLINKO_SLOTS[Math.min(PLINKO_SLOTS.length - 1, i)];
          if (landed >= 50) setFlashHigh(true);
          setTimeout(() => setFlashHigh(false), 1200);
        }
      }, 360);
      return stepId;
    };

    let stepId = runDrop();
    const dropId = setInterval(() => {
      clearInterval(stepId);
      stepId = runDrop();
    }, 3200);
    return () => {
      clearInterval(stepId);
      clearInterval(dropId);
    };
  }, []);

  const ball = path[Math.min(step, path.length - 1)] ?? path[0];

  return (
    <VisualRoot>
      <CardLiveTicker value={ticker} flash={flashHigh} size="lg" />
      <div className="flex h-full w-full items-center justify-center p-1" aria-hidden>
        <svg
          viewBox="0 0 200 125"
          className="h-full max-h-[160px] w-full max-w-[340px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {Array.from({ length: PLINKO_ROWS }).map((_, row) =>
            Array.from({ length: row + 1 }).map((__, col) => {
              const x = 100 + (col - row / 2) * 13;
              const y = 12 + row * 12;
              return (
                <circle
                  key={`${row}-${col}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#1a3360"
                  opacity="0.85"
                />
              );
            }),
          )}
          <rect
            x="10"
            y="110"
            width="180"
            height="10"
            rx="2"
            fill="#1a3360"
            opacity="0.6"
          />
          <m.circle
            r="5"
            fill="#f97316"
            animate={{ cx: ball.x, cy: ball.y }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 8px #f97316)" }}
          />
        </svg>
      </div>
    </VisualRoot>
  );
}

const WHEEL_CARD_MULTIPLIERS = buildWheelMultipliers("medium", 10);

function wheelCardSegmentPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const start = {
    x: cx + r * Math.cos(toRad(endDeg)),
    y: cy + r * Math.sin(toRad(endDeg)),
  };
  const end = {
    x: cx + r * Math.cos(toRad(startDeg)),
    y: cy + r * Math.sin(toRad(startDeg)),
  };
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function WheelCardVisual() {
  const ticker = useLiveTicker(
    () => `${(1.2 + Math.random() * 9).toFixed(1)}x`,
    1500,
    "3.5x",
  );

  const segmentAngle = 360 / WHEEL_CARD_MULTIPLIERS.length;

  return (
    <VisualRoot>
      <CardLiveTicker value={ticker} />
      <div className="flex h-full items-center justify-end pr-2 md:pr-4" aria-hidden>
        <m.div
          className="opacity-[0.42]"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 200 200" className="h-[170px] w-[170px] md:h-[190px] md:w-[190px]">
            {WHEEL_CARD_MULTIPLIERS.map((mult, index) => {
              const start = index * segmentAngle;
              const end = (index + 1) * segmentAngle;
              const style = getSegmentVisualStyle(mult);
              return (
                <path
                  key={index}
                  d={wheelCardSegmentPath(100, 100, 90, start, end)}
                  fill={style.fill}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={0.75}
                />
              );
            })}
            <circle cx={100} cy={100} r={24} fill="#0a1628" stroke="#1a3360" strokeWidth={2} />
          </svg>
        </m.div>
      </div>
    </VisualRoot>
  );
}

export function KenoCardVisual() {
  const [lit, setLit] = useState<Set<number>>(new Set());

  const ticker = useLiveTicker(
    () => `${Math.round(5 + Math.random() * 195)}x`,
    1500,
    "200x",
  );

  useEffect(() => {
    let step = 0;
    let order: number[] = [];

    const runCycle = () => {
      order = Array.from({ length: 40 }, (_, i) => i + 1);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      step = 0;
      setLit(new Set());
    };

    runCycle();

    const interval = setInterval(() => {
      if (step >= 10) {
        runCycle();
        return;
      }
      setLit((prev) => new Set(prev).add(order[step]));
      step += 1;
    }, 380);

    return () => clearInterval(interval);
  }, []);

  return (
    <VisualRoot>
      <CardLiveTicker value={ticker} />
      <div className="flex h-full items-center justify-end pr-1 md:pr-3" aria-hidden>
        <div className="grid grid-cols-10 gap-[3px] opacity-[0.35]">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => (
            <div
              key={num}
              className={cn(
                "flex h-[14px] w-[14px] items-center justify-center rounded-sm font-display text-[7px] transition-colors duration-200 md:h-[16px] md:w-[16px] md:text-[8px]",
                lit.has(num)
                  ? "bg-orange-500 text-white shadow-[0_0_6px_rgba(249,115,22,0.5)]"
                  : "bg-navy-700 text-navy-600",
              )}
            >
              {num}
            </div>
          ))}
        </div>
      </div>
    </VisualRoot>
  );
}
