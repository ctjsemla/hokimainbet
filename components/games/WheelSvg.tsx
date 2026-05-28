"use client";

import { m } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import {
  formatWheelMultiplier,
  getSegmentVisualStyle,
  WHEEL_HIGHLIGHT_GOLD,
  WHEEL_SPIN_DURATION_S,
  WHEEL_SPIN_EASE,
  type SegmentVisualStyle,
} from "@/lib/wheel";

const CX = 200;
const CY = 200;
const R = 168;
const INNER_R = 52;
export type WheelHighlightPhase = "none" | "white" | "gold";

interface WheelSvgProps {
  multipliers: number[];
  rotation: number;
  isSpinning: boolean;
  postSpinWobble: boolean;
  highlightIndex: number | null;
  highlightPhase: WheelHighlightPhase;
  pointerWobble?: boolean;
  onSpinComplete?: () => void;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function segmentPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function segmentFill(
  style: SegmentVisualStyle,
  isHighlighted: boolean,
  highlightPhase: WheelHighlightPhase,
): string {
  if (!isHighlighted) return style.fill;
  if (highlightPhase === "white") return "#ffffff";
  if (highlightPhase === "gold") return WHEEL_HIGHLIGHT_GOLD;
  return style.fill;
}

function labelFontSize(segmentCount: number): number {
  if (segmentCount <= 10) return 16;
  if (segmentCount <= 20) return 14;
  if (segmentCount <= 30) return 13;
  return 12;
}

export function WheelSvg({
  multipliers,
  rotation,
  isSpinning,
  postSpinWobble,
  highlightIndex,
  highlightPhase,
  pointerWobble = false,
  onSpinComplete,
}: WheelSvgProps) {
  const segmentAngle = 360 / multipliers.length;
  const fontSize = labelFontSize(multipliers.length);
  const labelR = R * 0.68;
  const spinCompleteFiredRef = useRef(false);

  useEffect(() => {
    if (isSpinning) {
      spinCompleteFiredRef.current = false;
    }
  }, [isSpinning]);

  const segments = useMemo(
    () =>
      multipliers.map((mult, index) => {
        const start = index * segmentAngle;
        const end = (index + 1) * segmentAngle;
        const mid = start + segmentAngle / 2;
        const label = polar(CX, CY, labelR, mid);
        const style = getSegmentVisualStyle(mult);

        return {
          index,
          mult,
          path: segmentPath(CX, CY, R, start, end),
          dividerEnd: polar(CX, CY, R, end),
          label,
          labelRotation: mid,
          style,
        };
      }),
    [multipliers, segmentAngle, labelR],
  );

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(100%,520px)]">
      <m.div
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
        style={{ top: `${((CY - R) / 400) * 100}%` }}
        animate={
          pointerWobble
            ? { scale: [1, 1.15, 0.95, 1], y: [0, 3, -2, 0] }
            : isSpinning
              ? { rotate: [-8, 8, -6, 6, 0] }
              : { rotate: 0, scale: 1, y: 0 }
        }
        transition={
          pointerWobble
            ? { type: "spring", stiffness: 520, damping: 14 }
            : isSpinning
              ? { duration: 0.45, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 400, damping: 22 }
        }
        aria-hidden
      >
        <div className="-translate-y-full">
          <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-orange-500 drop-shadow-[0_0_14px_rgba(249,115,22,0.85)]" />
        </div>
      </m.div>
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <filter id="wheel-segment-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f97316" floodOpacity="0.9" />
          </filter>
          <filter id="wheel-segment-inset" x="-20%" y="-20%" width="140%" height="140%">
            <feFlood floodColor="#f97316" floodOpacity="0.35" result="glowColor" />
            <feComposite in="glowColor" in2="SourceAlpha" operator="in" result="innerGlow" />
            <feComposite in="SourceGraphic" in2="innerGlow" operator="over" />
          </filter>
        </defs>

        <m.g
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          animate={
            postSpinWobble
              ? {
                  rotate: [rotation, rotation - 16, rotation + 9, rotation],
                }
              : { rotate: rotation }
          }
          transition={
            isSpinning
              ? {
                  duration: WHEEL_SPIN_DURATION_S,
                  ease: WHEEL_SPIN_EASE,
                }
              : postSpinWobble
                ? {
                    type: "spring",
                    stiffness: 380,
                    damping: 16,
                  }
                : { duration: 0 }
          }
          onAnimationComplete={() => {
            if (!isSpinning || spinCompleteFiredRef.current || postSpinWobble) {
              return;
            }
            spinCompleteFiredRef.current = true;
            onSpinComplete?.();
          }}
        >
          {segments.map((seg) => {
            const isHighlighted = highlightIndex === seg.index;
            const fill = segmentFill(seg.style, isHighlighted, highlightPhase);

            return (
              <g key={seg.index}>
                <path
                  d={seg.path}
                  fill={fill}
                  stroke={
                    isHighlighted && highlightPhase !== "none"
                      ? "#ffffff"
                      : "transparent"
                  }
                  strokeWidth={isHighlighted && highlightPhase !== "none" ? 2 : 0}
                  filter={
                    seg.style.glow
                      ? "url(#wheel-segment-inset)"
                      : undefined
                  }
                />
                <line
                  x1={CX}
                  y1={CY}
                  x2={seg.dividerEnd.x}
                  y2={seg.dividerEnd.y}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1}
                />
                <text
                  x={seg.label.x}
                  y={seg.label.y}
                  fill="#ffffff"
                  fontSize={fontSize}
                  fontWeight="bold"
                  fontFamily="var(--font-bebas), sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${-seg.labelRotation}, ${seg.label.x}, ${seg.label.y})`}
                >
                  {formatWheelMultiplier(seg.mult)}
                </text>
              </g>
            );
          })}
        </m.g>

        <circle cx={CX} cy={CY} r={INNER_R + 4} fill="#0a1628" />
        <circle cx={CX} cy={CY} r={INNER_R} fill="#0a1628" stroke="#1a3360" strokeWidth={2} />
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          fill="#f97316"
          fontSize="14"
          fontFamily="var(--font-bebas), sans-serif"
          letterSpacing="0.08em"
        >
          HOKI
        </text>
        <text
          x={CX}
          y={CY + 10}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8"
          fontFamily="var(--font-jakarta), sans-serif"
          letterSpacing="0.12em"
        >
          MAINBET
        </text>
      </svg>
    </div>
  );
}
