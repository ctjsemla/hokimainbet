import { CoverShell } from "@/components/slots/covers/CoverShell";

const VB = "0 0 200 200";

const OLYMPUS_ORBS = [
  { left: "8%", top: "18%", delay: "0s" },
  { left: "22%", top: "72%", delay: "0.6s" },
  { left: "38%", top: "12%", delay: "1.1s" },
  { left: "55%", top: "65%", delay: "0.3s" },
  { left: "72%", top: "22%", delay: "1.8s" },
  { left: "88%", top: "58%", delay: "0.9s" },
  { left: "48%", top: "38%", delay: "2.2s" },
  { left: "65%", top: "82%", delay: "1.4s" },
];

const BONANZA_SHAPES = [
  { x: 24, y: 42, r: 10, c: "#e879f9", type: "circle", delay: "0s" },
  { x: 168, y: 38, r: 8, c: "#ef4444", type: "diamond", delay: "0.7s" },
  { x: 52, y: 128, r: 12, c: "#22c55e", type: "circle", delay: "1.2s" },
  { x: 140, y: 118, r: 9, c: "#fbbf24", type: "star", delay: "0.4s" },
  { x: 88, y: 68, r: 14, c: "#e879f9", type: "diamond", delay: "1.8s" },
  { x: 175, y: 95, r: 7, c: "#22c55e", type: "circle", delay: "2.5s" },
  { x: 36, y: 88, r: 11, c: "#ef4444", type: "star", delay: "1s" },
  { x: 112, y: 145, r: 8, c: "#fbbf24", type: "circle", delay: "3.2s" },
  { x: 155, y: 58, r: 6, c: "#e879f9", type: "diamond", delay: "0.2s" },
  { x: 68, y: 38, r: 9, c: "#ef4444", type: "circle", delay: "2.8s" },
  { x: 128, y: 32, r: 10, c: "#22c55e", type: "star", delay: "1.6s" },
  { x: 98, y: 158, r: 7, c: "#fbbf24", type: "diamond", delay: "3.8s" },
];

const STARFIELD = [
  { cx: 18, cy: 22, r: 1.5, twinkle: true, d: "0s" },
  { cx: 42, cy: 48, r: 2, twinkle: false },
  { cx: 65, cy: 18, r: 1, twinkle: true, d: "0.8s" },
  { cx: 88, cy: 35, r: 1.5, twinkle: false },
  { cx: 112, cy: 12, r: 2, twinkle: true, d: "1.4s" },
  { cx: 135, cy: 55, r: 1, twinkle: false },
  { cx: 158, cy: 28, r: 1.5, twinkle: true, d: "2.1s" },
  { cx: 178, cy: 62, r: 1, twinkle: false },
  { cx: 25, cy: 95, r: 2, twinkle: true, d: "0.5s" },
  { cx: 55, cy: 112, r: 1, twinkle: false },
  { cx: 78, cy: 88, r: 1.5, twinkle: true, d: "1.9s" },
  { cx: 102, cy: 125, r: 1, twinkle: false },
  { cx: 125, cy: 98, r: 2, twinkle: true, d: "2.6s" },
  { cx: 148, cy: 142, r: 1.5, twinkle: false },
  { cx: 172, cy: 108, r: 1, twinkle: true, d: "3.3s" },
  { cx: 38, cy: 165, r: 1.5, twinkle: false },
  { cx: 92, cy: 175, r: 1, twinkle: true, d: "1.1s" },
  { cx: 165, cy: 178, r: 2, twinkle: false },
  { cx: 12, cy: 140, r: 1, twinkle: true, d: "2.4s" },
  { cx: 185, cy: 15, r: 1.5, twinkle: false },
  { cx: 62, cy: 72, r: 1, twinkle: true, d: "3.7s" },
  { cx: 142, cy: 72, r: 1.5, twinkle: false },
];

const BASS_BUBBLES = [
  { left: "15%", size: 6, delay: "0s" },
  { left: "35%", size: 10, delay: "1.2s" },
  { left: "55%", size: 5, delay: "0.6s" },
  { left: "72%", size: 12, delay: "2s" },
  { left: "88%", size: 7, delay: "0.3s" },
  { left: "45%", size: 8, delay: "1.8s" },
];

const DOG_PAWS = [
  { x: 32, y: 55, delay: "0s" },
  { x: 155, y: 72, delay: "0.8s" },
  { x: 48, y: 145, delay: "1.6s" },
  { x: 162, y: 138, delay: "2.4s" },
  { x: 95, y: 42, delay: "3.2s" },
];

