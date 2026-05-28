import { getTranslations } from "next-intl/server";
import { AffiliateButton } from "@/components/ui/AffiliateButton";

export async function PostBottomCta() {
  const t = await getTranslations("blog");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy-700 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 px-8 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 90% 50%, rgba(249,115,22,0.25) 0%, transparent 45%)",
        }}
      />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-4xl tracking-wide text-white md:text-5xl">
            {t("readyToPlay")}
          </h2>
          <p className="mt-2 max-w-lg text-[#94a3b8]">{t("readyToPlayDesc")}</p>
        </div>
        <AffiliateButton size="lg" className="shrink-0 font-display tracking-wide" />
      </div>
    </div>
  );
}
