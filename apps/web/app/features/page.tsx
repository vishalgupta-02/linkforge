"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Sparkles,
  Zap,
  BarChart3,
  Globe2,
  Palette,
  ShieldCheck,
  QrCode,
  MousePointerClick,
  GripVertical,
  Activity,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  ExternalLink,
  Share2,
  Smartphone,
  Sliders,
  TrendingUp,
  Cpu,
  Lock,
} from "lucide-react";
import {
  FadeIn,
  FadeInStagger,
  FadeInStaggerItem,
  GlowCard,
  RevealText,
  PageTransition,
} from "@/components/animations";

export default function FeaturesPage() {
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);

  const themes = [
    {
      name: "Obsidian Dark",
      bg: "bg-[#09090b]",
      card: "bg-zinc-900/90 border-white/10 text-white",
      accent: "from-violet-500 to-indigo-500",
    },
    {
      name: "Tokyo Neon",
      bg: "bg-[#0b0c10]",
      card: "bg-zinc-900/90 border-cyan-500/30 text-white",
      accent: "from-cyan-400 to-fuchsia-500",
    },
    {
      name: "Alabaster Clean",
      bg: "bg-zinc-100",
      card: "bg-white border-zinc-200 text-zinc-900",
      accent: "from-zinc-900 to-zinc-700",
    },
    {
      name: "Sunset Horizon",
      bg: "bg-gradient-to-b from-orange-950/40 to-zinc-950",
      card: "bg-zinc-900/80 border-orange-500/20 text-white",
      accent: "from-amber-500 to-rose-500",
    },
  ];

  return (
    <PageTransition className="bg-background text-foreground relative min-h-screen transition-colors duration-300">
      {/* Subtle background grid & glowing ambient light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(150,150,150,0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px] dark:bg-violet-500/15" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        {/* Header / Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn direction="up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300">
              Engineered for Modern Creators & Developers
            </div>
          </FadeIn>

          <RevealText
            text="Everything you need in a modern link hub."
            className="justify-center text-4xl font-extrabold tracking-tight sm:text-6xl"
          />

          <FadeIn delay={0.1} direction="up" className="mt-6">
            <p className="text-muted-foreground text-lg leading-relaxed">
              LinkForge combines lightning-fast routing, live audience
              telemetry, deep custom branding, and developer-grade reliability
              into one cohesive platform.
            </p>
          </FadeIn>

          {/* Quick CTA */}
          <FadeIn
            delay={0.2}
            direction="up"
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground shadow-primary/20 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Get Started for Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/pricing"
              className="border-border bg-card/60 text-foreground hover:bg-accent inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-7 text-sm font-semibold backdrop-blur-md transition-all active:scale-[0.98]"
            >
              Explore Plans
            </Link>
          </FadeIn>
        </div>

        {/* Feature Highlights Bento Grid */}
        <div className="mt-24 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Engineered from the ground up for peak performance
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Explore the capabilities that set LinkForge apart from outdated
              link-in-bio tools.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-12">
            {/* Bento 1: Real-time Presence & Audience Telemetry (Col span 8) */}
            <div className="md:col-span-3 lg:col-span-8">
              <GlowCard className="border-border bg-card/90 h-full p-8">
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Activity size={14} className="animate-pulse" />
                      Live Visitor Telemetry
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Real-time Presence & Interactive Pulse
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                      Watch your audience connect in real-time. LinkForge
                      features live active visitor counters on your public
                      profiles and dashboard, giving you heartbeat-level
                      awareness of viral spikes and stream drops.
                    </p>
                  </div>

                  {/* Visual Simulation Card */}
                  <div className="border-border bg-background/80 relative overflow-hidden rounded-2xl border p-6 shadow-inner">
                    <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-3.5 w-3.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-foreground text-sm font-bold">
                          42 Active Viewers Right Now
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs font-medium">
                        Updated &lt;1s ago via SSE
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="border-border/60 bg-card/60 rounded-xl border p-3">
                        <span className="text-muted-foreground text-xs">
                          Top City
                        </span>
                        <p className="text-foreground mt-0.5 text-sm font-bold">
                          San Francisco
                        </p>
                      </div>
                      <div className="border-border/60 bg-card/60 rounded-xl border p-3">
                        <span className="text-muted-foreground text-xs">
                          Avg. Click Time
                        </span>
                        <p className="text-foreground mt-0.5 text-sm font-bold">
                          2.4s
                        </p>
                      </div>
                      <div className="border-border/60 bg-card/60 rounded-xl border p-3">
                        <span className="text-muted-foreground text-xs">
                          Conversion
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-emerald-500">
                          68.2%
                        </p>
                      </div>
                      <div className="border-border/60 bg-card/60 rounded-xl border p-3">
                        <span className="text-muted-foreground text-xs">
                          Top Referrer
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-violet-500">
                          Twitter / X
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Bento 2: Sub-millisecond Redirect Engine (Col span 4) */}
            <div className="md:col-span-3 lg:col-span-4">
              <GlowCard className="border-border bg-card/90 h-full p-8">
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                      <Zap size={14} />
                      Zero-Latency Engine
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Sub-10ms Routing
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      Every link click is routed through globally distributed
                      edge nodes. No spinning loaders, no bloated interstitial
                      ad redirects.
                    </p>
                  </div>

                  <div className="border-border bg-background/80 space-y-3 rounded-2xl border p-5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        DNS Resolution
                      </span>
                      <span className="font-mono font-bold text-emerald-500">
                        2ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        Edge Cache Hit
                      </span>
                      <span className="font-mono font-bold text-emerald-500">
                        4ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        TLS Handshake
                      </span>
                      <span className="font-mono font-bold text-emerald-500">
                        3ms
                      </span>
                    </div>
                    <div className="border-border flex items-center justify-between border-t pt-2 text-xs font-bold">
                      <span className="text-foreground">
                        Total Redirect Time
                      </span>
                      <span className="font-mono text-emerald-500">9ms</span>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Bento 3: Theme Studio & Live Brand Customization (Col span 6) */}
            <div className="md:col-span-3 lg:col-span-6">
              <GlowCard className="border-border bg-card/90 h-full p-8">
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Palette size={14} />
                      Theme Studio
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Bespoke Designer Themes
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      Stand out with handcrafted aesthetics. Choose from
                      high-contrast brutalist palettes, sleek dark modes,
                      glassmorphism cards, and custom typography pairings.
                    </p>
                  </div>

                  {/* Interactive theme switcher preview */}
                  <div className="border-border bg-background/60 rounded-2xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-semibold">
                        Live Theme Selector
                      </span>
                      <span className="text-primary text-xs font-bold">
                        {themes[activeThemeIndex].name}
                      </span>
                    </div>

                    <div className="mb-4 grid grid-cols-4 gap-2">
                      {themes.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveThemeIndex(idx)}
                          className={`h-9 cursor-pointer rounded-lg border text-xs font-bold transition-all ${
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
                      className={`rounded-xl p-4 transition-all duration-300 ${themes[activeThemeIndex].bg}`}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-500/50 bg-violet-500/30 text-xs font-bold text-white">
                          LF
                        </div>
                        <div>
                          <div className="h-3 w-20 rounded-full bg-current opacity-70" />
                          <div className="mt-1 h-2 w-12 rounded-full bg-current opacity-40" />
                        </div>
                      </div>
                      <div
                        className={`rounded-lg border p-2.5 text-center text-xs font-semibold shadow-xs transition-all ${themes[activeThemeIndex].card}`}
                      >
                        Launching My New Course
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Bento 4: Drag & Drop Frictionless Link Manager (Col span 6) */}
            <div className="md:col-span-3 lg:col-span-6">
              <GlowCard className="border-border bg-card/90 h-full p-8">
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <GripVertical size={14} />
                      Intuitive Workspace
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Drag-and-Drop Bio Builder
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      Reorder links seamlessly, toggle instant visibility, and
                      archive temporary promotion campaigns with a single click.
                      Zero page reloads.
                    </p>
                  </div>

                  <div className="border-border bg-background/80 space-y-2.5 rounded-2xl border p-4">
                    {[
                      {
                        title: "Weekly Newsletter (Issue #48)",
                        clicks: "1,240 clicks",
                        active: true,
                      },
                      {
                        title: "GitHub Open Source Projects",
                        clicks: "890 clicks",
                        active: true,
                      },
                      {
                        title: "Book a 1:1 Mentorship Session",
                        clicks: "450 clicks",
                        active: false,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`border-border bg-card flex items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                          !item.active ? "opacity-40 grayscale" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GripVertical
                            size={14}
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
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${item.active ? "bg-emerald-500" : "bg-zinc-400"}`}
                          />
                          <span className="text-muted-foreground text-[11px] font-medium">
                            {item.active ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Bento 5: Custom Domains & Automatic SSL (Col span 4) */}
            <div className="md:col-span-3 lg:col-span-4">
              <GlowCard className="border-border bg-card/90 h-full p-8">
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400">
                      <Globe2 size={14} />
                      White-label Domains
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Your Domain. Your Brand.
                    </h3>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      Connect{" "}
                      <code className="text-foreground font-mono text-[11px]">
                        links.yourbrand.com
                      </code>{" "}
                      in seconds. Automatic Let&apos;s Encrypt wildcard SSL
                      certification.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <ShieldCheck
                      size={20}
                      className="shrink-0 text-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="text-foreground font-bold">
                        Auto-Provisioned SSL
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        A+ Grade TLS 1.3 Security
                      </p>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Bento 6: Smart Vector QR Codes (Col span 4) */}
            <div className="md:col-span-3 lg:col-span-4">
              <GlowCard className="border-border bg-card/90 h-full p-8">
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <QrCode size={14} />
                      Vector QR Engine
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Instant Print QR Codes
                    </h3>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      Generate crisp vector QR codes for business cards,
                      conference slides, packaging, and event badges with one
                      click.
                    </p>
                  </div>

                  <div className="flex items-center justify-center p-2">
                    <div className="border-border bg-foreground rounded-xl border p-3 shadow-md">
                      <QrCode size={48} className="text-background" />
                    </div>
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Bento 7: Social Matrix (20+ Platforms) (Col span 4) */}
            <div className="md:col-span-3 lg:col-span-4">
              <GlowCard className="border-border bg-card/90 h-full p-8">
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400">
                      <Share2 size={14} />
                      Social Omnichannel
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      20+ Network Integrations
                    </h3>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      YouTube, TikTok, GitHub, LinkedIn, Discord, Twitch,
                      Substack, Spotify, and more with smart icon
                      auto-detection.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      "GitHub",
                      "Twitter/X",
                      "YouTube",
                      "Discord",
                      "Twitch",
                      "Spotify",
                      "LinkedIn",
                      "Telegram",
                    ].map((platform, i) => (
                      <span
                        key={i}
                        className="border-border bg-muted/60 text-foreground rounded-md border px-2 py-1 text-[11px] font-medium"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="border-border bg-card/50 mt-32 rounded-3xl border p-8 sm:p-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-5">
              <span className="text-primary text-xs font-bold tracking-wider uppercase">
                Technical Rigor
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Built for High Availability & Complete Data Ownership
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Whether you receive 10 clicks a week or 50,000 visitors during a
                live stream, LinkForge never throttles your links or loses your
                telemetry data.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <div>
                    <h4 className="text-foreground text-sm font-bold">
                      Fail-Safe Routing
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Edge caching ensures your bio page loads even during
                      provider outages.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <div>
                    <h4 className="text-foreground text-sm font-bold">
                      Privacy-Compliant Analytics
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      No invasive tracking cookies or third-party ad pixels.
                      100% GDPR compliant.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-primary mt-0.5 shrink-0"
                  />
                  <div>
                    <h4 className="text-foreground text-sm font-bold">
                      Instant Data Portability
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Export your click history, top referrer statistics, and
                      link configurations anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                  <TrendingUp size={24} className="mb-3 text-emerald-500" />
                  <h4 className="text-foreground text-base font-bold">
                    Click-Through Optimizations
                  </h4>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Track device breakdown, browser types, and geographic
                    location without violating audience privacy.
                  </p>
                </div>

                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                  <Lock size={24} className="mb-3 text-violet-500" />
                  <h4 className="text-foreground text-base font-bold">
                    Anti-Spam & Rate Limiting
                  </h4>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Protected against bot scraping, click farms, and malicious
                    redirect attacks with automated edge defenses.
                  </p>
                </div>

                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                  <Smartphone size={24} className="mb-3 text-blue-500" />
                  <h4 className="text-foreground text-base font-bold">
                    Mobile App Deep Linking
                  </h4>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Open links directly inside native Instagram, TikTok,
                    YouTube, and Spotify apps instead of in-app web views.
                  </p>
                </div>

                <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
                  <Cpu size={24} className="mb-3 text-amber-500" />
                  <h4 className="text-foreground text-base font-bold">
                    Automated SEO Indexing
                  </h4>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Dynamic OpenGraph cards and Twitter meta-tags are created
                    automatically for every custom username.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="border-border via-card to-background relative mt-28 overflow-hidden rounded-3xl border bg-gradient-to-br from-violet-600/20 p-10 text-center sm:p-16">
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to elevate your link presence?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Join thousands of creators, founders, and developers using
              LinkForge to connect their world.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Create Your Free Page
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="border-border bg-card text-foreground hover:bg-accent inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-8 text-sm font-semibold transition-all active:scale-[0.98]"
              >
                View Pro Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
