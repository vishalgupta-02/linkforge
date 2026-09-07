"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { requestForgotPassword } from "@/apis/auth-reset";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await requestForgotPassword(email.trim());
      setIsSubmitted(true);
      toast.success(
        res.message || "Password reset link sent if account exists.",
      );
    } catch (err) {
      setError(
        (err as { message?: string })?.message ||
          "Failed to submit request. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative flex min-h-screen bg-zinc-50 font-sans text-zinc-950 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-5 z-50">
        <AnimatedThemeToggler className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white/80 text-zinc-600 shadow-sm backdrop-blur-md transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-[#111]/80 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white" />
      </div>

      {/* Visual Identity Left Panel */}
      <div className="relative hidden w-[45%] flex-col overflow-hidden border-r border-zinc-200 bg-linear-to-b from-zinc-100 via-zinc-50 to-zinc-200/50 p-12 lg:flex dark:border-white/5 dark:from-[#0a0a0a] dark:to-[#111111]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(120,120,120,0.2) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div>
            <h1 className="font-serif text-5xl font-bold opacity-30 dark:opacity-50">
              Linkforge
            </h1>
          </div>
          <div
            className="absolute top-[25%] left-[15%] flex scale-75 items-center gap-2 rounded-full border border-zinc-200/80 bg-white/60 px-4 py-2 text-zinc-700 opacity-60 blur-[1px] dark:border-white/5 dark:bg-white/3 dark:text-zinc-300 dark:opacity-40 dark:blur-[2px]"
            style={{ animation: "float-2 15s ease-in-out infinite" }}
          >
            <MessageCircle size={16} /> <span>Security Hub</span>
          </div>
          <div
            className="absolute right-[10%] bottom-[35%] flex scale-90 items-center gap-2 rounded-full border border-zinc-200/80 bg-white/60 px-4 py-2 text-zinc-700 opacity-50 blur-[1px] dark:border-white/5 dark:bg-white/3 dark:text-zinc-300 dark:opacity-30 dark:blur-[3px]"
            style={{ animation: "float-1 18s ease-in-out infinite reverse" }}
          >
            <Mail size={16} /> <span>Password Recovery</span>
          </div>

          <div
            className="absolute top-[35%] right-[20%] flex scale-90 items-center gap-2.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2.5 text-zinc-800 opacity-90 shadow-lg shadow-zinc-300/40 backdrop-blur-md dark:border-white/10 dark:bg-white/60 dark:text-white dark:opacity-80 dark:shadow-2xl dark:shadow-black/50 dark:backdrop-blur-sm"
            style={{ animation: "float-1 12s ease-in-out infinite" }}
          >
            <ShieldCheck
              size={18}
              className="text-violet-600 dark:text-violet-400"
            />{" "}
            <span className="text-sm font-semibold">Encrypted Tokens</span>
          </div>
          <div
            className="absolute bottom-[25%] left-[25%] flex scale-90 items-center gap-2.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2.5 text-zinc-800 opacity-90 shadow-lg shadow-zinc-300/40 backdrop-blur-md dark:border-white/10 dark:bg-white/6 dark:text-white dark:opacity-70 dark:shadow-2xl dark:shadow-black/50 dark:backdrop-blur-sm"
            style={{ animation: "float-3 14s ease-in-out infinite" }}
          >
            <KeyRound
              size={18}
              className="text-emerald-600 dark:text-emerald-400"
            />{" "}
            <span className="text-sm font-semibold">1-Hour Time Limit</span>
          </div>
        </div>

        <div className="animate-fade-in-up relative z-20 mt-auto pt-32">
          <h2 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Secure account recovery.
          </h2>
          <p className="text-base font-medium text-zinc-500 dark:text-zinc-400">
            Regain access to your LinkFlow bio profile and analytics in minutes.
          </p>
        </div>
      </div>

      {/* Main Right Form Panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="animate-fade-in-up w-full max-w-100 delay-100">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-black">
              <Sparkles size={16} />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Linkforge
            </span>
          </div>

          {!isSubmitted ? (
            <>
              <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Reset your password
                </h1>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Enter your email address and we&apos;ll send you a secure link
                  to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group/input space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-zinc-700 transition-colors group-focus-within/input:text-violet-600 dark:text-zinc-300 dark:group-focus-within/input:text-violet-400"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    disabled={isLoading}
                    required
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-xs transition-all placeholder:text-zinc-400 focus:bg-white focus-visible:border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:outline-none disabled:opacity-50 dark:border-white/10 dark:bg-white/2 dark:text-white dark:placeholder:text-zinc-600 dark:focus:bg-white/5 dark:focus-visible:border-violet-500 dark:focus-visible:ring-violet-500"
                  />
                </div>

                {error && (
                  <div className="animate-fade-in-up">
                    <p className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-50 p-3 text-[13px] font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span className="leading-snug">{error}</span>
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-xs transition-all hover:bg-violet-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Sending reset link...
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 border-t border-zinc-200 pt-6 text-center dark:border-white/5">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  <ArrowLeft size={16} /> Back to sign in
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-50 text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400">
                <Mail size={28} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Check your email
                </h1>
                <p className="text-sm leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
                  If an account exists for{" "}
                  <strong className="text-zinc-900 dark:text-white">
                    {email}
                  </strong>
                  , we have sent instructions to reset your password.
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/2 dark:text-zinc-400">
                <p className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-300">
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  Link expires in 1 hour
                </p>
                <p>
                  Be sure to check your spam or junk folder if you don&apos;t
                  see the email within a few minutes.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-800 shadow-xs transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Try another email
                </button>

                <Link
                  href="/signin"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-xs transition-all hover:bg-violet-700 active:scale-[0.98]"
                >
                  Return to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
