import Image from "next/image";
import { hasCustomCover, SlotCoverArt } from "@/components/slots/SlotCoverArt";
import type { SlotGame } from "@/types/slots.types";
import { cn } from "@/lib/utils";

const PROVIDER_GRADIENT: Record<string, string> = {
  "pragmatic-play":
    "bg-gradient-to-br from-navy-950 via-navy-800 to-orange-500/35",
  "hacksaw-gaming":
    "bg-gradient-to-tr from-navy-950 via-navy-800 to-navy-700",
  "nolimit-city":
    "bg-gradient-to-bl from-navy-950 via-navy-900 to-orange-400/25",
};

interface SlotGameVisualProps {
  slot: Pick<SlotGame, "slug" | "providerSlug" | "thumb" | "name">;
  className?: string;
}

export function SlotGameVisual({ slot, className }: SlotGameVisualProps) {
  if (hasCustomCover(slot.slug)) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <SlotCoverArt slug={slot.slug} />
      </div>
    );
  }

  if (slot.thumb) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        <Image
          src={slot.thumb}
          alt={slot.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  const gradient =
    PROVIDER_GRADIENT[slot.providerSlug] ??
    "bg-gradient-to-br from-navy-950 to-navy-800";

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden p-4",
        gradient,
        className,
      )}
    >
      <span className="font-display text-3xl uppercase leading-none text-white/25">
        {slot.name.slice(0, 2)}
      </span>
    </div>
  );
}
