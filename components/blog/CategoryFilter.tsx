"use client";

import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { BLOG_CATEGORIES } from "@/types/blog.types";
import { cn } from "@/lib/utils";

export type CategoryFilterValue = "All" | (typeof BLOG_CATEGORIES)[number];

interface CategoryFilterProps {
  active: CategoryFilterValue;
  onChange: (category: CategoryFilterValue) => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const t = useTranslations("blog");

  const items: CategoryFilterValue[] = ["All", ...BLOG_CATEGORIES];

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:px-0">
      <div className="flex min-w-max gap-2">
        {items.map((item) => {
          const isActive = active === item;
          const label =
            item === "All" ? t("allCategories") : t(`categories.${item}`);

          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive ? "text-white" : "bg-navy-700 text-[#94a3b8]",
              )}
            >
              {isActive && (
                <m.span
                  layoutId="blog-category-pill"
                  className="absolute inset-0 rounded-full bg-orange-500"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" />
    </div>
  );
}
