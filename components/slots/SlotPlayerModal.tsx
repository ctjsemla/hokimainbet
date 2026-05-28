"use client";

import { AnimatePresence, m } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { AffiliateButton } from "@/components/ui/AffiliateButton";
import type { SlotGame } from "@/types/slots.types";
import { cn } from "@/lib/utils";

interface SlotPlayerModalProps {
  slot: SlotGame | null;
  onClose: () => void;
}

export function SlotPlayerModal({ slot, onClose }: SlotPlayerModalProps) {
  const t = useTranslations("slots");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!slot) return;
    setLoading(true);
    setError(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [slot, handleEscape]);

  return (
    <AnimatePresence>
      {slot && (
        <m.div
          key={slot.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 md:p-4"
          onClick={onClose}
          role="presentation"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28, duration: 0.25 }}
            className={cn(
              "flex flex-col overflow-hidden bg-navy-950 shadow-2xl",
              "h-screen w-screen rounded-none",
              "md:h-[92vh] md:w-[95vw] md:rounded-2xl",
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="slot-modal-title"
          >
            <header className="flex h-12 shrink-0 items-center gap-3 border-b border-navy-800 bg-navy-900 px-3 md:px-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] uppercase tracking-wide text-[#94a3b8]">
                  {slot.provider}
                </p>
                <h2
                  id="slot-modal-title"
                  className="truncate font-display text-lg leading-tight text-white md:text-xl"
                >
                  {slot.name}
                </h2>
              </div>

              <p className="hidden shrink-0 text-center text-xs text-[#94a3b8] sm:block">
                {t("rtp")} {slot.rtp}% · {t("maxWin")} {slot.maxWin}
              </p>

              <div className="flex shrink-0 items-center gap-2">
                <AffiliateButton size="sm" className="text-xs" />
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700 text-[#94a3b8] transition hover:bg-red-500/20 hover:text-red-400"
                  aria-label={t("close")}
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
            </header>

            <div className="relative min-h-0 flex-1 bg-navy-950">
              {loading && !error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950">
                  <Loader2 className="h-10 w-10 animate-spin text-orange-500" aria-hidden />
                  <span className="sr-only">{t("loading")}</span>
                </div>
              )}

              {error ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-navy-800 p-8 text-center">
                  <p className="font-display text-2xl text-white">{t("errorTitle")}</p>
                  <p className="max-w-md font-sans text-sm text-[#94a3b8]">{t("errorBody")}</p>
                  <AffiliateButton size="lg" className="affiliate-pulse" />
                </div>
              ) : (
                <iframe
                  key={slot.iframeUrl}
                  src={slot.iframeUrl}
                  title={slot.name}
                  className="h-full w-full border-0"
                  allow="fullscreen; autoplay"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError(true);
                  }}
                />
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
