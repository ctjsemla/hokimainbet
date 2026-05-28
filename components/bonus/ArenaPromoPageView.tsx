"use client";

import { m } from "framer-motion";
import {
  Bomb,
  CircleDot,
  Dices,
  Grid3x3,
  Lock,
  TrendingUp,
  Circle,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { BonusBadge } from "@/components/bonus/BonusBadge";
import { CoinStackVisual } from "@/components/bonus/CoinStackVisual";
import { PromoCta } from "@/components/bonus/PromoCta";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Link } from "@/i18n/navigation";
import { getNextMondayReset } from "@/lib/promo";
import { cn } from "@/lib/utils";
import type { BlogPostMeta } from "@/types/blog.types";

interface ArenaPromoPageViewProps {
  posts: BlogPostMeta[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: "u****31", score: "12.840", medal: "gold" as const },
  { rank: 2, name: "u****58", score: "11.220", medal: "silver" as const },
  { rank: 3, name: "u****94", score: "9.650", medal: "bronze" as const },
];

const DEMO_GAMES = [
  { href: "/games/crash", Icon: Zap, label: "Crash" },
  { href: "/games/dice", Icon: Dices, label: "Dice" },
  { href: "/games/mines", Icon: Bomb, label: "Mines" },
  { href: "/games/plinko", Icon: Circle, label: "Plinko" },
  { href: "/games/wheel", Icon: CircleDot, label: "Wheel" },
  { href: "/games/keno", Icon: Grid3x3, label: "Keno" },
] as const;

const HASH_SNIPPET = `client_seed: 7f3a9c2e1b8d4f6a
server_hash: sha256:e4b7c9...
nonce: 1842
verify: HMAC(server, client+nonce)
→ result: 4.87x ✓`;

function PromoBanner({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <m.section
      variants={item}
      whileHover={{ y: -3 }}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-navy-800 bg-navy-900 transition-[border-color,box-shadow] duration-300 hover:border-orange-500/30 hover:shadow-[0_12px_48px_rgba(249,115,22,0.1)]",
        className,
      )}
    >
      {children}
    </m.section>
  );
}

function UpdatedBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-navy-700 bg-navy-800 px-4 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-white">
        {label}
      </span>
    </div>
  );
}

