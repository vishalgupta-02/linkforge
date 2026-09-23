"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Sparkles,
  Bell,
  Activity,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Apple,
  Layers,
  Copy,
  Check,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function MobileWaitlistPage() {
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<"ios" | "android" | "all">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{
    waitlistNumber: number;
    totalSubscribers: number;
    email: string;
    alreadyRegistered?: boolean;
  } | null>(null);

  const [subscriberCount, setSubscriberCount] = useState<number>(1420);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/waitlist/mobile/stats`,
          { timeout: 4000 },
        );
        if (res.data?.success && res.data.totalSubscribers) {
          setSubscriberCount(res.data.totalSubscribers);
        }
      } catch {
        // Fallback to local default
      }
    }
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/waitlist/mobile`,
        { email, platform },
        { timeout: 8000 },
      );

      if (res.data?.success) {
        setSuccessData({
          waitlistNumber: res.data.waitlistNumber,
          totalSubscribers: res.data.totalSubscribers || subscriberCount + 1,
          email: res.data.email || email,
          alreadyRegistered: res.data.alreadyRegistered,
        });
        setSubscriberCount((prev) =>
          Math.max(prev, res.data.totalSubscribers || prev + 1),
        );
      } else {
        setErrorMsg(res.data?.message || "Failed to join waitlist. Please try again.");
      }
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Unable to join waitlist. Please verify your connection and try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText("https://linkforge.com/mobile");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-background text-foreground relative min-h-screen overflow-hidden selection:bg-neutral-800 selection:text-neutral-100">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-[140px]" />
        <div className="bg-primary/5 absolute top-1/2 -left-40 h-[400px] w-[500px] rounded-full blur-[160px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:px-10 lg:px-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <span className="text-xs">←</span> Back to LinkForge
          </Link>

          <div className="border-border bg-card/60 flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
            <span className="text-muted-foreground">Beta Access</span>
            <span className="text-foreground">Phase 1 In Progress</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="border-primary/20 bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={13} />
            <span>Native iOS & Android Apps</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Your Creator Command Center,{" "}
            <span className="text-foreground underline decoration-primary/40 underline-offset-8">
              In Your Pocket
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
            Manage your links, monitor live visitor spikes in real-time, and get
            instant push alerts when your traffic surges — built natively for
            iOS and Android.
          </p>

          {/* Social Proof Counter */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card/50 px-5 py-2 text-sm font-medium backdrop-blur-md">
            <div className="flex -space-x-2">
              <div className="inline-block h-6 w-6 rounded-full border-2 border-background bg-neutral-800 text-[10px] font-bold leading-5 text-white text-center">
                LF
              </div>
              <div className="inline-block h-6 w-6 rounded-full border-2 border-background bg-neutral-700 text-[10px] font-bold leading-5 text-white text-center">
                IO
              </div>
              <div className="inline-block h-6 w-6 rounded-full border-2 border-background bg-neutral-600 text-[10px] font-bold leading-5 text-white text-center">
                AP
              </div>
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm">
              Join{" "}
              <strong className="text-foreground font-bold">
                {subscriberCount.toLocaleString()}
              </strong>{" "}
              creators on the early access queue
            </span>
          </div>
        </div>

        {/* Form or Success Box */}
        <div className="mx-auto mt-12 max-w-xl">
          {!successData ? (
            <div className="border-border bg-card/70 relative rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-foreground mb-2 block text-xs font-bold tracking-wider uppercase">
                    Select Your Preferred Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPlatform("ios")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                        platform === "ios"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Apple size={18} />
                      <span>iOS (TestFlight)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlatform("android")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                        platform === "android"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Smartphone size={18} />
                      <span>Android (Play Beta)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlatform("all")}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                        platform === "all"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "border-border hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Layers size={18} />
                      <span>Both Platforms</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-foreground mb-2 block text-xs font-bold tracking-wider uppercase">
                    Your Creator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creator@yourdomain.com"
                      className="border-border bg-background/80 focus:border-primary focus:ring-primary/20 h-13 w-full rounded-xl border px-4 text-sm font-medium transition-all outline-none focus:ring-4"
                    />
                  </div>
                  {errorMsg && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errorMsg}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Securing Your Spot...</span>
                    </div>
                  ) : (
                    <>
                      <span>Get Early Access & App Invite</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="text-muted-foreground flex items-center justify-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={13} className="text-primary" />
                    No spam ever
                  </span>
                  <span>•</span>
                  <span>Instant email confirmation</span>
                  <span>•</span>
                  <span>Free early access perks</span>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-border bg-card/80 relative overflow-hidden rounded-2xl border p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="bg-primary/10 border-primary/20 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border">
                <CheckCircle2 size={28} className="text-primary" />
              </div>

              <span className="border-primary/20 bg-primary/10 text-primary mb-2 inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {successData.alreadyRegistered
                  ? "Already Registered"
                  : "Spot Secured"}
              </span>

              <h2 className="text-foreground text-2xl font-bold tracking-tight">
                You're #{successData.waitlistNumber} on the waitlist!
              </h2>

              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                We've queued your early access invite for{" "}
                <strong className="text-foreground">{successData.email}</strong>.
                A confirmation has been sent to your inbox.
              </p>

              <div className="border-border bg-background/50 my-6 rounded-xl border p-4 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Queue Position:</span>
                  <span className="text-foreground font-mono font-bold">
                    #{successData.waitlistNumber} of{" "}
                    {successData.totalSubscribers}
                  </span>
                </div>
                <div className="bg-muted mt-2.5 h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(15, Math.min(95, 100 - (successData.waitlistNumber / successData.totalSubscribers) * 50))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  Share with fellow creators to move up the access priority list:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyShare}
                    className="border-border bg-muted/50 hover:bg-muted text-foreground flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Invite Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `I just joined the early access waitlist for the @LinkForge native mobile app! Join here: https://linkforge.com/mobile`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border bg-muted/50 hover:bg-muted text-foreground flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-medium transition-all"
                  >
                    <Share2 size={14} />
                    <span>Post on X</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Can't Wait? PWA Guide Banner */}
        <div className="border-border bg-card/40 mx-auto mt-20 max-w-4xl rounded-2xl border p-8 backdrop-blur-md">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <div className="text-primary mb-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <Zap size={14} />
                <span>Available Right Now</span>
              </div>
              <h3 className="text-foreground text-xl font-bold tracking-tight">
                Can't wait for TestFlight? Install LinkForge PWA today
              </h3>
              <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                LinkForge is fully optimized as a Progressive Web App. Install
                it directly to your home screen with zero app store delays.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="border-border bg-background/60 rounded-xl border p-4 text-xs">
                <span className="text-foreground font-bold">iOS Safari</span>
                <p className="text-muted-foreground mt-1">
                  Tap <span className="font-semibold text-foreground">Share</span> →{" "}
                  <span className="font-semibold text-foreground">Add to Home Screen</span>
                </p>
              </div>

              <div className="border-border bg-background/60 rounded-xl border p-4 text-xs">
                <span className="text-foreground font-bold">Android Chrome</span>
                <p className="text-muted-foreground mt-1">
                  Tap <span className="font-semibold text-foreground">⋮ Menu</span> →{" "}
                  <span className="font-semibold text-foreground">Install LinkForge</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Native Features Grid */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Engineered Exclusively for Mobile
            </h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              Everything you love about LinkForge edge performance, enhanced
              with native mobile APIs.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border bg-card/50 rounded-xl border p-6 backdrop-blur-xs">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <Bell size={20} />
              </div>
              <h3 className="text-foreground text-base font-semibold">
                Instant Push Alerts
              </h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Receive notification pulses when your links hit 1k, 10k, or
                100k clicks, or when someone engages from a new country.
              </p>
            </div>

            <div className="border-border bg-card/50 rounded-xl border p-6 backdrop-blur-xs">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <Activity size={20} />
              </div>
              <h3 className="text-foreground text-base font-semibold">
                Lock Screen Widget
              </h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Monitor live concurrent visitors in real-time via iOS Live
                Activities and Android glanceable widgets.
              </p>
            </div>

            <div className="border-border bg-card/50 rounded-xl border p-6 backdrop-blur-xs">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <Zap size={20} />
              </div>
              <h3 className="text-foreground text-base font-semibold">
                Haptic Link Reordering
              </h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Drag, drop, and rearrange your links on the fly before a big
                live stream with tactile haptic feedback.
              </p>
            </div>

            <div className="border-border bg-card/50 rounded-xl border p-6 backdrop-blur-xs">
              <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                <Smartphone size={20} />
              </div>
              <h3 className="text-foreground text-base font-semibold">
                Deep Linking Routing
              </h3>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                Open YouTube, Spotify, and Instagram links natively without
                trapping users inside clunky in-app web views.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