function SparkleStar({ cx, cy, delay }: { cx: number; cy: number; delay: string }) {
  return (
    <polygon
      points={`${cx},${cy - 4} ${cx + 1.5},${cy - 1} ${cx + 4},${cy} ${cx + 1.5},${cy + 1} ${cx},${cy + 4} ${cx - 1.5},${cy + 1} ${cx - 4},${cy} ${cx - 1.5},${cy - 1}`}
      fill="#fbbf24"
      className="slot-sparkle-twinkle"
      style={{ animationDelay: delay }}
    />
  );
}

function PawPrint({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <g transform={`translate(${x},${y})`} className="slot-paw-appear" style={{ animationDelay: delay }}>
      <circle cx="0" cy="0" r="3.5" fill="#475569" fillOpacity="0.5" />
      <circle cx="-5" cy="-5" r="2.5" fill="#475569" fillOpacity="0.45" />
      <circle cx="5" cy="-5" r="2.5" fill="#475569" fillOpacity="0.45" />
      <circle cx="0" cy="-8" r="2.5" fill="#475569" fillOpacity="0.45" />
    </g>
  );
}

function BonanzaShape({
  x,
  y,
  r,
  c,
  type,
  delay,
}: (typeof BONANZA_SHAPES)[number]) {
  return (
    <g className="slot-fruit-drift" style={{ animationDelay: delay }}>
      {type === "circle" && <circle cx={x} cy={y} r={r} fill={c} opacity={0.85} />}
      {type === "diamond" && (
        <polygon
          points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
          fill={c}
          opacity={0.85}
        />
      )}
      {type === "star" && (
        <polygon
          points={`${x},${y - r} ${x + r * 0.3},${y - r * 0.3} ${x + r},${y} ${x + r * 0.3},${y + r * 0.3} ${x},${y + r} ${x - r * 0.3},${y + r * 0.3} ${x - r},${y} ${x - r * 0.3},${y - r * 0.3}`}
          fill={c}
          opacity={0.9}
        />
      )}
    </g>
  );
}

export function GatesOfOlympusCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at top, #1a0a3a 0%, #060d1f 70%)"
      maxWin="x15,000"
      ambientGlow="radial-gradient(ellipse at 50% 35%, rgba(245,158,11,0.12), transparent 60%)"
    >
      <svg viewBox={VB} className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x="28" y="95" width="14" height="85" fill="#0f2040" fillOpacity="0.6" />
        <rect x="28" y="88" width="14" height="8" fill="#1a3360" fillOpacity="0.7" />
        <rect x="93" y="75" width="16" height="105" fill="#0f2040" fillOpacity="0.6" />
        <rect x="93" y="68" width="16" height="9" fill="#1a3360" fillOpacity="0.7" />
        <rect x="158" y="100" width="12" height="80" fill="#0f2040" fillOpacity="0.55" />
        <rect x="158" y="94" width="12" height="7" fill="#1a3360" fillOpacity="0.65" />
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <path
          d="M100 38 L112 72 H94 L118 108 L88 88 H108 L82 148 L96 108 H78 L100 38Z"
          fill="#f59e0b"
          className="slot-bolt-pulse"
          style={{ filter: "drop-shadow(0 0 12px #f59e0b)" }}
        />
      </svg>

      {OLYMPUS_ORBS.map((orb, i) => (
        <span
          key={i}
          className="slot-gold-orb absolute z-[3] h-3 w-3 rounded-full"
          style={{ left: orb.left, top: orb.top, animationDelay: orb.delay }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 z-[3] h-px bg-[#f59e0b]/30" aria-hidden />
    </CoverShell>
  );
}

export function SweetBonanzaCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at bottom, #2d0a2d 0%, #060d1f 70%)"
      maxWin="x21,100"
      maxWinClassName="text-[#e879f9]"
      ambientGlow="radial-gradient(ellipse at 50% 80%, rgba(232,121,249,0.15), transparent 55%)"
    >
      <svg viewBox={VB} className="absolute inset-0 h-full w-full" aria-hidden>
        {BONANZA_SHAPES.map((s, i) => (
          <BonanzaShape key={i} {...s} />
        ))}
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <g className="slot-diamond-spin" style={{ transformOrigin: "100px 100px" }}>
          <polygon
            points="100,72 118,100 100,128 82,100"
            fill="none"
            stroke="#e879f9"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 0 8px rgba(232,121,249,0.6))" }}
          />
        </g>
        <SparkleStar cx={45} cy={55} delay="0.2s" />
        <SparkleStar cx={158} cy={48} delay="1.1s" />
        <SparkleStar cx={72} cy={155} delay="2.3s" />
        <SparkleStar cx={145} cy={130} delay="0.7s" />
        <SparkleStar cx={30} cy={120} delay="1.9s" />
        <SparkleStar cx={120} cy={28} delay="3.1s" />
      </svg>
    </CoverShell>
  );
}