export function ArenaPromoPageView({ posts }: ArenaPromoPageViewProps) {
  const t = useTranslations("bonus");
  const mondayReset = useMemo(() => getNextMondayReset(), []);

  return (
    <div className="pb-16">
      <m.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl space-y-8 px-4 pt-8 md:px-8 md:pt-12"
      >
        <m.header
          variants={item}
          className="flex flex-col gap-6 border-b border-navy-800 pb-10 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <h1 className="font-display text-[64px] leading-[0.9] tracking-wide text-white md:text-[80px]">
              {t("title")}
            </h1>
            <p className="mt-3 text-base font-medium text-orange-500 md:text-[16px]">
              {t("subtitle")}
            </p>
          </div>
          <UpdatedBadge label={t("updatedBadge")} />
        </m.header>

        {/* Banner 1 — Welcome */}
        <PromoBanner className="min-h-[260px]">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-orange-500/10 to-transparent"
            aria-hidden
          />
          <div className="relative grid h-full min-h-[260px] gap-6 p-6 md:grid-cols-[1fr_auto] md:p-10">
            <div className="flex flex-col justify-center">
              <BonusBadge>{t("badges.newPlayer")}</BonusBadge>
              <h2 className="mt-4 font-display text-[40px] leading-[0.95] tracking-wide text-white sm:text-[52px] md:text-[64px]">
                {t("welcome.title")}
              </h2>
              <p className="mt-3 max-w-lg text-[#94a3b8]">{t("welcome.subtext")}</p>
              <PromoCta href="/auth/register" className="mt-6 w-fit">
                {t("welcome.cta")}
              </PromoCta>
            </div>
            <CoinStackVisual />
          </div>
        </PromoBanner>

        {/* Banner 2 — Provably fair */}
        <PromoBanner className="min-h-[200px]">
          <div className="grid min-h-[200px] gap-6 p-6 md:grid-cols-[auto_1fr_1fr] md:items-center md:p-8">
            <m.div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-navy-700 bg-navy-950"
              animate={{
                rotate: [-4, 4, -4],
                boxShadow: [
                  "0 0 0 rgba(249,115,22,0)",
                  "0 0 24px rgba(249,115,22,0.35)",
                  "0 0 0 rgba(249,115,22,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Lock className="h-8 w-8 text-orange-500" strokeWidth={1.5} />
            </m.div>
            <div>
              <BonusBadge>{t("badges.transparency")}</BonusBadge>
              <h2 className="mt-3 font-display text-3xl tracking-wide text-white md:text-4xl">
                {t("provablyFair.title")}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#94a3b8]">
                {t("provablyFair.desc")}
              </p>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-navy-700 bg-navy-800 p-4 font-mono text-[11px] leading-relaxed text-orange-500 md:text-xs">
              {HASH_SNIPPET}
            </pre>
          </div>
        </PromoBanner>

        {/* Banner 3 — Leaderboard */}
        <PromoBanner className="min-h-[200px]">
          <div className="grid min-h-[200px] gap-8 p-6 md:grid-cols-2 md:items-center md:p-8">
            <div>
              <BonusBadge>{t("badges.weekly")}</BonusBadge>
              <ul className="mt-4 space-y-2">
                {LEADERBOARD_PREVIEW.map((row) => (
                  <li
                    key={row.rank}
                    className="flex items-center gap-3 rounded-lg border border-navy-800 bg-navy-950 px-3 py-2"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm",
                        row.medal === "gold" && "bg-orange-500/20 text-orange-400",
                        row.medal === "silver" && "bg-navy-700 text-[#94a3b8]",
                        row.medal === "bronze" && "bg-navy-700 text-orange-500/70",
                      )}
                    >
                      {row.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                      {row.name}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-orange-400">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {row.score}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start md:items-end md:text-right">
              <h2 className="font-display text-[40px] leading-none tracking-wide text-white md:text-[52px]">
                {t("leaderboard.title")}
              </h2>
              <p className="mt-2 text-[#94a3b8]">{t("leaderboard.subtext")}</p>
              <div className="mt-4 w-full md:max-w-xs">
                <CountdownTimer
                  targetDate={mondayReset}
                  label={t("leaderboard.timerLabel")}
                  size="md"
                  className="md:items-end"
                />
              </div>
              <PromoCta href="/leaderboard" className="mt-5 w-fit md:ml-auto">
                {t("leaderboard.cta")}
              </PromoCta>
            </div>
          </div>
        </PromoBanner>

        {/* Banner 4 — Games strip */}
        <PromoBanner className="min-h-[160px]">
          <div className="flex min-h-[160px] flex-col justify-center gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <BonusBadge>{t("badges.free")}</BonusBadge>
                <h2 className="mt-2 font-display text-3xl tracking-wide text-white md:text-4xl">
                  {t("games.title")}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex gap-2 sm:gap-3">
                {DEMO_GAMES.map(({ href, Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    className="group/icon flex h-11 w-11 items-center justify-center rounded-full border border-navy-700 bg-navy-700 transition-all hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.35)] sm:h-12 sm:w-12"
                  >
                    <Icon
                      className="h-5 w-5 text-[#94a3b8] transition-colors group-hover/icon:text-orange-500"
                      strokeWidth={1.5}
                    />
                  </Link>
                ))}
              </div>
              <PromoCta href="/games/crash" className="shrink-0">
                {t("games.cta")}
              </PromoCta>
            </div>
          </div>
        </PromoBanner>

        {/* Banner 5 — Blog */}
        <PromoBanner
          className="min-h-[200px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(249,115,22,0.08) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="relative grid min-h-[200px] gap-6 bg-navy-900/90 p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
            <div>
              <BonusBadge>{t("badges.tips")}</BonusBadge>
              <h2 className="mt-3 font-display text-3xl tracking-wide text-white md:text-4xl">
                {t("blog.title")}
              </h2>
              <PromoCta href="/blog" className="mt-6 w-fit">
                {t("blog.cta")}
              </PromoCta>
            </div>
            <ul className="space-y-3">
              {posts.length === 0 ? (
                <li className="text-sm text-[#94a3b8]">{t("blog.empty")}</li>
              ) : (
                posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block rounded-lg border border-navy-800 bg-navy-950 px-4 py-3 transition-colors hover:border-orange-500/30"
                    >
                      <p className="line-clamp-2 text-sm font-medium text-white">
                        {post.title}
                      </p>
                      <span className="mt-1 inline-block rounded bg-navy-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                        {post.readTime}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </PromoBanner>
      </m.div>
    </div>
  );
}
