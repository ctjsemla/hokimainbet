"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSoundEnabled } from "@/components/providers/SoundProvider";
import { cn } from "@/lib/utils";

export function SoundToggle({ className }: { className?: string }) {
  const t = useTranslations("common");
  const { enabled, toggle } = useSoundEnabled();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "btn-press flex h-9 w-9 items-center justify-center rounded-lg border border-navy-700 bg-navy-900/80 text-[#94a3b8] backdrop-blur-sm transition-colors hover:border-orange-500/30 hover:text-white",
        className,
      )}
      aria-label={enabled ? t("soundOff") : t("soundOn")}
      title={enabled ? t("soundOff") : t("soundOn")}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <VolumeX className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
