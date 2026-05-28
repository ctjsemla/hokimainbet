"use client";

import { m } from "framer-motion";
import { AffiliateButton } from "@/components/ui/AffiliateButton";
import { LiveFeedPanel } from "@/components/games/LiveFeedPanel";
import { SoundToggle } from "@/components/ui/SoundToggle";

interface GamePageShellProps {
  children: React.ReactNode;
}

export function GamePageShell({ children }: GamePageShellProps) {
  return (
    <m.div
      initial={false}
      className="relative min-h-[calc(100vh-3.5rem)] p-4 md:min-h-screen md:p-6"
    >
      <div className="fixed right-4 top-16 z-30 flex items-center gap-2 md:right-8 md:top-6">
        <SoundToggle />
        <AffiliateButton size="sm" className="affiliate-pulse" />
      </div>

      <m.div
        initial={false}
      >
        {children}
        <div className="mt-8">
          <LiveFeedPanel />
        </div>
      </m.div>
    </m.div>
  );
}

export const gamePanelLeft = {
  hidden: { x: -24 },
  show: {
    x: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28, delay: 0.2 },
  },
};

export const gamePanelRight = {
  hidden: { x: 24 },
  show: {
    x: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28, delay: 0.3 },
  },
};
