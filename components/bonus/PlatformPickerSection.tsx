"use client";

import { m } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { BC_GAME_URL, ROLLBIT_URL } from "@/lib/platforms";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

interface ComparisonRow {
  featureKey: string;
  bc: string;
  rollbit: string;
  bcCheck?: boolean;
  rollbitCheck?: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { featureKey: "welcomeBonus", bc: "280% deposit", rollbit: "15% rakeback" },
  { featureKey: "gameCount", bc: "10,000+", rollbit: "10,000+" },
  { featureKey: "crash", bc: "yes", rollbit: "yes", bcCheck: true, rollbitCheck: true },
  { featureKey: "slots", bc: "yes", rollbit: "yes", bcCheck: true, rollbitCheck: true },
  { featureKey: "liveCasino", bc: "yes", rollbit: "no", bcCheck: true, rollbitCheck: false },
  { featureKey: "esports", bc: "no", rollbit: "yes", bcCheck: false, rollbitCheck: true },
  { featureKey: "indonesian", bc: "yes", rollbit: "no", bcCheck: true, rollbitCheck: false },
  { featureKey: "minDeposit", bc: "~$10", rollbit: "~$10" },
  { featureKey: "withdrawal", bc: "cryptoInstant", rollbit: "cryptoInstant" },
];

function CellValue({
  value,
  isCheck,
}: {
  value: string;
  isCheck?: boolean;
}) {
  const t = useTranslations("bonus.platform");

  if (isCheck) {
    return (
      <span className="font-semibold text-[#4ade80]" aria-label={t("yes")}>
        ✓
      </span>
    );
  }
  if (value === "no") {
    return <span className="text-[#475569]">—</span>;
  }
  if (value === "yes") {
    return <span className="font-semibold text-[#4ade80]">✓</span>;
  }
  if (value === "cryptoInstant") {
    return <span className="text-[#94a3b8]">{t("cryptoInstant")}</span>;
  }
  return <span className="text-[#94a3b8]">{value}</span>;
}

function PlatformLogo({ platform }: { platform: "bc" | "rollbit" }) {
  const isBc = platform === "bc";

  return (
    <div
      className={cn(
        "flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/10 p-2",
        isBc
          ? "bg-[linear-gradient(135deg,#0a1628_0%,#1e3a5f_100%)] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          : "bg-[linear-gradient(135deg,#0f0a1f_0%,#2d1b4e_100%)] shadow-[0_0_20px_rgba(147,51,234,0.3)]",
      )}
    >
      <Image
        src={isBc ? "/logos/bcgame.png" : "/logos/rollbit.png"}
        alt={isBc ? "BC.Game" : "Rollbit"}
        width={56}
        height={56}
        className="h-full w-full rounded-2xl object-contain mix-blend-screen"
        style={{ filter: "brightness(1.05)" }}
      />
    </div>
  );
}

function PlatformCard({
  platform,
}: {
  platform: "bc" | "rollbit";
}) {
  const t = useTranslations("bonus.platform");
  const isBc = platform === "bc";

  const features = isBc
    ? (["games", "providers", "withdrawal", "indonesian", "deposit"] as const)
    : (["slots", "crash", "esports", "calendar", "privacy"] as const);

  return (
    <m.article
      variants={item}
      className={cn(
        "group relative flex min-h-[400px] flex-col overflow-hidden rounded-2xl border border-navy-800 p-6 transition-[transform,box-shadow,border-color] duration-300 md:p-8",
        "hover:-translate-y-1",
        isBc
          ? "hover:border-blue-500/50 hover:shadow-[0_12px_48px_rgba(59,130,246,0.15)]"
          : "hover:border-purple-600/50 hover:shadow-[0_12px_48px_rgba(147,51,234,0.15)]",
      )}
      style={{
        background: isBc
          ? "radial-gradient(ellipse at top, #0a1628 0%, #060d1f 100%)"
          : "radial-gradient(ellipse at top, #0f0a1f 0%, #060d1f 100%)",
      }}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[3px]",
          isBc ? "bg-blue-500" : "bg-purple-600",
        )}
        aria-hidden
      />

      <PlatformLogo platform={platform} />

      <h2 className="mt-5 font-display text-[40px] leading-none text-white md:text-[48px]">
        {isBc ? "BC.GAME" : "ROLLBIT"}
      </h2>
      <p className={cn("mt-2 text-sm", isBc ? "text-blue-400" : "text-purple-400")}>
        {t(isBc ? "bcTagline" : "rollbitTagline")}
      </p>

      <div className="my-6 h-px w-full bg-navy-800" aria-hidden />

      <div className="rounded-xl bg-navy-800 p-4">
        <p
          className={cn(
            "font-display text-[56px] leading-none md:text-[64px]",
            isBc ? "text-orange-500" : "text-yellow-400",
          )}
        >
          {t(isBc ? "bcBonusValue" : "rollbitBonusValue")}
        </p>
        <p className="mt-2 text-base text-white">
          {t(isBc ? "bcBonusTitle" : "rollbitBonusTitle")}
        </p>
        <p className="mt-1 text-sm text-[#94a3b8]">
          {t(isBc ? "bcBonusSub" : "rollbitBonusSub")}
        </p>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((key) => (
          <li key={key} className="flex items-start gap-2 text-sm text-[#94a3b8]">
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                isBc ? "text-blue-400" : "text-purple-400",
              )}
              strokeWidth={2.5}
            />
            <span>{t(isBc ? `bcFeatures.${key}` : `rollbitFeatures.${key}`)}</span>
          </li>
        ))}
      </ul>

      <a
        href={isBc ? BC_GAME_URL : ROLLBIT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-8 flex h-[52px] w-full items-center justify-center font-display text-lg tracking-wide text-white transition-colors",
          isBc
            ? "rounded-lg bg-blue-600 hover:bg-blue-500"
            : "rounded-lg bg-purple-600 hover:bg-purple-500",
        )}
      >
        {t(isBc ? "bcCta" : "rollbitCta")}
      </a>

      <p className="mt-4 text-center text-xs text-[#64748b]">
        {t(isBc ? "bcLicense" : "rollbitLicense")}
      </p>
    </m.article>
  );
}

