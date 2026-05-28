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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-[calc(100vh-3.5rem)] p-4 md:min-h-screen md:p-6"
    >
      <div className="fixed right-4 top-16 z-30 flex items-center gap-2 md:right-8 md:top-6">
        <SoundToggle />
        <AffiliateButton size="sm" className="affiliate-pulse" />
      </div>

      <m.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.05 },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {children}
        <m.div
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 380, damping: 28, delay: 0.35 },
            },
          }}
        >
          <LiveFeedPanel />
        </m.div>
      </m.div>
    </m.div>
  );
}

export const gamePanelLeft = {
  hidden: { opacity: 0, x: -36 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28, delay: 0.2 },
  },
};

export const gamePanelRight = {
  hidden: { opacity: 0, x: 36 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 28, delay: 0.3 },
  },
};
