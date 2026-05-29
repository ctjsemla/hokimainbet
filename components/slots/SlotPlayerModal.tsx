"use client";

import { AnimatePresence, m } from "framer-motion";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { AffiliateButton } from "@/components/ui/AffiliateButton";
import { BC_GAME_URL, ROLLBIT_URL } from "@/lib/platforms";
import type { SlotGame } from "@/types/slots.types";
import { cn } from "@/lib/utils";

interface SlotPlayerModalProps {
  slot: SlotGame | null;
  onClose: () => void;
}

const IFRAME_LOAD_TIMEOUT_MS = 12_000;

export function SlotPlayerModal({ slot, onClose }: SlotPlayerModalProps) {
  const t = useTranslations("slots");
  const [demoStarted, setDemoStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!slot) return;
    setDemoStarted(false);
    setLoading(false);
    setError(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [slot, handleEscape]);

  const startDemo = useCallback(() => {
    if (!slot) return;
    setDemoStarted(true);
    setLoading(true);
    setError(false);

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    loadTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, IFRAME_LOAD_TIMEOUT_MS);
  }, [slot]);

  const handleIframeLoad = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    setLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    setLoading(false);
    setError(true);
  }, []);

  return (
    <AnimatePresence>
      {slot && (
        <m.div
          key={slot.slug}
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
              {!demoStarted ? (
                <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
                  <p className="max-w-md font-sans text-sm text-[#94a3b8]">
                    {t("demoPrompt")}
                  </p>
                  <button
                    type="button"
                    onClick={startDemo}
                    className="rounded-lg bg-orange-500 px-8 py-3 font-display text-lg uppercase tracking-wide text-white transition hover:scale-[1.02] hover:brightness-110"
                  >
                    {t("playDemo")}
                  </button>
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 bg-navy-800 p-8 text-center">
                  <p className="font-display text-2xl text-white">{t("errorTitle")}</p>
                  <p className="max-w-md font-sans text-sm text-[#94a3b8]">
                    {t("errorBody")}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={BC_GAME_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:brightness-110"
                    >
                      {t("fallbackBc")}
                      <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    </a>
                    <a
                      href={ROLLBIT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy-700 bg-navy-900 px-5 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:border-orange-500/40"
                    >
                      {t("fallbackRollbit")}
                      <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950">
                      <Loader2
                        className="h-10 w-10 animate-spin text-orange-500"
                        aria-hidden
                      />
                      <span className="sr-only">{t("loading")}</span>
                    </div>
                  )}
                  <iframe
                    key={slot.iframeUrl}
                    src={slot.iframeUrl}
                    title={slot.name}
                    className="h-full w-full border-0"
                    allow="fullscreen; autoplay"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                </>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
