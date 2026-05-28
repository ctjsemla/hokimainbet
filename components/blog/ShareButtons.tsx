"use client";

import { Send, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const t = useTranslations("blog");
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      className: "hover:bg-navy-700",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      className: "hover:bg-navy-700",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      className: "hover:bg-navy-700",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <Share2 className="h-4 w-4" strokeWidth={1.5} />
        {t("share")}
      </span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm font-medium text-white transition-colors ${link.className}`}
        >
          {link.label}
        </a>
      ))}
      <a
        href={url}
        className="ml-auto hidden items-center gap-1 text-sm text-orange-500 sm:inline-flex"
        onClick={(e) => {
          e.preventDefault();
          void navigator.clipboard?.writeText(url);
        }}
      >
        <Send className="h-4 w-4" />
        {t("copyLink")}
      </a>
    </div>
  );
}
