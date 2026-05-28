import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types/blog.types";

interface CategoryBadgeProps {
  category: BlogCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-orange-500 px-3 py-0.5 font-sans text-xs font-semibold uppercase tracking-wider text-white",
        className,
      )}
    >
      {category}
    </span>
  );
}