export function StarlightPrincessCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at center, #050f2a 0%, #060d1f 100%)"
      maxWin="x5,000"
      maxWinClassName="text-[#22d3ee]"
      ambientGlow="radial-gradient(ellipse at 50% 45%, rgba(34,211,238,0.1), transparent 65%)"
    >
      <svg viewBox={VB} className="absolute inset-0 h-full w-full" aria-hidden>
        {STARFIELD.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#22d3ee"
            opacity={s.twinkle ? 0.9 : 0.35}
            className={s.twinkle ? "slot-starfield-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: s.d } : undefined}
          />
        ))}
      </svg>

      <div className="slot-aurora-band absolute bottom-[30%] left-0 z-[2] h-5 w-[200%]" aria-hidden />

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <g className="slot-princess-star-sway" style={{ transformOrigin: "100px 100px" }}>
          <polygon
            points="100,48 106,72 132,72 110,88 118,118 100,102 82,118 90,88 68,72 94,72"
            fill="#22d3ee"
            style={{ filter: "drop-shadow(0 0 16px #22d3ee)" }}
          />
          <polygon
            points="100,58 104,74 120,74 106,86 112,106 100,96 88,106 94,86 80,74 96,74"
            fill="white"
            opacity={0.85}
          />
        </g>
      </svg>
    </CoverShell>
  );
}

export function BigBassBonanzaCover() {
  return (
    <CoverShell
      background="linear-gradient(180deg, #020d1a 0%, #041428 50%, #060d1f 100%)"
      maxWin="x2,100"
      maxWinClassName="text-[#93c5fd]"
    >
      <div className="slot-caustic-layer pointer-events-none absolute inset-0 z-[1]" aria-hidden />
      <div className="slot-caustic-layer slot-caustic-layer-alt pointer-events-none absolute inset-0 z-[1]" aria-hidden />

      <div className="slot-fish-premium absolute left-1/2 top-[42%] z-[3] -translate-x-1/2 -translate-y-1/2">
        <svg width="60" height="28" viewBox="0 0 60 28" aria-hidden>
          <ellipse cx="26" cy="14" rx="24" ry="11" fill="#fb923c" />
          <polygon points="58,14 46,6 46,22" fill="#fb923c" />
          <circle cx="14" cy="12" r="2" fill="#060d1f" fillOpacity="0.4" />
        </svg>
      </div>

      {BASS_BUBBLES.map((b, i) => (
        <span
          key={i}
          className="slot-bubble-rise absolute z-[3] rounded-full border border-white/30 bg-white/20"
          style={{
            left: b.left,
            bottom: "8%",
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
          }}
        />
      ))}
    </CoverShell>
  );
}

export function TheDogHouseCover() {
  return (
    <CoverShell
      background="radial-gradient(ellipse at bottom right, #1a0f05 0%, #060d1f 70%)"
      maxWin="x6,750"
      maxWinClassName="text-orange-400"
      ambientGlow="radial-gradient(ellipse at 50% 55%, rgba(249,115,22,0.1), transparent 55%)"
    >
      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <path
          d="M55 125 L100 72 L145 125 Z"
          fill="none"
          stroke="#f97316"
          strokeOpacity="0.35"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <rect
          x="72"
          y="125"
          width="56"
          height="42"
          fill="none"
          stroke="#f97316"
          strokeOpacity="0.35"
          strokeWidth="2.5"
        />
        <circle cx="100" cy="148" r="10" fill="none" stroke="#f97316" strokeOpacity="0.25" strokeWidth="2" />
        {DOG_PAWS.map((p, i) => (
          <PawPrint key={i} {...p} />
        ))}
      </svg>

      <svg
        viewBox="0 0 80 24"
        className="slot-bone-float absolute bottom-4 left-1/2 z-[3] w-16 -translate-x-1/2 opacity-100"
        aria-hidden
      >
        <rect x="28" y="9" width="24" height="6" rx="3" fill="white" fillOpacity="0.1" />
        <circle cx="22" cy="12" r="9" fill="white" fillOpacity="0.1" />
        <circle cx="58" cy="12" r="9" fill="white" fillOpacity="0.1" />
      </svg>
    </CoverShell>
  );
}

