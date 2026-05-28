"use client";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-navy-950 px-6 text-center md:min-h-screen">
      <h1 className="font-display text-5xl text-orange-500 md:text-6xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-sm text-slate-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-md bg-orange-500 px-6 py-3 font-display text-lg text-white transition-colors hover:bg-orange-600"
      >
        Try again
      </button>
    </div>
  );
}
