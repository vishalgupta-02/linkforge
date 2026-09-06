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
  Globe,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { requestForgotPassword } from "@/apis/auth-reset";

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
      toast.success(res.message || "Password reset link sent if account exists.");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      // Even on error, show generic response or specific network error
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] font-sans text-zinc-50 selection:bg-violet-500/30">
      {/* Visual Identity Left Panel */}
      <div className="relative hidden w-[45%] flex-col overflow-hidden border-r border-white/5 bg-linear-to-b from-[#0a0a0a] to-[#111111] p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(150,150,150,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div>
            <h1 className="font-serif text-5xl font-bold opacity-50">
              Linkforge
            </h1>
          </div>
          <div
            className="absolute top-[25%] left-[15%] flex scale-75 items-center gap-2 rounded-full border border-white/5 bg-white/3 px-4 py-2 opacity-40 blur-[2px]"
            style={{ animation: "float-2 15s ease-in-out infinite" }}
          >
            <MessageCircle size={16} /> <span>Security Hub</span>
          </div>
          <div
            className="absolute right-[10%] bottom-[35%] flex scale-90 items-center gap-2 rounded-full border border-white/5 bg-white/3 px-4 py-2 opacity-30 blur-[3px]"
            style={{ animation: "float-1 18s ease-in-out infinite reverse" }}
          >
            <Mail size={16} /> <span>Password Recovery</span>
          </div>

          <div
            className="absolute top-[35%] right-[20%] flex scale-90 items-center gap-2.5 rounded-full border border-white/10 bg-white/60 px-4 py-2.5 opacity-80 shadow-2xl shadow-black/50 backdrop-blur-sm"
            style={{ animation: "float-1 12s ease-in-out infinite" }}
          >
            <ShieldCheck size={18} className="text-violet-400" />{" "}
            <span className="text-sm font-semibold">Encrypted Tokens</span>
          </div>
          <div
            className="absolute bottom-[25%] left-[25%] flex scale-90 items-center gap-2.5 rounded-full border border-white/10 bg-white/6 px-4 py-2.5 opacity-70 shadow-2xl shadow-black/50 backdrop-blur-sm"
            style={{ animation: "float-3 14s ease-in-out infinite" }}
          >
            <KeyRound size={18} className="text-emerald-400" />{" "}
            <span className="text-sm font-semibold">1-Hour Time Limit</span>
          </div>
        </div>

        <div className="animate-fade-in-up relative z-20 mt-auto pt-32">
          <h2 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-white">
            Secure account recovery.
          </h2>
          <p className="text-base font-medium text-zinc-400">
            Regain access to your LinkFlow bio profile and analytics in minutes.
          </p>
        </div>
      </div>

      {/* Main Right Form Panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="animate-fade-in-up w-full max-w-100 delay-100">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
              <Sparkles size={16} className="text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">Linkforge</span>
          </div>

          {!isSubmitted ? (
            <>
              <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Reset your password
                </h1>
                <p className="text-sm font-medium text-zinc-400">
                  Enter your email address and we&apos;ll send you a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group/input space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-zinc-300 transition-colors group-focus-within/input:text-violet-400"
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
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-white/2 px-4 py-2 text-sm text-white shadow-sm transition-all placeholder:text-zinc-600 focus:bg-white/5 focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-50"
                  />
                </div>

                {error && (
                  <div className="animate-fade-in-up">
                    <p className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-[13px] font-medium text-red-400">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span className="leading-snug">{error}</span>
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
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

              <div className="mt-8 border-t border-white/5 pt-6 text-center">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  <ArrowLeft size={16} /> Back to sign in
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                <Mail size={28} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  Check your email
                </h1>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                  If an account exists for <strong className="text-white">{email}</strong>, we have sent instructions to reset your password.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/2 p-4 text-xs text-zinc-400 space-y-2">
                <p className="flex items-center gap-2 text-zinc-300 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Link expires in 1 hour
                </p>
                <p>
                  Be sure to check your spam or junk folder if you don&apos;t see the email within a few minutes.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  Try another email
                </button>

                <Link
                  href="/signin"
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98]"
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
