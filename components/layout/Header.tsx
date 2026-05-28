"use client";

import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-navy-900 px-4 md:hidden">
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl leading-none text-orange-500">
          HOKI
        </span>
        <span className="font-sans text-2xl font-normal leading-none text-white">
          MAINBET
        </span>
      </div>
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-navy-700"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" strokeWidth={1.75} />
      </button>
    </header>
  );
}
