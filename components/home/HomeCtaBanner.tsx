"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function HomeCtaBanner() {
  const t = useTranslations("home");

  return (
    <section className="mx-4 mb-16 overflow-hidden rounded-2xl bg-orange-500 px-8 py-14 md:mx-12 md:px-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-5xl leading-[0.95] tracking-[0.04em] text-white md:text-7xl">
          {t("ctaBannerTitle")}
        </h2>
        <p className="mt-4 text-lg text-white/90 md:text-xl">{t("ctaBannerSub")}</p>
        <Link
          href="/bonus"
          className="btn-cta-shimmer mt-8 inline-flex rounded-lg bg-navy-950 px-10 py-4 font-sans text-lg font-bold tracking-wide text-white"
        >
          {t("ctaBannerButton")}
        </Link>
      </div>
    </section>
  );
}
