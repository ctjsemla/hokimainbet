import { cn } from "@/lib/utils";

interface BonusBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function BonusBadge({ children, className }: BonusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-md bg-navy-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-500",
        className,
      )}
    >
      {children}
    </span>
  );
}
