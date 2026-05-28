"use client";

import { AnimatePresence, m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  className?: string;
  size?: "md" | "lg";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipUnit({
  value,
  label,
  large,
}: {
  value: number;
  label: string;
  large?: boolean;
}) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-navy-900 px-2 py-1",
          large ? "min-w-[4.5rem] px-3 py-2" : "min-w-[3.25rem]",
        )}
        style={{ perspective: 500 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={display}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={cn(
              "block text-center font-display tracking-wide text-orange-500",
              large ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {display}
          </m.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8] md:text-xs">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({
  targetDate,
  label,
  className,
  size = "md",
}: CountdownTimerProps) {
  const t = useTranslations("bonus.countdown");
  useLocale();

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcTimeLeft(targetDate),
  );

  useEffect(() => {
    const tick = () => setTimeLeft(calcTimeLeft(targetDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = useMemo(
    () => [
      { value: timeLeft.days, label: t("days") },
      { value: timeLeft.hours, label: t("hours") },
      { value: timeLeft.minutes, label: t("minutes") },
      { value: timeLeft.seconds, label: t("seconds") },
    ],
    [timeLeft, t],
  );

  const large = size === "lg";

  return (
    <div className={cn("flex flex-col items-end gap-3", className)}>
      {label && (
        <p className="text-right text-sm font-medium text-[#94a3b8]">{label}</p>
      )}
      <div className="flex flex-wrap justify-end gap-2 md:gap-3">
        {units.map((unit) => (
          <FlipUnit
            key={unit.label}
            value={unit.value}
            label={unit.label}
            large={large}
          />
        ))}
      </div>
    </div>
  );
}
