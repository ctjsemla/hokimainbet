"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Link } from "@/i18n/navigation";
import {
  claimDailyStreak,
  claimTimedReward,
  DAILY_STREAK_REWARDS,
  getDailyStreakState,
  getRewardWindowStates,
  spinRewardWheel,
  type DailyStreakState,
  type RewardWindowState,
  WHEEL_PRIZES,
} from "@/lib/rewards";

interface WinnerRow {
  id: string;
  chest: string;
  prize: string;
  openedAt: string;
  username: string;
}

interface StreakRow {
  id: string;
  username: string;
  streak: number;
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function maskWinnerName(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return "e***9";
  if (cleaned.length === 1) return `${cleaned.toLowerCase()}***9`;
  return `${cleaned[0].toLowerCase()}***${cleaned[cleaned.length - 1].toLowerCase()}`;
}

function wheelSegmentLabel(
  prize: (typeof WHEEL_PRIZES)[number],
  index: number,
): string {
  if (index === 2) return "UP x2";
  if (index === 6) return "UP x3";
  if (prize.type === "coins") return `${prize.amount}`;
  return prize.label.toUpperCase();
}

function pickGuestWheelPrize(): (typeof WHEEL_PRIZES)[number] {
  const source = WHEEL_PRIZES.filter((prize) => prize.type === "coins");
  return source[Math.floor(Math.random() * source.length)];
}

function createFakeWinners(t: ReturnType<typeof useTranslations<"bonus.rewards">>): WinnerRow[] {
  const names = ["emiliano9", "frankthetank", "valismon729", "raepenor", "ylermi"];
  const prizes = [
    "2,500 Coins",
    "1,000 Coins",
    "500 Coins",
    "300 Coins",
    t("fakePrizeVip"),
  ];
  return names.map((name, idx) => ({
    id: `seed-${idx}`,
    chest: t("wheelTypeWeekly"),
    prize: prizes[idx % prizes.length],
    openedAt: new Date(Date.now() - idx * 2_700_000).toLocaleString(),
    username: maskWinnerName(name),
  }));
}

function createTopStreaks(): StreakRow[] {
  const base = ["clippi85", "frankthetank", "valismon729", "raepenor", "ylermi"];
  return base.map((name, idx) => ({
    id: `streak-${idx}`,
    username: maskWinnerName(name),
    streak: 520 + idx * 3,
  }));
}

export function RewardCenterSection() {
  const t = useTranslations("bonus.rewards");
  const { user, setDemoBalance, refreshBalance } = useAuth();
  const [states, setStates] = useState<RewardWindowState[]>([]);
  const [streak, setStreak] = useState<DailyStreakState | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [wheelMessage, setWheelMessage] = useState<string | null>(null);
  const [winners, setWinners] = useState<WinnerRow[]>(() => createFakeWinners(t));
  const [topStreaks] = useState<StreakRow[]>(createTopStreaks);

  const wheelCards = [
    {
      id: "ten_min",
      title: t("wheelTypeMinute"),
      chest: t("bronzeChest"),
      range: "25 - 300",
    },
    {
      id: "hourly",
      title: t("wheelTypeHourly"),
      chest: t("silverChest"),
      range: "50 - 2,500",
    },
    {
      id: "daily",
      title: t("wheelTypeDaily"),
      chest: t("goldChest"),
      range: "120 - 18,000",
    },
    {
      id: "weekly",
      title: t("wheelTypeWeekly"),
      chest: t("goldChest"),
      range: "480 - 77,000",
    },
  ];
  const segmentAngle = 360 / WHEEL_PRIZES.length;

  useEffect(() => {
    if (!user) {
      setStates([]);
      setStreak(null);
      return;
    }
    setLoading(true);
    void Promise.all([getRewardWindowStates(user.id), getDailyStreakState(user.id)])
      .then(([rewardStates, streakState]) => {
        setStates(rewardStates);
        setStreak(streakState);
      })
      .catch(() => setError(t("loadError")))
      .finally(() => setLoading(false));
  }, [t, user]);

  useEffect(() => {
    const id = setInterval(() => {
      setStates((prev) =>
        prev.map((row) => {
          const remaining = Math.max(0, row.remainingMs - 1000);
          return { ...row, remainingMs: remaining, canClaim: remaining === 0 };
        }),
      );
      setStreak((prev) => {
        if (!prev) return prev;
        const remaining = Math.max(0, prev.remainingMs - 1000);
        return { ...prev, remainingMs: remaining, canClaim: remaining === 0 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setWinners((prev) => {
        const random = Math.floor(Math.random() * WHEEL_PRIZES.length);
        const prize = WHEEL_PRIZES[random];
        const seed = Math.random().toString(36).slice(2, 9);
        const row: WinnerRow = {
          id: `auto-${Date.now()}`,
          chest: t("wheelTypeDaily"),
          prize: prize.type === "coins" ? `${prize.amount.toLocaleString()} Coins` : prize.label,
          openedAt: new Date().toLocaleString(),
          username: maskWinnerName(seed),
        };
        return [row, ...prev].slice(0, 8);
      });
    }, 15000);
    return () => clearInterval(id);
  }, [t]);

  const wheelStyle = useMemo(() => {
    const segment = 360 / WHEEL_PRIZES.length;
    return {
      transform: `rotate(${resultIndex === null ? 0 : 1800 + resultIndex * segment}deg)`,
      transition: spinning ? "transform 3s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
    };
  }, [resultIndex, spinning]);

  async function handleClaim(window: string) {
    if (!user) {
      setError(t("loginRequired"));
      return;
    }
    setClaiming(window);
    setError(null);
    try {
      const reward = await claimTimedReward(user.id, window as never);
      setDemoBalance(reward.balance);
      await refreshBalance();
      const [nextStates, nextStreak] = await Promise.all([
        getRewardWindowStates(user.id),
        getDailyStreakState(user.id),
      ]);
      setStates(nextStates);
      setStreak(nextStreak);
      setWinners((prev) => {
        const row: WinnerRow = {
          id: `claim-${Date.now()}`,
          chest: t("wheelTypeDaily"),
          prize: `${reward.amount.toLocaleString()} Coins`,
          openedAt: new Date().toLocaleString(),
          username: maskWinnerName(
            (user.user_metadata?.username as string | undefined) ??
              user.email ??
              "e9",
          ),
        };
        return [row, ...prev].slice(0, 8);
      });
    } catch {
      setError(t("claimError"));
    } finally {
      setClaiming(null);
    }
  }

  async function handleClaimStreak() {
    if (!user || !streak?.canClaim) return;
    setClaiming("streak");
    setError(null);
    try {
      const result = await claimDailyStreak(user.id);
      setDemoBalance(result.balance);
      await refreshBalance();
      const [nextStates, nextStreak] = await Promise.all([
        getRewardWindowStates(user.id),
        getDailyStreakState(user.id),
      ]);
      setStates(nextStates);
      setStreak(nextStreak);
      setWinners((prev) => {
        const row: WinnerRow = {
          id: `streak-${Date.now()}`,
          chest: t("wheelTypeDaily"),
          prize: `${result.amount.toLocaleString()} Coins`,
          openedAt: new Date().toLocaleString(),
          username: maskWinnerName(
            (user.user_metadata?.username as string | undefined) ??
              user.email ??
              "e9",
          ),
        };
        return [row, ...prev].slice(0, 8);
      });
    } catch {
      setError(t("claimError"));
    } finally {
      setClaiming(null);
    }
  }

  async function handleSpin() {
    if (spinning) return;
    setSpinning(true);
    setError(null);
    setWheelMessage(null);
    try {
      const guestPrize = !user ? pickGuestWheelPrize() : null;
      const outcome = user
        ? await spinRewardWheel(user.id)
        : {
            prize: guestPrize!,
            balance: null,
          };
      const idx = WHEEL_PRIZES.findIndex((row) => row.id === outcome.prize.id);
      setResultIndex(idx >= 0 ? idx : 0);
      setWheelMessage(
        outcome.prize.type === "coins"
          ? t("wheelWinCoins", { amount: outcome.prize.amount })
          : t("wheelWinItem", { item: outcome.prize.label }),
      );
      if (user && typeof outcome.balance === "number") {
        setDemoBalance(outcome.balance);
        await refreshBalance();
      }
      setWinners((prev) => {
        const row: WinnerRow = {
          id: `spin-${Date.now()}`,
          chest: t("wheelTypeWeekly"),
          prize:
            outcome.prize.type === "coins"
              ? `${outcome.prize.amount.toLocaleString()} Coins`
              : outcome.prize.label,
          openedAt: new Date().toLocaleString(),
          username: user
            ? maskWinnerName(
                (user.user_metadata?.username as string | undefined) ??
                  user.email ??
                  "e9",
              )
            : maskWinnerName("guest99"),
        };
        return [row, ...prev].slice(0, 8);
      });
    } catch {
      setError(t("wheelError"));
    } finally {
      setTimeout(() => setSpinning(false), 3000);
    }
  }

  return (
    <section className="rounded-2xl border border-navy-800 bg-navy-900 p-6 md:p-8">
      {!user ? (
        <div className="rounded-xl border border-navy-700 bg-navy-950 p-8 text-center">
          <p className="text-sm uppercase tracking-wider text-orange-400">{t("eyebrow")}</p>
          <h2 className="mt-2 font-display text-5xl text-white">{t("title")}</h2>
          <p className="mt-3 text-[#94a3b8]">{t("loginRequired")}</p>
          <Link
            href="/auth/login"
            className="mt-5 inline-flex rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white"
          >
            {t("goLogin")}
          </Link>
        </div>
      ) : (
        <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-400">{t("eyebrow")}</p>
          <h2 className="mt-2 font-display text-4xl tracking-wide text-white md:text-5xl">
            {t("title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setWheelOpen(true)}
          className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition hover:brightness-110"
        >
          {t("openWheel")}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
          {error}
          {!user && (
            <Link
              href="/auth/login"
              className="ml-2 underline underline-offset-2"
            >
              {t("goLogin")}
            </Link>
          )}
        </div>
      )}

      <div className="rounded-xl border border-navy-800 bg-navy-950 p-4 md:p-5">
        <p className="text-center font-display text-4xl text-white">{t("dailyStreak")}</p>
        <p className="mt-2 text-center text-2xl text-orange-400">🔥 {streak?.totalClaims ?? 0}</p>
        <div className="mt-5 grid gap-2 lg:grid-cols-9">
          {DAILY_STREAK_REWARDS.map((amount, idx) => {
            const day = idx + 1;
            const isNext = streak?.nextDay === day;
            const canClaimStreak = Boolean(streak?.canClaim) && isNext;
            return (
            <div
              key={`${amount}-${idx}`}
              className="rounded-lg border border-navy-700 bg-navy-900 px-2 py-2 text-center"
            >
              <p className="text-[10px] uppercase tracking-wider text-[#94a3b8]">
                {idx === 0 ? t("today") : t("dayLabel", { day: idx + 1 })}
              </p>
              <p className="mt-1 text-sm font-bold text-orange-400">{amount}</p>
              <button
                type="button"
                onClick={() => void handleClaimStreak()}
                disabled={!canClaimStreak || claiming === "streak"}
                className="mt-2 w-full rounded bg-orange-500/90 py-1 text-xs font-medium text-white disabled:bg-navy-700 disabled:text-[#64748b]"
              >
                {isNext
                  ? claiming === "streak"
                    ? t("claiming")
                    : streak?.canClaim
                      ? t("claim")
                      : formatRemaining(streak?.remainingMs ?? 0)
                  : "—"}
              </button>
            </div>
          );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {states.map((row) => (
          <div key={row.window} className="rounded-xl border border-navy-700 bg-navy-950 p-4">
            <p className="text-xs uppercase tracking-wider text-[#94a3b8]">{row.label}</p>
            <p className="mt-1 font-display text-3xl text-white">+{row.amount}</p>
            <p className="mt-1 text-xs text-[#94a3b8]">
              {row.canClaim ? t("ready") : formatRemaining(row.remainingMs)}
            </p>
            <button
              type="button"
              disabled={!row.canClaim || claiming === row.window || loading}
              onClick={() => void handleClaim(row.window)}
              className="mt-3 w-full rounded-md bg-orange-500 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {claiming === row.window ? t("claiming") : t("claim")}
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {wheelCards.map((card) => (
          <div key={card.id} className="rounded-xl border border-navy-700 bg-navy-950 p-4">
            <div className="mb-3 rounded-md bg-[linear-gradient(180deg,#7c3aed_0%,#0f2040_100%)] p-2 text-center">
              <p className="text-sm font-semibold text-white">{card.title}</p>
            </div>
            <p className="text-xs text-[#94a3b8]">{card.chest}</p>
            <p className="mt-1 text-sm text-orange-300">{t("coinsRange", { range: card.range })}</p>
            <button
              type="button"
              onClick={() => setWheelOpen(true)}
              className="mt-3 w-full rounded-md bg-orange-500 py-2 text-sm font-medium text-white"
            >
              {t("play")}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-navy-800 bg-navy-950 overflow-hidden">
        <div className="grid grid-cols-4 border-b border-navy-800 px-4 py-3 text-xs uppercase tracking-wider text-[#94a3b8]">
          <span>{t("tableChest")}</span>
          <span>{t("tablePrize")}</span>
          <span>{t("tableOpenedAt")}</span>
          <span>{t("tableUser")}</span>
        </div>
        {winners.map((row) => (
          <div key={row.id} className="grid grid-cols-4 px-4 py-3 text-sm border-b border-navy-900/80">
            <span className="text-orange-300">{row.chest}</span>
            <span className="text-white">{row.prize}</span>
            <span className="text-[#94a3b8]">{row.openedAt}</span>
            <span className="text-white">{row.username}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-navy-800 bg-navy-950 p-4">
          <p className="text-xs uppercase text-[#94a3b8]">{t("monthlyClaims")}</p>
          <p className="mt-1 font-display text-3xl text-white">{winners.length}</p>
        </div>
        <div className="rounded-xl border border-navy-800 bg-navy-950 p-4 lg:col-span-2">
          <p className="text-xs uppercase text-[#94a3b8]">{t("topStreaks")}</p>
          <div className="mt-3 space-y-2">
            {topStreaks.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-md bg-navy-900 px-3 py-2"
              >
                <span className="text-white">{row.username}</span>
                <span className="text-orange-400">🔥 {row.streak}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {wheelOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-navy-700 bg-navy-900 p-5 md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-5xl text-white">{t("wheelTitle")}</h3>
              <button type="button" onClick={() => setWheelOpen(false)} className="text-sm text-[#94a3b8]">
                {t("close")}
              </button>
            </div>
            <div className="relative mx-auto h-[420px] w-[420px]">
              <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-orange-500" />
              <m.div
                className="h-full w-full rounded-full border-4 border-orange-500"
                style={{
                  ...wheelStyle,
                  background:
                    "conic-gradient(#f97316 0deg 36deg, #112753 36deg 72deg, #fb923c 72deg 108deg, #07142e 108deg 144deg, #f97316 144deg 180deg, #112753 180deg 216deg, #fb923c 216deg 252deg, #07142e 252deg 288deg, #f97316 288deg 324deg, #112753 324deg 360deg)",
                }}
              >
                {WHEEL_PRIZES.map((prize, idx) => (
                  <div
                    key={prize.id}
                    className="absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `rotate(${idx * segmentAngle + segmentAngle / 2}deg) translateY(-160px)`,
                    }}
                  >
                    <span className="block -rotate-90 text-center text-xs font-bold text-white">
                      {wheelSegmentLabel(prize, idx)}
                    </span>
                  </div>
                ))}
              </m.div>
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-500 bg-navy-950" />
            </div>
            <button
              type="button"
              disabled={spinning}
              onClick={() => void handleSpin()}
              className="mt-5 w-full rounded-lg bg-orange-500 py-3 font-display text-2xl text-white disabled:opacity-50"
            >
              {spinning ? t("spinning") : t("spin")}
            </button>
            {wheelMessage && <p className="mt-3 text-center text-sm text-orange-300">{wheelMessage}</p>}
          </div>
        </div>
      )}
        </>
      )}
    </section>
  );
}
