"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Camera,
  PlayCircle,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function PremiumCreatorSignup() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasMinLength = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  if (password.length > 0) strength = 1;
  if (hasMinLength || hasSymbol) strength = 2;
  if (hasMinLength && hasSymbol) strength = 3;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 3 || !username) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleSignup = () => {
    toast.error("Google Sign-Up will be available soon.");
  };

  if (!mounted) return null;

  return (
    <>
      <div className="flex min-h-screen bg-[#0a0a0a] font-sans text-zinc-50 selection:bg-violet-500/30">
        <div className="relative hidden w-[45%] flex-col items-center justify-center overflow-hidden border-r border-white/5 bg-linear-to-b from-[#0a0a0a] to-[#111111] p-12 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(rgba(150,150,150,0.2) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="animate-fade-in-up relative z-10 flex w-full max-w-sm flex-col items-center">
            <div className="mb-12 space-y-3 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Create your page in seconds.
              </h2>
              <p className="text-sm font-medium text-zinc-400">
                Start with your name and links — we&apos;ll handle the rest.
              </p>
            </div>

            <div
              className="relative flex h-130 w-70 flex-col items-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              style={{ animation: "float-subtle 6s ease-in-out infinite" }}
            >
              <div className="build-step-1 mb-8 flex w-full justify-center">
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                  linkforge.bio/{username || "yourname"}
                </div>
              </div>

              <div className="build-step-2 mb-4 h-20 w-20 rounded-full border border-zinc-800 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-zinc-800 to-zinc-900">
                  <Camera size={20} className="text-zinc-600" />
                </div>
              </div>

              <div className="build-step-3 mb-8 flex w-full flex-col items-center space-y-2">
                <div className="h-4 w-32 rounded-full bg-white/10" />
                <div className="h-2 w-24 rounded-full bg-white/5" />
              </div>

              <div className="w-full space-y-3">
                <div className="build-step-4 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40">
                    <PlayCircle size={14} className="text-zinc-500" />
                  </div>
                  <div className="h-2 w-24 rounded-full bg-white/10" />
                </div>
                <div className="build-step-5 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40">
                    <Globe size={14} className="text-zinc-500" />
                  </div>
                  <div className="h-2 w-20 rounded-full bg-white/10" />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#0c0c0c] to-transparent" />
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center p-6 md:p-10">
          <div
            className="animate-fade-in-up w-full max-w-100"
            style={{ animationDelay: "100ms" }}
          >
            <div className="mb-10 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                <Sparkles size={16} className="text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Linkforge
              </span>
            </div>

            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Create your page
              </h1>
              <p className="text-sm font-medium text-zinc-400">
                Start sharing everything in one place.
              </p>
            </div>

            <button
              onClick={handleGoogleSignup}
              type="button"
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-white/10 active:scale-[0.98]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g fill="none" fillRule="evenodd">
                  <path
                    d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </g>
              </svg>
              Continue with Google
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[12px] font-medium">
                <span className="bg-[#0a0a0a] px-4 text-zinc-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="group/input space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-semibold text-zinc-300 transition-colors group-focus-within/input:text-violet-400"
                >
                  Username
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-4 text-sm font-medium text-zinc-500">
                    linkforge.bio/
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    placeholder="yourname"
                    autoFocus
                    disabled={isLoading}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-white/2 py-2 pr-4 pl-26.5 text-sm text-white shadow-sm transition-all placeholder:text-zinc-600 focus:bg-white/5 focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-50"
                  />
                </div>
                <p className="text-[11px] font-medium text-zinc-500">
                  Pick a name your audience will remember.
                </p>
              </div>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-white/2 px-4 py-2 text-sm text-white shadow-sm transition-all placeholder:text-zinc-600 focus:bg-white/5 focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-50"
                />
              </div>

              <div className="group/input space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-zinc-300 transition-colors group-focus-within/input:text-violet-400"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (password.length > 0 && strength < 3)}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create my page"
                  )}
                </button>
                <p className="mt-3 text-center text-[12px] font-medium text-zinc-500">
                  You can customize everything later.
                </p>
              </div>
            </form>

            <div className="mt-8 border-t border-white/5 pt-6">
              <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500">
                <span>Free to start</span>
                <span>•</span>
                <span>No credit card</span>
                <span>•</span>
                <span>Takes 30 seconds</span>
              </div>
              <p className="text-center text-sm font-medium text-zinc-400">
                Already have an account?{" "}
                <a
                  href="/signin"
                  className="font-semibold text-white transition-colors hover:text-violet-400"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
