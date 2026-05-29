"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import {
  Bomb,
  BookOpen,
  ChevronDown,
  Circle,
  CircleDot,
  Dices,
  Gift,
  Grid3x3,
  Home,
  LayoutGrid,
  Lock,
  LogOut,
  Trophy,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { slots } from "@/lib/slotsData";
import type { SlotGame, SlotProvider } from "@/types/slots.types";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { LiveMultiplierBadge } from "@/components/ui/LiveMultiplierBadge";
import { DemoBalanceAlerts } from "@/components/ui/DemoBalanceAlerts";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDemoCoins } from "@/lib/formatCurrency";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onNavigate?: () => void;
}

function NavItem({ href, icon, label, isActive, onNavigate }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "nav-link-nudge group relative flex h-12 items-center gap-3 px-4 transition-all duration-150 ease-out",
        isActive
          ? "bg-gradient-to-r from-orange-500/20 to-transparent text-white"
          : "text-[#94a3b8] hover:bg-orange-500/10 hover:text-white",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r transition-all duration-150",
          isActive ? "bg-orange-500" : "bg-orange-500/0 group-hover:bg-orange-500/60",
        )}
      />
      <span className={cn("relative shrink-0", isActive && "text-orange-500")}>{icon}</span>
      <span
        className={cn(
          "text-sm font-sans",
          isActive ? "font-semibold text-white" : "font-medium",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

type GameKey = "crash" | "dice" | "mines" | "plinko" | "wheel" | "keno";

interface GameRoute {
  href: string;
  key: GameKey;
  icon: LucideIcon;
  tick: () => string;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const gameRoutes: GameRoute[] = [
  {
    href: "/games/crash",
    key: "crash",
    icon: Zap,
    tick: () => `${randomBetween(1.2, 8).toFixed(2)}x`,
  },
  {
    href: "/games/dice",
    key: "dice",
    icon: Dices,
    tick: () => `${Math.round(randomBetween(45, 99))}`,
  },
  {
    href: "/games/mines",
    key: "mines",
    icon: Bomb,
    tick: () => `${randomBetween(1.5, 6).toFixed(1)}x`,
  },
  {
    href: "/games/plinko",
    key: "plinko",
    icon: Circle,
    tick: () => `${Math.round(randomBetween(2, 12))}x`,
  },
  {
    href: "/games/wheel",
    key: "wheel",
    icon: CircleDot,
    tick: () => `${randomBetween(1.2, 10).toFixed(1)}x`,
  },
  {
    href: "/games/keno",
    key: "keno",
    icon: Grid3x3,
    tick: () => `${Math.round(randomBetween(2, 200))}x`,
  },
];

function useGameTickers() {
  const [values, setValues] = useState<Record<GameKey, string>>({
    crash: "2.41x",
    dice: "84",
    mines: "3.2x",
    plinko: "5x",
    wheel: "3.5x",
    keno: "20x",
  });

  useEffect(() => {
    const id = setInterval(() => {
      setValues({
        crash: gameRoutes[0].tick(),
        dice: gameRoutes[1].tick(),
        mines: gameRoutes[2].tick(),
        plinko: gameRoutes[3].tick(),
        wheel: gameRoutes[4].tick(),
        keno: gameRoutes[5].tick(),
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return values;
}

function useActivePlayers() {
  const [count, setCount] = useState(247);

  useEffect(() => {
    const schedule = (): ReturnType<typeof setTimeout> => {
      const delay = 5000 + Math.random() * 3000;
      return setTimeout(() => {
        setCount((prev) => {
          const delta =
            (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
          return Math.max(180, Math.min(420, prev + delta));
        });
        timeoutId = schedule();
      }, delay);
    };
    let timeoutId = schedule();
    return () => clearTimeout(timeoutId);
  }, []);

  return count;
}

interface GameNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  badge: string;
  isActive: boolean;
  onNavigate?: () => void;
}

function ProviderBadge({ provider }: { provider: SlotProvider }) {
  if (provider === "Pragmatic Play") {
    return (
      <span className="shrink-0 rounded bg-orange-400/10 px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-orange-400/60">
        PP
      </span>
    );
  }
  if (provider === "Hacksaw Gaming") {
    return (
      <span className="shrink-0 rounded bg-navy-700/80 px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">
        HG
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded bg-orange-500/10 px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-orange-500/70">
      NC
    </span>
  );
}

interface SlotGameNavItemProps {
  slot: SlotGame;
  isActive: boolean;
  onNavigate?: () => void;
}

function SlotGameNavItem({ slot, isActive, onNavigate }: SlotGameNavItemProps) {
  return (
    <Link
      href={`/games/slots?play=${slot.slug}`}
      onClick={onNavigate}
      className={cn(
        "sidebar-game-row nav-link-nudge group relative flex min-h-11 items-center gap-2 py-2.5 pl-10 pr-3 transition-all duration-150 ease-out",
        isActive
          ? "bg-gradient-to-r from-orange-500/20 to-transparent"
          : "hover:bg-orange-500/10",
      )}
    >
      {isActive ? (
        <span className="sidebar-game-accent-active" aria-hidden />
      ) : (
        <span className="sidebar-game-accent-idle" aria-hidden />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          {slot.localBadge && (
            <span className="shrink-0 font-sans text-[10px] font-semibold text-[#f59e0b]">
              🇮🇩
            </span>
          )}
          <span
            className={cn(
              "truncate font-sans text-sm leading-tight",
              isActive
                ? "font-semibold text-white"
                : "font-medium text-[#94a3b8] group-hover:text-white",
              slot.featured && "text-[#fbbf24] group-hover:text-[#fbbf24]",
            )}
          >
            {slot.name}
          </span>
        </span>
      </div>

      <ProviderBadge provider={slot.provider} />
    </Link>
  );
}

function GameNavItem({
  href,
  label,
  icon: Icon,
  badge,
  isActive,
  onNavigate,
}: GameNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "sidebar-game-row nav-link-nudge group relative flex h-12 items-center gap-3 pl-10 pr-4 transition-all duration-150 ease-out",
        isActive
          ? "bg-gradient-to-r from-orange-500/20 to-transparent"
          : "hover:bg-orange-500/10",
      )}
    >
      {isActive ? (
        <span className="sidebar-game-accent-active" aria-hidden />
      ) : (
        <span className="sidebar-game-accent-idle" aria-hidden />
      )}

      <span className="relative flex shrink-0 items-center">
        <Icon
          className={cn(
            "h-4 w-4 transition-colors duration-150",
            isActive ? "text-orange-500" : "text-[#94a3b8] group-hover:text-white",
          )}
          strokeWidth={1.75}
        />
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full",
            isActive ? "bg-orange-500" : "bg-[#64748b]",
          )}
          aria-hidden
        />
        {isActive && (
          <span
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 animate-ping rounded-full bg-orange-500"
            aria-hidden
          />
        )}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 truncate font-sans text-sm",
          isActive ? "font-semibold text-white" : "font-medium text-[#94a3b8] group-hover:text-white",
        )}
      >
        {label}
      </span>

      <LiveMultiplierBadge value={badge} />
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, profile, balance, signOut } = useAuth();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [slotGamesOpen, setSlotGamesOpen] = useState(false);
  const activePlayers = useActivePlayers();
  const gameTickers = useGameTickers();

  const playId = searchParams.get("play");
  const isSlotsActive = pathname === "/games/slots";
  const isGamesActive =
    pathname.startsWith("/games") && pathname !== "/games/slots";

  useEffect(() => {
    if (isGamesActive) {
      setGamesOpen(true);
    }
  }, [isGamesActive]);

  useEffect(() => {
    if (isSlotsActive) {
      setSlotGamesOpen(true);
    }
  }, [isSlotsActive]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const displayName =
    profile?.username ??
    (user?.user_metadata?.username as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";
  const avatarLetter = displayName.charAt(0).toUpperCase() || "?";

  async function handleSignOut() {
    await signOut();
    onClose();
  }

  const sidebarContent = (
    <div className="sidebar-alive flex h-full flex-col">
      <span className="absolute inset-x-0 top-0 z-20 h-0.5 bg-orange-500" aria-hidden />

      <div className="sidebar-logo-section">
        <div className="sidebar-logo-gradient" aria-hidden />
        <Link
          href="/"
          onClick={onClose}
          className="relative z-10 block cursor-pointer no-underline"
          aria-label={t("home")}
        >
          <div className="relative inline-flex items-baseline gap-1">
            <span className="sidebar-hoki-glow relative font-display text-[30px] leading-none text-orange-500">
              HOKI
            </span>
            <span className="relative font-sans text-[26px] font-normal leading-none text-white">
              MAINBET
            </span>
          </div>
        </Link>
        <p className="relative z-10 mt-2 font-sans text-xs text-[#94a3b8]">{t("tagline")}</p>
        <p className="relative z-10 mt-3 flex items-center gap-2 font-sans text-[11px] text-[#94a3b8]">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          </span>
          <AnimatedNumber
            value={activePlayers}
            format={(n) => t("activePlayers", { count: Math.round(n) })}
          />
        </p>
      </div>

      <nav className="relative z-10 flex-1 overflow-y-auto py-3">
        <NavItem
          href="/"
          icon={<Home className="h-5 w-5" strokeWidth={1.75} />}
          label={t("home")}
          isActive={pathname === "/"}
          onNavigate={onClose}
        />

        <div>
          <button
            type="button"
            onClick={() => setGamesOpen((open) => !open)}
            className={cn(
              "nav-link-nudge group relative flex h-12 w-full items-center justify-between px-4 transition-all duration-150 ease-out",
              isGamesActive
                ? "bg-gradient-to-r from-orange-500/20 to-transparent text-white"
                : "text-[#94a3b8] hover:bg-orange-500/10 hover:text-white",
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r transition-all duration-150",
                isGamesActive ? "bg-orange-500" : "bg-orange-500/0 group-hover:bg-orange-500/60",
              )}
            />
            <span className="font-sans text-sm font-medium">{t("games")}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-200",
                gamesOpen && "rotate-180",
              )}
              strokeWidth={1.75}
            />
          </button>

          <AnimatePresence initial={false}>
            {gamesOpen && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {gameRoutes.map(({ href, key, icon }) => (
                  <GameNavItem
                    key={href}
                    href={href}
                    icon={icon}
                    label={t(key)}
                    badge={gameTickers[key]}
                    isActive={pathname === href}
                    onNavigate={onClose}
                  />
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setSlotGamesOpen((open) => !open)}
            className={cn(
              "nav-link-nudge group relative flex h-12 w-full items-center justify-between gap-2 px-4 transition-all duration-150 ease-out",
              isSlotsActive
                ? "bg-gradient-to-r from-orange-500/20 to-transparent text-white"
                : "text-[#94a3b8] hover:bg-orange-500/10 hover:text-white",
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r transition-all duration-150",
                isSlotsActive ? "bg-orange-500" : "bg-orange-500/0 group-hover:bg-orange-500/60",
              )}
            />
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <span className="relative flex shrink-0 items-center">
                <LayoutGrid
                  className={cn(
                    "h-5 w-5 transition-colors duration-150",
                    isSlotsActive ? "text-orange-500" : "text-[#94a3b8] group-hover:text-white",
                  )}
                  strokeWidth={1.75}
                />
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
                <span
                  className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 animate-ping rounded-full bg-orange-500"
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  "truncate font-sans text-sm",
                  isSlotsActive ? "font-semibold text-white" : "font-medium",
                )}
              >
                {t("slotGames")}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="rounded bg-navy-700 px-2 py-0.5 font-sans text-xs font-semibold text-orange-500">
                {t("slotGamesCount")}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  slotGamesOpen && "rotate-180",
                )}
                strokeWidth={1.75}
              />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {slotGamesOpen && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="sidebar-slots-scroll">
                  {slots.map((slot) => (
                    <SlotGameNavItem
                      key={slot.slug}
                      slot={slot}
                      isActive={isSlotsActive && playId === slot.slug}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sidebar-section-divider" aria-hidden />

        <NavItem
          href="/blog"
          icon={<BookOpen className="h-5 w-5" strokeWidth={1.75} />}
          label={t("blog")}
          isActive={pathname === "/blog" || pathname.startsWith("/blog/")}
          onNavigate={onClose}
        />
        <NavItem
          href="/leaderboard"
          icon={<Trophy className="h-5 w-5" strokeWidth={1.75} />}
          label={t("leaderboard")}
          isActive={pathname === "/leaderboard"}
          onNavigate={onClose}
        />
        <NavItem
          href="/bonus"
          icon={<Gift className="h-5 w-5" strokeWidth={1.75} />}
          label={t("bonus")}
          isActive={pathname === "/bonus"}
          onNavigate={onClose}
        />
        <NavItem
          href="/coin-win"
          icon={<CircleDot className="h-5 w-5" strokeWidth={1.75} />}
          label={t("coinWin")}
          isActive={pathname === "/coin-win"}
          onNavigate={onClose}
        />
      </nav>

      <div className="relative z-10 mt-auto space-y-3 border-t border-navy-800 p-4">
        <div className="sidebar-provably-fair">
          <Lock className="sidebar-provably-fair-icon h-3 w-3 shrink-0 text-orange-500" strokeWidth={2} />
          {t("provablyFair")}
        </div>

        <LanguageSwitcher />

        {!user && (
          <div className="space-y-2">
            <m.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/auth/login" onClick={onClose} className="sidebar-login-btn">
                {t("login")}
              </Link>
            </m.div>
            <m.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/auth/register" onClick={onClose} className="sidebar-register-btn">
                {t("register")}
              </Link>
            </m.div>
          </div>
        )}

        {user && (
          <div className="panel-interactive flex items-start gap-3 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 font-sans text-sm font-semibold text-white">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate font-sans text-sm font-medium text-white">
                {displayName}
              </span>
              <p className="mt-0.5 font-display text-sm text-orange-400">
                {t("demoCoins", { amount: formatDemoCoins(balance) })}
              </p>
              <DemoBalanceAlerts className="mt-1" />
            </div>
            <m.button
              type="button"
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="shrink-0 rounded-md p-1.5 text-[#94a3b8] transition-colors duration-200 hover:bg-navy-700 hover:text-white"
              aria-label={t("logout")}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </m.button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <m.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "sidebar-shell fixed left-0 top-0 z-50 h-full w-[240px] transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