export function GatesOfGatotKacaCover() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    left: `${12 + (i % 4) * 22}%`,
    delay: `${i * 0.35}s`,
    color: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#ffffff" : "#f59e0b",
  }));

  return (
    <CoverShell
      background="radial-gradient(ellipse at top, #1f1000 0%, #0f0800 50%, #060d1f 100%)"
      maxWin="x5,000"
      featured
      localBadge="🇮🇩 UNGGULAN"
      ambientGlow="radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.22), transparent 58%)"
    >
      <svg viewBox={VB} className="absolute inset-0 h-full w-full opacity-[0.15]" aria-hidden>
        <defs>
          <pattern id="batik-diamonds" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
            <path d="M12 8 L16 12 L12 16 L8 12 Z" fill="#f59e0b" fillOpacity="0.4" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#batik-diamonds)" />
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[2] h-full w-full" aria-hidden>
        <path
          d="M42 95 Q42 55 100 48 Q158 55 158 95"
          fill="none"
          stroke="#f59e0b"
          strokeOpacity="0.6"
          strokeWidth="2"
          className="slot-kris-float"
        />
        <path
          d="M158 95 Q158 55 100 48"
          fill="none"
          stroke="#f59e0b"
          strokeOpacity="0.6"
          strokeWidth="2"
          className="slot-kris-float-alt"
        />
      </svg>

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <g className="slot-gatot-breathe" style={{ transformOrigin: "100px 95px" }}>
          <path
            d="M100 52 L88 68 L72 72 L82 88 L78 108 L100 98 L122 108 L118 88 L128 72 L112 68 Z"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 0 20px #f59e0b)" }}
          />
          <path d="M88 72 L100 62 L112 72" fill="none" stroke="#f59e0b" strokeWidth="2" />
          <line x1="94" y1="82" x2="106" y2="82" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M75 58 L100 48 L125 58 L118 52 L100 44 L82 52 Z" fill="#f59e0b" fillOpacity="0.5" />
        </g>
      </svg>

      {particles.map((p, i) => (
        <span
          key={i}
          className="slot-gold-rise absolute z-[3] h-1 w-1 rounded-full"
          style={{ left: p.left, bottom: "15%", backgroundColor: p.color, animationDelay: p.delay }}
        />
      ))}
    </CoverShell>
  );
}

export function SugarRushCover() {
  const hearts = [
    { x: 45, delay: "0s" },
    { x: 95, delay: "1.2s" },
    { x: 145, delay: "2.4s" },
    { x: 70, delay: "3.6s" },
  ];

  return (
    <CoverShell
      background="radial-gradient(ellipse at top left, #2d0520 0%, #060d1f 70%)"
      maxWin="x5,000"
      maxWinClassName="text-[#e879f9]"
      ambientGlow="radial-gradient(ellipse at 30% 20%, rgba(232,121,249,0.12), transparent 50%)"
    >
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-100"
        style={{
          background:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 20px)",
        }}
        aria-hidden
      />

      <svg viewBox={VB} className="absolute inset-0 z-[3] h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="sugarLollipopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
        </defs>
        <g className="slot-lollipop-rock" style={{ transformOrigin: "100px 95px" }}>
          <circle cx="100" cy="82" r="28" fill="url(#sugarLollipopGrad)" />
          <path
            d="M88 82 A12 12 0 0 1 112 82 A12 12 0 0 1 88 82"
            fill="none"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          <line x1="100" y1="110" x2="100" y2="155" stroke="#e879f9" strokeWidth="4" strokeLinecap="round" />
        </g>
        {hearts.map((h, i) => (
          <path
            key={i}
            d={`M${h.x} 165 C${h.x - 8} 155 ${h.x - 12} 145 ${h.x} 138 C${h.x + 12} 145 ${h.x + 8} 155 ${h.x} 165`}
            fill="#e879f9"
            fillOpacity="0.7"
            className="slot-heart-rise"
            style={{ animationDelay: h.delay }}
          />
        ))}
      </svg>
    </CoverShell>
  );
}
