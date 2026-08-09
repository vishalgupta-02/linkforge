"use client";

import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { useThemeStore } from "@/store";

export default function GlobalNotFound() {
  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 p-6 font-sans text-zinc-950 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(150,150,150,0.2) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="animate-fade-in-up relative z-10 flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm dark:border-white/10 dark:bg-white/5">
            <FileQuestion
              size={28}
              className="text-zinc-400 dark:text-zinc-500"
              strokeWidth={1.5}
            />
          </div>

          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Page not found
          </h1>

          <p className="mb-8 max-w-sm text-[15px] leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
            The page you’re looking for doesn’t exist or may have been moved.
          </p>

          <div className="flex w-full flex-col items-center gap-4 sm:w-auto">
            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-[0.98] sm:w-auto dark:border-white/10 dark:bg-[#111] dark:text-white dark:hover:bg-white/5"
            >
              <ArrowLeft
                size={16}
                className="text-zinc-400 dark:text-zinc-500"
              />
              Go home
            </Link>

            <Link
              href="/dashboard"
              className="text-[13px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
