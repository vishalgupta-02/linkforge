"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  PlayCircle,
  Camera,
  Globe,
  ShoppingBag,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInFormSchema } from "@/schemas/login-schema";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { userLogin } from "@/apis/user-login";
import { googleSignIn } from "@/apis/google-signin";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

type SignInFormData = z.infer<typeof signInFormSchema>;

export default function FloatingIdentityLogin() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signInFormSchema),
  });

  const handleLogin = async (formData: SignInFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await userLogin(formData.email, formData.password);

      if (!result) {
        toast.error(
          "Login failed. Please check your credentials and try again.",
        );
      }
      console.log("Login successful:", result);
      toast.success("Login successful");

      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError("That didn't match. Try again or reset your password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();

      if (!result) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }

      console.log("Google sign-in successful:", result);
      toast.success("Google sign-in successful");
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.");
      console.error("Google sign-in error:", error);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="relative flex min-h-screen bg-zinc-50 font-sans text-zinc-950 selection:bg-violet-500/30 dark:bg-[#0a0a0a] dark:text-zinc-50">
        {/* Floating Theme Toggle */}
        <div className="absolute top-5 right-5 z-50">
          <AnimatedThemeToggler className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-white/80 text-zinc-600 shadow-sm backdrop-blur-md transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-[#111]/80 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white" />
        </div>

        {/* Left Visual Identity Panel */}
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
              <MessageCircle size={16} /> <span>Twitter Updates</span>
            </div>
            <div
              className="absolute right-[10%] bottom-[35%] flex scale-90 items-center gap-2 rounded-full border border-zinc-200/80 bg-white/60 px-4 py-2 text-zinc-700 opacity-50 blur-[1px] dark:border-white/5 dark:bg-white/3 dark:text-zinc-300 dark:opacity-30 dark:blur-[3px]"
              style={{ animation: "float-1 18s ease-in-out infinite reverse" }}
            >
              <Mail size={16} /> <span>Weekly Newsletter</span>
            </div>

            <div
              className="absolute top-[40%] right-[20%] flex scale-90 items-center gap-2.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2.5 text-zinc-800 opacity-90 shadow-lg shadow-zinc-300/40 backdrop-blur-md dark:border-white/10 dark:bg-white/60 dark:text-white dark:opacity-80 dark:shadow-2xl dark:shadow-black/50 dark:backdrop-blur-sm"
              style={{ animation: "float-1 12s ease-in-out infinite" }}
            >
              <Globe size={18} className="text-blue-500 dark:text-blue-400" />{" "}
              <span className="text-sm font-semibold">Design Portfolio</span>
            </div>
            <div
              className="absolute bottom-[25%] left-[25%] flex scale-90 items-center gap-2.5 rounded-full border border-zinc-200 bg-white/80 px-4 py-2.5 text-zinc-800 opacity-90 shadow-lg shadow-zinc-300/40 backdrop-blur-md dark:border-white/10 dark:bg-white/6 dark:text-white dark:opacity-70 dark:shadow-2xl dark:shadow-black/50 dark:backdrop-blur-sm"
              style={{ animation: "float-3 14s ease-in-out infinite" }}
            >
              <ShoppingBag size={18} className="text-fuchsia-500 dark:text-fuchsia-400" />{" "}
              <span className="text-sm font-semibold">Merch Store</span>
            </div>

            <div
              className="absolute top-[30%] left-[30%] flex items-center gap-3 rounded-full border border-zinc-200/90 bg-white/90 px-5 py-3 text-zinc-900 shadow-xl shadow-zinc-300/50 backdrop-blur-md dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-2xl dark:shadow-black/60"
              style={{ animation: "float-2 10s ease-in-out infinite" }}
            >
              <div className="rounded-full bg-red-500/15 p-1.5 dark:bg-red-500/20">
                <PlayCircle size={18} className="text-red-500" />
              </div>
              <span className="text-sm font-bold">Latest Vlog</span>
            </div>
            <div
              className="absolute right-[15%] bottom-[35%] flex items-center gap-3 rounded-full border border-zinc-200/90 bg-white/90 px-5 py-3 text-zinc-900 shadow-xl shadow-zinc-300/50 backdrop-blur-md dark:border-white/20 dark:bg-white/10 dark:text-white dark:shadow-2xl dark:shadow-black/60"
              style={{ animation: "float-1 11s ease-in-out infinite reverse" }}
            >
              <div className="rounded-full bg-pink-500/15 p-1.5 dark:bg-pink-500/20">
                <Camera size={18} className="text-pink-500" />
              </div>
              <span className="text-sm font-bold">Instagram</span>
            </div>
          </div>

          <div className="animate-fade-in-up relative z-20 mt-auto pt-32">
            <h2 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Everything you share,
              <br />
              in one place.
            </h2>
            <p className="text-base font-medium text-zinc-500 dark:text-zinc-400">
              Your links. Your audience. Your space.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
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

            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Welcome back
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Access your link hub and connect with your audience.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-800 shadow-xs transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-500">
              <span>No spam</span>
              <span>•</span>
              <span>Secure login</span>
              <span>•</span>
              <span>1M+ creators</span>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-[12px] font-medium">
                <span className="bg-zinc-50 px-4 text-zinc-500 dark:bg-[#0a0a0a] dark:text-zinc-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
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
                  {...register("email")}
                  autoFocus
                  disabled={isLoading}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 shadow-xs transition-all placeholder:text-zinc-400 focus:bg-white focus-visible:border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:outline-none disabled:opacity-50 dark:border-white/10 dark:bg-white/2 dark:text-white dark:placeholder:text-zinc-600 dark:focus:bg-white/5 dark:focus-visible:border-violet-500 dark:focus-visible:ring-violet-500"
                />
                {errors.email && (
                  <p className="text-[11px] font-medium text-red-500 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="group/input space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-zinc-700 transition-colors group-focus-within/input:text-violet-600 dark:text-zinc-300 dark:group-focus-within/input:text-violet-400"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...register("password")}
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 pr-10 text-sm text-zinc-900 shadow-xs transition-all placeholder:text-zinc-400 focus:bg-white focus-visible:border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:outline-none disabled:opacity-50 dark:border-white/10 dark:bg-white/2 dark:text-white dark:placeholder:text-zinc-600 dark:focus:bg-white/5 dark:focus-visible:border-violet-500 dark:focus-visible:ring-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-medium text-red-500 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
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
                      Authenticating...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
                <p className="mt-3 text-center text-[12px] font-medium text-zinc-500 dark:text-zinc-500">
                  Takes less than 30 seconds
                </p>
              </div>
            </form>

            <div className="mt-8 border-t border-zinc-200 pt-6 text-center dark:border-white/5">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-zinc-900 transition-colors hover:text-violet-600 dark:text-white dark:hover:text-violet-400"
                >
                  Create your page
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
