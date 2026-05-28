"use client";

import { fontVariables } from "@/lib/fonts";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-6 text-center font-sans text-white antialiased">
        <h1 className="font-display text-5xl text-orange-500 md:text-6xl">
          Critical Error
        </h1>
        <p className="mt-4 max-w-md text-sm text-slate-400">
          {error.message || "The application failed to load."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="btn-cta-shimmer mt-8 rounded-md bg-orange-500 px-6 py-3 font-sans text-lg font-semibold text-white transition-colors hover:bg-orange-600"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
