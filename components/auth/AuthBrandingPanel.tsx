"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthWinsTicker } from "@/components/auth/AuthWinsTicker";
import { AffiliateButton } from "@/components/ui/AffiliateButton";

const TRUST_KEYS = ["coins", "fair", "noDeposit"] as const;

export function AuthBrandingPanel() {
  const t = useTranslations("auth.branding");

  return (
    <div className="auth-panel-visual relative flex min-h-[120px] flex-col overflow-hidden bg-navy-900 lg:min-h-screen">
      <div className="auth-panel-bg" aria-hidden />
      <div className="auth-panel-dots" aria-hidden />

      <span
        className="pointer-events-none absolute -bottom-8 -left-4 hidden select-none font-display text-[300px] leading-none text-navy-700 opacity-[0.15] lg:block"
        aria-hidden
      >
        HOKI
      </span>

      <div className="relative z-10 flex h-[120px] items-center justify-center px-6 lg:hidden">
        <div className="inline-flex items-baseline gap-1">
          <span className="auth-hoki-glow font-display text-3xl leading-none text-orange-500">
            HOKI
          </span>
          <span className="font-sans text-2xl leading-none text-white">MAINBET</span>
        </div>
      </div>

      <div className="relative z-10 hidden lg:flex lg:min-h-screen lg:flex-col">
        <div className="flex flex-1 items-center justify-center px-12 py-20">
          <div className="mx-auto w-full max-w-md">
            <div className="inline-flex items-baseline gap-1">
              <span className="auth-hoki-glow font-display text-5xl leading-none text-orange-500">
                HOKI
              </span>
              <span className="font-sans text-4xl font-normal leading-none text-white">
                MAINBET
              </span>
            </div>

            <p className="mt-3 font-sans text-sm tracking-wide text-[#94a3b8]">
              {t("tagline")}
            </p>

            <div className="mt-6 h-0.5 w-10 bg-orange-500" />

            <ul className="mt-10 space-y-7">
              {TRUST_KEYS.map((key) => (
                <li key={key} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                    <Check className="h-3 w-3 text-orange-500" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="font-sans text-sm font-medium text-white">
                      {t(`trust.${key}.title`)}
                    </p>
                    <p className="mt-0.5 font-sans text-xs text-[#94a3b8]">
                      {t(`trust.${key}.sub`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <AffiliateButton size="lg" className="mt-10 w-full justify-center" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-12 pb-10">
          <AuthWinsTicker />
        </div>
      </div>
    </div>
  );
}
