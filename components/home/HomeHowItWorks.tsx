"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";

const STEPS = ["01", "02", "03"] as const;

export function HomeHowItWorks() {
  const t = useTranslations("home");

  return (
    <section className="border-t border-navy-800 px-6 py-20 md:px-12 md:py-28">
      <m.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="heading-display mb-16 text-center text-[48px] md:text-[56px]"
      >
        {t("howHeading")}
      </m.h2>

      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, index) => (
          <m.div
            key={step}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative text-center md:text-left"
          >
            <span
              className="pointer-events-none absolute -left-2 -top-6 font-display text-[100px] leading-none text-navy-700 md:-top-8 md:text-[120px]"
              aria-hidden
            >
              {step}
            </span>
            <div className="relative z-10 pt-12 md:pt-16">
              <h3 className="font-display text-3xl tracking-[0.04em] text-white md:text-4xl">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-3 text-[#94a3b8]">{t(`steps.${step}.desc`)}</p>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
