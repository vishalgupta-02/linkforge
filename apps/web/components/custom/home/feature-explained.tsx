"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Activity,
  GripVertical,
  Palette,
  Globe2,
  QrCode,
  ShieldCheck,
  Share2,
  ArrowRight,
} from "lucide-react";
import { GlowCard } from "@/components/animations";

const FeatureExplained = () => {
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);

  const themes = [
    {
      name: "Obsidian",
      bg: "bg-[#09090b]",
      card: "bg-zinc-900 border-white/10 text-white",
      accent: "from-violet-500 to-indigo-500",
    },
    {
      name: "Tokyo Neon",
      bg: "bg-[#0b0c10]",
      card: "bg-zinc-900 border-cyan-500/30 text-white",
      accent: "from-cyan-400 to-fuchsia-500",
    },
    {
      name: "Alabaster",
      bg: "bg-zinc-100",
      card: "bg-white border-zinc-200 text-zinc-900",
      accent: "from-zinc-900 to-zinc-700",
    },
    {
      name: "Sunset",
      bg: "bg-gradient-to-b from-orange-950/40 to-zinc-950",
      card: "bg-zinc-900 border-orange-500/20 text-white",
      accent: "from-amber-500 to-rose-500",
    },
  ];

  return (
    <section
      id="features"
      className="bg-background border-t border-zinc-200 py-24 dark:border-white/5"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Heading */}
        <div className="mb-16 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300">
            <Sparkles size={13} className="text-violet-500" />
            Platform Capabilities
          </div>
          <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-5xl">
            Everything you need in a modern link hub.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base sm:text-lg">
            Built with ultra-fast edge routing, live telemetry, and deep brand
            customization.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-12">
          {/* Bento 1: Real-time Presence (Span 8) */}
          <div className="md:col-span-3 lg:col-span-8">
            <GlowCard className="border-border bg-card/90 h-full p-7 sm:p-8">
              <div className="flex h-full flex-col justify-between space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Activity size={14} className="animate-pulse" />
                    Live Visitor Telemetry
                  </div>
                  <h3 className="text-foreground text-2xl font-bold tracking-tight">
                    Real-time Presence & Audience Pulse
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                    Know the instant your stream goes live or a post goes viral.
                    Watch real-time active viewers on your bio page with
                    sub-second precision.
                  </p>
                </div>

                <div className="border-border bg-background/80 rounded-2xl border p-5 shadow-inner">
                  <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                      </div>
                      <span className="text-foreground text-sm font-bold">
                        42 Live Viewers Right Now
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                      SSE Streaming Active
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="border-border/60 bg-card/60 rounded-xl border p-2.5">
                      <span className="text-muted-foreground text-[11px]">
                        Top City
                      </span>
                      <p className="text-foreground mt-0.5 text-xs font-bold">
                        San Francisco
                      </p>
                    </div>
                    <div className="border-border/60 bg-card/60 rounded-xl border p-2.5">
                      <span className="text-muted-foreground text-[11px]">
                        Avg. Click
                      </span>
                      <p className="text-foreground mt-0.5 text-xs font-bold">
                        2.4s
                      </p>
                    </div>
                    <div className="border-border/60 bg-card/60 rounded-xl border p-2.5">
                      <span className="text-muted-foreground text-[11px]">
                        Conversion
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-emerald-500">
                        68.2%
                      </p>
                    </div>
                    <div className="border-border/60 bg-card/60 rounded-xl border p-2.5">
                      <span className="text-muted-foreground text-[11px]">
                        Top Source
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-violet-500">
                        Twitter / X
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Bento 2: Sub-10ms Routing (Span 4) */}
          <div className="md:col-span-3 lg:col-span-4">
            <GlowCard className="border-border bg-card/90 h-full p-7 sm:p-8">
              <div className="flex h-full flex-col justify-between space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                    <Zap size={14} />
                    Edge Performance
                  </div>
                  <h3 className="text-foreground text-2xl font-bold tracking-tight">
                    Sub-10ms Redirects
                  </h3>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    Zero interstitial ads or redirect lag. Links resolve
                    globally at edge speed.
                  </p>
                </div>

                <div className="border-border bg-background/80 space-y-2.5 rounded-2xl border p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      DNS Resolution
                    </span>
                    <span className="font-mono font-bold text-emerald-500">
                      2ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Edge Cache Hit
                    </span>
                    <span className="font-mono font-bold text-emerald-500">
                      4ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">TLS Handshake</span>
                    <span className="font-mono font-bold text-emerald-500">
                      3ms
                    </span>
                  </div>
                  <div className="border-border flex items-center justify-between border-t pt-2 text-xs font-bold">
                    <span className="text-foreground">Total Redirect</span>
                    <span className="font-mono text-emerald-500">9ms</span>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Bento 3: Theme Studio (Span 6) */}
          <div className="md:col-span-3 lg:col-span-6">
            <GlowCard className="border-border bg-card/90 h-full p-7 sm:p-8">
              <div className="flex h-full flex-col justify-between space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Palette size={14} />
                    Theme Studio
                  </div>
                  <h3 className="text-foreground text-2xl font-bold tracking-tight">
                    Designer Visual Themes
                  </h3>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    Match your brand aesthetic with hand-crafted themes and
                    customizable button styling.
                  </p>
                </div>

                {/* Interactive Theme Switcher */}
                <div className="border-border bg-background/60 rounded-2xl border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Live Theme Switcher
                    </span>
                    <span className="text-primary text-xs font-bold">
                      {themes[activeThemeIndex].name}
                    </span>
                  </div>

                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {themes.map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveThemeIndex(idx)}
                        className={`h-8 cursor-pointer rounded-lg border text-xs font-bold transition-all ${
                          activeThemeIndex === idx
                            ? "border-primary ring-primary/20 scale-105 ring-2"
                            : "border-border opacity-70 hover:opacity-100"
                        } ${t.bg}`}
                      >
                        <div
                          className={`flex h-full w-full items-center justify-center rounded-md bg-gradient-to-r ${t.accent} bg-clip-text text-transparent`}
                        >
                          {idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div
                    className={`rounded-xl p-3.5 transition-all duration-300 ${themes[activeThemeIndex].bg}`}
                  >
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-500/50 bg-violet-500/30 text-[10px] font-bold text-white">
                        LF
                      </div>
                      <div>
                        <div className="h-2.5 w-16 rounded-full bg-current opacity-70" />
                        <div className="mt-1 h-1.5 w-10 rounded-full bg-current opacity-40" />
                      </div>
                    </div>
                    <div
                      className={`rounded-lg border p-2 text-center text-xs font-semibold shadow-xs ${themes[activeThemeIndex].card}`}
                    >
                      View My Latest Projects & Merch
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Bento 4: Drag & Drop Bio Builder (Span 6) */}
          <div className="md:col-span-3 lg:col-span-6">
            <GlowCard className="border-border bg-card/90 h-full p-7 sm:p-8">
              <div className="flex h-full flex-col justify-between space-y-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <GripVertical size={14} />
                    Instant Workspace
                  </div>
                  <h3 className="text-foreground text-2xl font-bold tracking-tight">
                    Drag-and-Drop Bio Builder
                  </h3>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    Reorder links instantly, toggle visibility with a single
                    switch, and manage your entire profile with zero friction.
                  </p>
                </div>

                <div className="border-border bg-background/80 space-y-2 rounded-2xl border p-3.5">
                  {[
                    {
                      title: "Weekly Newsletter (Issue #52)",
                      clicks: "1,420 clicks",
                      active: true,
                    },
                    {
                      title: "My YouTube Channel",
                      clicks: "3,890 clicks",
                      active: true,
                    },
                    {
                      title: "1-on-1 Consultation Call",
                      clicks: "340 clicks",
                      active: false,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`border-border bg-card flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                        !item.active ? "opacity-40 grayscale" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical
                          size={13}
                          className="text-muted-foreground"
                        />
                        <div>
                          <p className="text-foreground font-bold">
                            {item.title}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            {item.clicks}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`h-2 w-2 rounded-full ${item.active ? "bg-emerald-500" : "bg-zinc-400"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Bento 5: Custom Domains (Span 4) */}
          <div className="md:col-span-3 lg:col-span-4">
            <GlowCard className="border-border bg-card/90 h-full p-6 sm:p-7">
              <div className="flex h-full flex-col justify-between space-y-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400">
                    <Globe2 size={13} />
                    Custom Domains
                  </div>
                  <h3 className="text-foreground text-lg font-bold tracking-tight">
                    Your Brand Domain
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Attach{" "}
                    <code className="text-foreground font-mono">
                      links.yourbrand.com
                    </code>{" "}
                    with auto-provisioned SSL.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <ShieldCheck
                    size={18}
                    className="shrink-0 text-emerald-500"
                  />
                  <div className="text-[11px]">
                    <p className="text-foreground font-bold">
                      Auto Wildcard SSL
                    </p>
                    <p className="text-muted-foreground">TLS 1.3 Certified</p>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Bento 6: Vector QR (Span 4) */}
          <div className="md:col-span-3 lg:col-span-4">
            <GlowCard className="border-border bg-card/90 h-full p-6 sm:p-7">
              <div className="flex h-full flex-col justify-between space-y-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <QrCode size={13} />
                    Vector QR Codes
                  </div>
                  <h3 className="text-foreground text-lg font-bold tracking-tight">
                    Print-Ready QR Codes
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Instant high-res QR codes for packaging, stickers, slides,
                    and cards.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="border-border bg-foreground rounded-lg border p-2 shadow-sm">
                    <QrCode size={36} className="text-background" />
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Bento 7: 20+ Platforms (Span 4) */}
          <div className="md:col-span-3 lg:col-span-4">
            <GlowCard className="border-border bg-card/90 h-full p-6 sm:p-7">
              <div className="flex h-full flex-col justify-between space-y-4">
                <div>
                  <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                    <Share2 size={13} />
                    Social Matrix
                  </div>
                  <h3 className="text-foreground text-lg font-bold tracking-tight">
                    20+ Auto Integrations
                  </h3>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Automatic brand icon detection for all major creator
                    platforms.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {[
                    "YouTube",
                    "X",
                    "TikTok",
                    "Discord",
                    "GitHub",
                    "Spotify",
                  ].map((p, i) => (
                    <span
                      key={i}
                      className="border-border bg-muted/60 text-foreground rounded-md border px-2 py-0.5 text-[10px] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </GlowCard>
          </div>
        </div>

        {/* Link to Full Features Page */}
        <div className="mt-14 text-center">
          <Link
            href="/features"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <span>Explore All Features & Deep Technical Specs</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeatureExplained;
