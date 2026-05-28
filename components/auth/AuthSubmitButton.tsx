"use client";

import { m } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

interface AuthSubmitButtonProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
}

export function AuthSubmitButton({
  label,
  loadingLabel,
  loading,
}: AuthSubmitButtonProps) {
  return (
    <m.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="auth-submit-btn btn-cta-shimmer flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-orange-500 font-display text-lg uppercase tracking-[0.08em] text-white disabled:opacity-60"
    >
      {loading && <Spinner />}
      {loading ? loadingLabel : label}
    </m.button>
  );
}
