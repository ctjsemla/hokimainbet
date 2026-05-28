interface MaxWinBadgeProps {
  value: string;
  className?: string;
}

export function MaxWinBadge({ value, className = "text-[#f59e0b]" }: MaxWinBadgeProps) {
  return (
    <span
      className={`absolute right-2 top-2 z-10 font-display text-sm leading-none ${className}`}
    >
      {value}
    </span>
  );
}
