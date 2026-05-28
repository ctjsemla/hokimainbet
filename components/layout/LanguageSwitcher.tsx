"use client";

import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const locales = ["id", "en"] as const;

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex gap-1 rounded-full bg-navy-800 p-1">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wide transition-colors duration-200",
            locale === loc
              ? "bg-orange-500 text-white"
              : "bg-navy-700 text-slate-400 hover:text-white",
          )}
          aria-pressed={locale === loc}
          aria-label={t(loc)}
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
