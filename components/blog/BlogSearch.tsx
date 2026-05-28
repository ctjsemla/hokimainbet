"use client";

import { Search, X } from "lucide-react";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface BlogSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function BlogSearch({ value, onChange }: BlogSearchProps) {
  const t = useTranslations("blog");
  const [expanded, setExpanded] = useState(false);

  return (
    <m.div
      className="relative flex items-center justify-end"
      animate={{ width: expanded ? 280 : 44 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="absolute right-0 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-navy-700 bg-navy-900 text-[#94a3b8] transition-colors hover:border-navy-700 hover:text-white"
        aria-label={t("search")}
      >
        <Search className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setExpanded(true)}
        placeholder={t("searchPlaceholder")}
        className={`h-11 w-full rounded-full border border-navy-700 bg-navy-900 py-2 pl-4 pr-12 text-sm text-white outline-none transition-opacity placeholder:text-[#94a3b8] focus:border-orange-500 ${
          expanded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {expanded && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-12 z-10 text-[#94a3b8] hover:text-white"
          aria-label={t("clearSearch")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </m.div>
  );
}
