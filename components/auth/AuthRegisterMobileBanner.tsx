"use client";

import { useTranslations } from "next-intl";

export function AuthRegisterMobileBanner() {
  const t = useTranslations("auth.register");

  return (
    <div className="auth-panel-visual relative flex h-[120px] items-center justify-center overflow-hidden bg-navy-900 lg:hidden">
      <div className="auth-panel-bg" aria-hidden />
      <div className="relative z-10 text-center">
        <span className="font-display text-6xl leading-none text-navy-700">1000</span>
        <p className="mt-1 font-display text-lg tracking-[0.12em] text-orange-500">
          {t("bonusLabel")}
        </p>
      </div>
    </div>
  );
}
