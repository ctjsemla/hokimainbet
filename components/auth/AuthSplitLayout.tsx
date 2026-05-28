"use client";

import { AnimatePresence, m } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthSplitLayoutProps {
  visual: ReactNode;
  form: ReactNode;
  visualSide?: "left" | "right";
  successFlash?: boolean;
}

const spring = { type: "spring" as const, stiffness: 320, damping: 32 };

export function AuthSplitLayout({
  visual,
  form,
  visualSide = "left",
  successFlash = false,
}: AuthSplitLayoutProps) {
  const visualFromX = visualSide === "left" ? -48 : 48;
  const formFromX = visualSide === "left" ? 48 : -48;

  return (
    <div className="relative min-h-screen bg-navy-950">
      <AnimatePresence>
        {successFlash && (
          <m.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none fixed inset-0 z-50 bg-[#22c55e]"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "grid min-h-screen lg:grid-cols-[55fr_45fr]",
          visualSide === "right" && "lg:grid-cols-[45fr_55fr]",
        )}
      >
        {visualSide === "left" ? (
          <>
            <m.div
              initial={{ opacity: 0, x: visualFromX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, duration: 0.4 }}
              className="order-1"
            >
              {visual}
            </m.div>
            <m.div
              initial={{ opacity: 0, x: formFromX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, duration: 0.4, delay: 0.05 }}
              className="order-2"
            >
              {form}
            </m.div>
          </>
        ) : (
          <>
            <m.div
              initial={{ opacity: 0, x: formFromX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, duration: 0.4 }}
              className="order-2 lg:order-1"
            >
              {form}
            </m.div>
            <m.div
              initial={{ opacity: 0, x: visualFromX }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, duration: 0.4, delay: 0.05 }}
              className="order-1 lg:order-2"
            >
              {visual}
            </m.div>
          </>
        )}
      </div>
    </div>
  );
}
