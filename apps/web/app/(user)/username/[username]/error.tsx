"use client";

import { useEffect } from "react";
import { UserX, RotateCcw } from "lucide-react";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <div className="animate-in fade-in zoom-in-95 flex w-full max-w-md flex-col items-center text-center duration-500">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-white/10 dark:bg-white/5">
          <UserX
            size={28}
            className="text-zinc-400 dark:text-zinc-500"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="mb-2 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Failed to load profile
        </h1>

        <p className="mb-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          We couldn't retrieve this creator's information. Please try again in a
          moment.
        </p>

        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:bg-[#111] dark:text-white dark:hover:bg-white/5"
        >
          <RotateCcw size={14} className="text-zinc-500" />
          Retry
        </button>
      </div>
    </div>
  );
}
