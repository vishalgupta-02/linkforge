"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useThemeStore } from "@/store";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-zinc-950 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
      <div className="animate-in fade-in zoom-in-95 flex w-full max-w-md flex-col items-center text-center duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-white/10 dark:bg-white/5">
          <AlertTriangle
            size={28}
            className="text-zinc-400 dark:text-zinc-500"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Something went wrong
        </h1>

        <p className="mb-8 text-[15px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
          We encountered an unexpected error while loading this page. Please try
          again.
        </p>

        <button
          onClick={() => reset()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:bg-[#111] dark:text-white dark:hover:bg-white/5"
        >
          <RotateCcw size={16} className="text-zinc-500" />
          Try again
        </button>
      </div>
    </div>
  );
}
