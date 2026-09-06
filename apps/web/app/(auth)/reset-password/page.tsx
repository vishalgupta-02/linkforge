"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { verifyResetPasswordToken, resetPassword } from "@/apis/auth-reset";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setIsVerifying(false);
        setIsValidToken(false);
        setVerifyError("No reset token provided. Please request a new password reset link.");
        return;
      }

      try {
        const res = await verifyResetPasswordToken(token);
        if (res.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setVerifyError(res.message || "This password reset link is invalid or has expired.");
        }
      } catch (err: any) {
        setIsValidToken(false);
        setVerifyError("Failed to verify reset token. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    }

    checkToken();
  }, [token]);

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  let strength = 0;
  if (password.length > 0) strength = 1;
  if (hasMinLength) strength = 2;
  if (hasMinLength && hasSymbol) strength = 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await resetPassword({
        token,
        password,
        confirmPassword,
      });

      setIsSuccess(true);
      toast.success("Password reset successfully! You can now log in.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setSubmitError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <Loader2 size={36} className="animate-spin text-violet-500" />
        <p className="text-sm font-medium text-zinc-400">
          Verifying security link...
        </p>
      </div>
    );
  }

  if (!isValidToken && !isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
          <ShieldAlert size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Link invalid or expired
          </h1>
          <p className="text-sm font-medium text-zinc-400 leading-relaxed">
            {verifyError || "This password reset link is invalid or has already expired. Password reset links are single-use and valid for 1 hour."}
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/forgot-password"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98]"
          >
            Request a new reset link
          </Link>

          <Link
            href="/signin"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-white/10 active:scale-[0.98]"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Password updated
          </h1>
          <p className="text-sm font-medium text-zinc-400 leading-relaxed">
            Your password has been reset successfully. All previous sessions have been logged out for security.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/signin"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98]"
          >
            Sign in with new password <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Create new password
        </h1>
        <p className="text-sm font-medium text-zinc-400">
          Choose a strong password with at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group/input space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-zinc-300 transition-colors group-focus-within/input:text-violet-400"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              required
              autoFocus
              className="flex h-11 w-full rounded-xl border border-white/10 bg-white/2 px-4 py-2 pr-10 text-sm text-white shadow-sm transition-all placeholder:text-zinc-600 focus:bg-white/5 focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength indicators */}
          <div
            className={`space-y-2 overflow-hidden transition-all duration-300 ${password ? "max-h-20 pt-1 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="flex h-1 w-full gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                    strength >= level
                      ? strength === 1
                        ? "bg-zinc-500"
                        : strength === 2
                          ? "bg-violet-400"
                          : "bg-emerald-500"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-4 text-[11px] font-medium">
              <span
                className={`flex items-center gap-1 transition-colors ${hasMinLength ? "text-emerald-400" : "text-zinc-500"}`}
              >
                {hasMinLength ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-zinc-600" />
                )}
                Min. 8 chars
              </span>
              <span
                className={`flex items-center gap-1 transition-colors ${hasSymbol ? "text-emerald-400" : "text-zinc-500"}`}
              >
                {hasSymbol ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-zinc-600" />
                )}
                1 symbol (!@#$)
              </span>
            </div>
          </div>
        </div>

        <div className="group/input space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-semibold text-zinc-300 transition-colors group-focus-within/input:text-violet-400"
          >
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              required
              className="flex h-11 w-full rounded-xl border border-white/10 bg-white/2 px-4 py-2 pr-10 text-sm text-white shadow-sm transition-all placeholder:text-zinc-600 focus:bg-white/5 focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-[11px] font-medium text-red-400">
              Passwords do not match
            </p>
          )}
        </div>

        {submitError && (
          <div className="animate-fade-in-up">
            <p className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-[13px] font-medium text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="leading-snug">{submitError}</span>
            </p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !hasMinLength || !passwordsMatch}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Resetting password...
              </span>
            ) : (
              "Save new password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
        </div>

        <div className="animate-fade-in-up relative z-20 mt-auto pt-32">
          <h2 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-white">
            Set your new credentials.
          </h2>
          <p className="text-base font-medium text-zinc-400">
            Keep your LinkFlow account and personal links protected.
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

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-violet-500" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
