import { CoverShell } from "@/components/slots/covers/CoverShell";

const VB = "0 0 200 200";

const WANTED_HOLES = [
  { cx: 32, cy: 38 },
  { cx: 168, cy: 52 },
  { cx: 48, cy: 162 },
];

const CHAOS_SPARKS = [
  { left: "8%", top: "12%", delay: "0s", color: "#fbbf24" },
  { left: "88%", top: "18%", delay: "0.4s", color: "#4ade80" },
  { left: "12%", top: "82%", delay: "0.8s", color: "#fbbf24" },
  { left: "85%", top: "78%", delay: "0.2s", color: "#4ade80" },
  { left: "5%", top: "45%", delay: "1.1s", color: "#fbbf24" },
  { left: "92%", top: "50%", delay: "0.6s", color: "#4ade80" },
];

const RAIN_DROPS = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 17 + 5) % 95}%`,
  top: `${(i * 23) % 80}%`,
  duration: `${0.5 + (i % 5) * 0.2}s`,
  delay: `${(i % 7) * 0.15}s`,
}));

const BOBBIES_STONES = Array.from({ length: 12 }, (_, i) => ({
  x: 18 + (i % 4) * 42,
  y: 120 + Math.floor(i / 4) * 22,
}));

function BulletHole({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r="10" fill="#0f2040" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle r="4" fill="rgba(255,255,255,0.25)" />
      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1="0"
          y1="-14"
          x2="0"
          y2="-20"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          transform={`rotate(${deg})`}
        />
      ))}
    </g>
  );
}

export function WantedDeadOrAWildCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at center, #1f0d00 0%, #060d1f 80%)"
      maxWin="x12,500"
      ambientGlow="radial-gradient(ellipse at 50% 50%, rgba(212,160,23,0.1), transparent 60%)"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <rect
          x="12"
          y="12"
          width="176"
          height="176"
          fill="none"
          stroke="#8b6914"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <g className="slot-wanted-star-spin" style={{ transformOrigin: "100px 100px" }}>
          <polygon
            points="100,42 108,78 148,78 116,102 128,148 100,122 72,148 84,102 52,78 92,78"
            fill="#d4a017"
            style={{ filter: "drop-shadow(0 0 10px rgba(212,160,23,0.7))" }}
          />
        </g>
        {WANTED_HOLES.map((h, i) => (
          <BulletHole key={i} cx={h.cx} cy={h.cy} />
        ))}
      </svg>
    </CoverShell>
  );
}

export function ChaosCrewCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at bottom, #050514 0%, #060d1f 80%)"
      maxWin="x10,000"
      maxWinClassName="text-[#4ade80]"
      ambientGlow="radial-gradient(ellipse at 50% 70%, rgba(74,222,128,0.08), transparent 55%)"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[1] h-full w-full" aria-hidden>
        {[
          "M30 40 Q50 25 70 45 Q55 60 35 50",
          "M150 55 Q170 40 185 60 Q165 75 145 65",
          "M45 150 Q65 135 80 155 Q60 170 40 160",
          "M130 140 Q155 125 175 145 Q150 165 125 155",
        ].map((d, i) => (
          <path key={i} d={d} fill="#4ade80" fillOpacity="0.05" />
        ))}
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <path
          d="M118 75 L128 100 H112 L138 135 L108 105 H122 L95 70 Z"
          fill="#fbbf24"
          className="slot-lightning-flicker"
          style={{ filter: "drop-shadow(0 0 6px #fbbf24)" }}
        />
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <ellipse
          cx="92"
          cy="108"
          rx="28"
          ry="32"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2.5"
          style={{ filter: "drop-shadow(0 0 14px #4ade80)" }}
        />
        <circle cx="80" cy="100" r="5" fill="#4ade80" />
        <circle cx="104" cy="100" r="5" fill="#4ade80" />
        <rect x="78" y="118" width="6" height="3" fill="#4ade80" opacity="0.8" />
        <rect x="86" y="118" width="6" height="3" fill="#4ade80" opacity="0.8" />
        <rect x="94" y="118" width="6" height="3" fill="#4ade80" opacity="0.8" />
        <rect x="102" y="118" width="6" height="3" fill="#4ade80" opacity="0.8" />
      </svg>

      {CHAOS_SPARKS.map((s, i) => (
        <span
          key={i}
          className="slot-spark-flash absolute z-[4] h-1 w-1 rounded-full"
          style={{
            left: s.left,
            top: s.top,
            backgroundColor: s.color,
            animationDelay: s.delay,
          }}
        />
      ))}
    </CoverShell>
  );
}

export function BookOfTimeCover() {
  const pages = [
    { x: 35, y: 50, rot: -12, delay: "0s" },
    { x: 145, y: 45, rot: 10, delay: "1.2s" },
    { x: 90, y: 35, rot: 5, delay: "2.4s" },
  ];

  return (
    <CoverShell
      background="radial-gradient(ellipse at top right, #050a20 0%, #060d1f 80%)"
      maxWin="x10,000"
      maxWinClassName="text-[#93c5fd]"
      ambientGlow="radial-gradient(ellipse at 70% 25%, rgba(251,146,60,0.08), transparent 50%)"
    >
      {pages.map((p, i) => (
        <div
          key={i}
          className="slot-page-drift absolute z-[2] h-5 w-4 rounded-sm bg-white/10"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: p.delay,
          }}
        />
      ))}

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <path d="M55 75 L100 62 L100 135 L55 125 Z" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="2" />
        <path d="M100 62 L145 75 L145 125 L100 135 Z" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="2" />
        <line x1="100" y1="62" x2="100" y2="135" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />
        {[78, 88, 98, 108, 118].map((y) => (
          <line key={y} x1="62" y1={y} x2="88" y2={y} stroke="white" strokeOpacity="0.08" strokeWidth="1" />
        ))}
        <circle cx="122" cy="98" r="18" fill="none" stroke="#fb923c" strokeWidth="1.5" />
        <g style={{ transformOrigin: "122px 98px" }}>
          <line
            x1="122"
            y1="98"
            x2="122"
            y2="86"
            stroke="#fb923c"
            strokeWidth="2"
            className="slot-minute-hand"
          />
          <line
            x1="122"
            y1="98"
            x2="132"
            y2="98"
            stroke="#fb923c"
            strokeWidth="1.5"
            className="slot-hour-hand"
          />
        </g>
      </svg>
    </CoverShell>
  );
}

export function EyeOfMedusaCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at center, #0f0520 0%, #060d1f 80%)"
      maxWin="x15,000"
      maxWinClassName="text-[#c084fc]"
      ambientGlow="radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.2), transparent 50%)"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[1] h-full w-full opacity-[0.06]" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <path
            key={i}
            d={`M${20 + i * 30} 30 L${35 + i * 28} 170`}
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <path
          d="M28 100 Q55 68 100 72 Q145 68 172 100 Q145 132 100 128 Q55 132 28 100 Z"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
        />
        <circle cx="100" cy="100" r="28" fill="#f97316" fillOpacity="0.35" />
        <circle cx="100" cy="100" r="18" fill="#f97316" fillOpacity="0.55" />
        <circle cx="100" cy="100" r="8" fill="#060d1f" className="slot-pupil-dilate" />
        <path
          d="M18 95 Q8 100 18 108"
          fill="none"
          stroke="#22c55e"
          strokeOpacity="0.3"
          strokeWidth="2"
          className="slot-snake-undulate"
        />
        <path
          d="M182 95 Q192 100 182 108"
          fill="none"
          stroke="#22c55e"
          strokeOpacity="0.3"
          strokeWidth="2"
          className="slot-snake-undulate-alt"
        />
      </svg>
    </CoverShell>
  );
}

export function RipCityCover() {
  const buildings = [
    { x: 15, h: 55, windows: 2 },
    { x: 38, h: 75, windows: 3 },
    { x: 62, h: 45, windows: 2 },
    { x: 85, h: 90, windows: 4 },
    { x: 110, h: 60, windows: 2 },
    { x: 132, h: 80, windows: 3 },
    { x: 155, h: 50, windows: 2 },
    { x: 175, h: 70, windows: 3 },
  ];

  return (
    <CoverShell
      background="linear-gradient(180deg, #040408 0%, #060d1f 100%)"
      maxWin="x12,500"
      maxWinClassName="text-orange-500"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <polygon points="0,200 200,200 200,120 0,120" fill="#0f2040" fillOpacity="0.8" />
        {buildings.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={200 - b.h} width="18" height={b.h} fill="#0f2040" />
            {Array.from({ length: b.windows }).map((_, wi) => (
              <rect
                key={wi}
                x={b.x + 4}
                y={200 - b.h + 12 + wi * 18}
                width="4"
                height="6"
                fill="#fbbf24"
                fillOpacity={wi % 2 === 0 ? 0.5 : 0.2}
              />
            ))}
          </g>
        ))}
      </svg>

      {RAIN_DROPS.map((drop, i) => (
        <span
          key={i}
          className="slot-rain-drop absolute z-[3] w-px bg-white/15"
          style={{
            left: drop.left,
            top: drop.top,
            height: "15px",
            animationDuration: drop.duration,
            animationDelay: drop.delay,
          }}
        />
      ))}

      <div className="absolute left-1/2 top-[28%] z-[4] -translate-x-1/2">
        <div className="slot-neon-sign-glow rounded border-2 border-orange-500 px-3 py-1">
          <span className="font-display text-base leading-none text-orange-500">RIP</span>
        </div>
      </div>
    </CoverShell>
  );
}

export function LeBanditCover() {
  const coins = [
    { left: "12%", top: "25%", delay: "0s" },
    { left: "78%", top: "20%", delay: "0.5s" },
    { left: "20%", top: "70%", delay: "1s" },
    { left: "82%", top: "65%", delay: "1.5s" },
  ];

  return (
    <CoverShell
      background="radial-gradient(ellipse at bottom left, #0f0f05 0%, #060d1f 80%)"
      maxWin="x10,000"
      ambientGlow="radial-gradient(ellipse at 40% 60%, rgba(245,158,11,0.12), transparent 55%)"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <g className="slot-money-bounce" style={{ transformOrigin: "100px 75px" }}>
          <path
            d="M82 55 Q100 38 118 55 L115 88 Q100 98 85 88 Z"
            fill="#f59e0b"
            fillOpacity="0.35"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <path d="M92 62 L108 62 L100 52 Z" fill="#f59e0b" fillOpacity="0.5" />
          <text x="94" y="78" fill="#f59e0b" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
            $
          </text>
        </g>
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <circle cx="100" cy="128" r="32" fill="#0f2040" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="100" cy="128" r="22" fill="none" stroke="#1a3360" strokeWidth="1.5" />
        <circle
          cx="100"
          cy="128"
          r="6"
          fill="#1a3360"
          className="slot-safe-dial"
          style={{ transformOrigin: "100px 128px" }}
        />
        <line x1="100" y1="128" x2="100" y2="108" stroke="#f59e0b" strokeWidth="2" />
      </svg>

      {coins.map((c, i) => (
        <span
          key={i}
          className="slot-coin-flip absolute z-[3] h-5 w-5 rounded-full border-2 border-[#f59e0b]"
          style={{ left: c.left, top: c.top, animationDelay: c.delay }}
        />
      ))}
    </CoverShell>
  );
}

export function CashQuestCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at top, #021208 0%, #060d1f 80%)"
      maxWin="x7,500"
      maxWinClassName="text-[#14b8a6]"
      ambientGlow="radial-gradient(ellipse at 50% 85%, rgba(20,184,166,0.2), transparent 45%)"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <path
          d="M30 175 Q30 155 100 155 Q170 155 170 175"
          fill="none"
          stroke="#f59e0b"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeDasharray="4 6"
          className="slot-map-path"
        />
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <g className="slot-compass-needle" style={{ transformOrigin: "100px 88px" }}>
          <circle cx="100" cy="88" r="22" fill="none" stroke="#14b8a6" strokeWidth="2" />
          <text x="98" y="72" fill="#14b8a6" fontSize="8" textAnchor="middle">
            N
          </text>
          <polygon points="100,68 104,88 100,84 96,88" fill="#14b8a6" />
          <polygon points="100,108 96,88 100,92 104,88" fill="#14b8a6" fillOpacity="0.5" />
        </g>
        <rect x="68" y="148" width="64" height="32" rx="3" fill="#0f2040" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M68 158 Q100 138 132 158" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <rect x="92" y="162" width="16" height="10" rx="1" fill="#1a3360" />
      </svg>

      <svg viewBox="0 0 40 30" className="absolute right-4 top-4 z-[2] opacity-100" aria-hidden>
        <path d="M5 25 Q20 5 35 25 L30 28 Q20 12 10 28 Z" fill="#f97316" fillOpacity="0.2" />
      </svg>
    </CoverShell>
  );
}

export function BeatTheBobbiesCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at bottom, #080810 0%, #060d1f 80%)"
      maxWin="x10,000"
      maxWinClassName="text-[#94a3b8]"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[1] h-full w-full" aria-hidden>
        {BOBBIES_STONES.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width="22"
            height="14"
            rx="3"
            fill="#0f2040"
            fillOpacity="0.6"
          />
        ))}
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <line x1="55" y1="115" x2="25" y2="115" stroke="white" strokeOpacity="0.2" strokeWidth="2" />
        <line x1="58" y1="120" x2="20" y2="120" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
        <line x1="56" y1="125" x2="28" y2="125" stroke="white" strokeOpacity="0.18" strokeWidth="1" />
      </svg>

      <div className="slot-runner-group absolute bottom-[22%] left-[38%] z-[3]">
        <svg width="35" height="50" viewBox="0 0 35 50" aria-hidden>
          <circle cx="17" cy="8" r="7" fill="#f97316" />
          <line x1="17" y1="15" x2="17" y2="32" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <line x1="17" y1="22" x2="8" y2="28" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17" y1="22" x2="26" y2="28" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="17" y1="32" x2="10" y2="48" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" className="slot-leg-left" />
          <line x1="17" y1="32" x2="24" y2="48" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" className="slot-leg-right" />
        </svg>
      </div>

      <svg
        viewBox="0 0 40 48"
        className="slot-helmet-bob absolute right-5 top-5 z-[4] h-12 w-10"
        aria-hidden
      >
        <path
          d="M8 28 Q20 8 32 28 L32 34 Q20 42 8 34 Z"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <ellipse cx="20" cy="36" rx="14" ry="4" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="20" cy="22" r="3" fill="#94a3b8" fillOpacity="0.6" />
      </svg>
    </CoverShell>
  );
}
