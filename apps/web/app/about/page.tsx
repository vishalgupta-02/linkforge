"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Heart,
  Globe2,
  Terminal,
  Layers,
  ArrowRight,
  Cpu,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/10 absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full blur-[140px]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
            <Sparkles size={13} />
            <span>Our Story & Mission</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            We built LinkForge because link-in-bio was{" "}
            <span className="text-foreground underline decoration-primary/40 underline-offset-8">
              fundamentally broken
            </span>
            .
          </h1>

          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
            Creators were losing 30% of their audience to bloated scripts, slow
            multi-second redirects, and clunky mobile webviews. We engineered a
            modern alternative.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="mx-auto mt-16 max-w-3xl space-y-10 text-base leading-relaxed text-muted-foreground">
          <div className="border-border bg-card/50 rounded-2xl border p-8 space-y-4 backdrop-blur-md">
            <h2 className="text-foreground text-xl font-bold">The Problem We Saw</h2>
            <p>
              In 2026, serious creators produce podcasts, YouTube videos, GitHub
              open-source repositories, Substack newsletters, and digital
              products. Yet their single gateway to that entire digital empire was
              a 15-megabyte JavaScript payload that took 2 seconds to load.
            </p>
            <p>
              Every millisecond of latency is a lost visitor. If someone clicks your
              Instagram bio and stares at a blank screen while 14 tracking pixels
              fire, they leave. LinkForge was engineered with one uncompromising
              constraint: <strong className="text-foreground">the fastest redirect on the internet</strong>.
            </p>
          </div>

          {/* Three Core Tenets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="border-border bg-card/40 rounded-xl border p-6 space-y-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                <Zap size={20} />
              </div>
              <h3 className="text-foreground text-base font-bold">Latency First</h3>
              <p className="text-xs leading-relaxed">
                Sub-10ms edge redirects. Zero bloated client bundles. Telemetry
                ingestion runs asynchronously in BullMQ worker threads.
              </p>
            </div>

            <div className="border-border bg-card/40 rounded-xl border p-6 space-y-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                <Globe2 size={20} />
              </div>
              <h3 className="text-foreground text-base font-bold">Live Presence</h3>
              <p className="text-xs leading-relaxed">
                Creators should feel their audience. Our Server-Sent Events (SSE)
                presence engine lets you see active concurrent readers live.
              </p>
            </div>

            <div className="border-border bg-card/40 rounded-xl border p-6 space-y-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-foreground text-base font-bold">Creator Data</h3>
              <p className="text-xs leading-relaxed">
                You own 100% of your click logs and audience analytics. Export
                anytime in structured CSV and JSON formats.
              </p>
            </div>
          </div>

          {/* Architectural Rigor */}
          <div className="border-border bg-card/50 rounded-2xl border p-8 space-y-4 backdrop-blur-md">
            <h2 className="text-foreground text-xl font-bold flex items-center gap-2">
              <Cpu size={20} className="text-primary" />
              <span>Architected for Resilience</span>
            </h2>
            <p>
              LinkForge is composed of a Next.js frontend, an Express & TypeScript
              API gateway, Neon PostgreSQL with connection pooling, Redis caching,
              BullMQ distributed queues, and OpenTelemetry distributed tracing.
            </p>
            <p>
              We treat your link-in-bio not as an aesthetic toy, but as critical
              production infrastructure that must never go down.
            </p>
          </div>

          {/* CTA Box */}
          <div className="border-border bg-primary/5 rounded-2xl border p-8 text-center space-y-4">
            <h3 className="text-foreground text-2xl font-bold">Ready to take control of your audience?</h3>
            <p className="text-xs max-w-md mx-auto">
              Join thousands of creators who trust LinkForge for clean, ultra-fast bio links.
            </p>
            <div className="pt-2">
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold transition-all"
              >
                <span>Claim Your Handle Today</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