export function PlatformPickerSection() {
  const t = useTranslations("bonus.platform");

  return (
    <m.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-12"
    >
      <m.header variants={item} className="mb-10 max-w-2xl">
        <h1 className="font-display text-[56px] leading-[0.95] tracking-wide text-white md:text-[72px]">
          {t("title")}
        </h1>
        <p className="mt-3 text-base text-[#94a3b8]">{t("subtitle")}</p>
      </m.header>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformCard platform="bc" />
        <PlatformCard platform="rollbit" />
      </div>

      <m.section variants={item} className="mt-16">
        <h2 className="font-display text-[40px] leading-none tracking-wide text-white md:text-[48px]">
          {t("comparisonTitle")}
        </h2>

        <div className="mt-6 overflow-hidden rounded-2xl bg-navy-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="bg-navy-900">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                    {t("tableFeature")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                    BC.Game
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-[#94a3b8]">
                    Rollbit
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, index) => (
                  <tr
                    key={row.featureKey}
                    className={cn(
                      index % 2 === 0 ? "bg-navy-800" : "bg-[#0f2040]",
                    )}
                  >
                    <td className="px-4 py-3.5 font-medium text-white">
                      {t(`rows.${row.featureKey}`)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CellValue
                        value={row.bc}
                        isCheck={row.bcCheck}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CellValue
                        value={row.rollbit}
                        isCheck={row.rollbitCheck}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </m.section>

      <m.section
        variants={item}
        className="mt-12 rounded-2xl bg-navy-800 p-8 text-center md:p-10"
      >
        <h2 className="font-display text-[32px] leading-tight text-white md:text-[40px]">
          {t("bottomTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[#94a3b8]">{t("bottomSub")}</p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href={BC_GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-blue-600 font-display text-lg tracking-wide text-white transition-colors hover:bg-blue-500"
          >
            {t("bottomBc")}
          </a>
          <a
            href={ROLLBIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-purple-600 font-display text-lg tracking-wide text-white transition-colors hover:bg-purple-500"
          >
            {t("bottomRollbit")}
          </a>
        </div>
      </m.section>
    </m.div>
  );
}
