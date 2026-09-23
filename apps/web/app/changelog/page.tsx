"use client";

import React from "react";
import Link from "next/link";
import {
  History,
  Sparkles,
  Zap,
  Tag,
  Calendar,
  CheckCircle2,
  Smartphone,
  Webhook,
  ArrowRight,
} from "lucide-react";

interface Release {
  version: string;
  date: string;
  badge: string;
  title: string;
  description: string;
  features: string[];
}

const RELEASES: Release[] = [
  {
    version: "v2.4.0",
    date: "September 2026",
    badge: "Current Release",
    title: "Native Mobile Early Access, Deep Linking & Developer Hub",
    description:
      "A massive expansion of the LinkForge developer and mobile ecosystem, bridging native iOS/Android deep linking and programmatic API controls.",
    features: [
      "Native iOS & Android waitlist engine with automated Resend confirmation emails and priority subscriber position tracking.",
      "Smart Mobile App Deep Linking Protocol Handler: automatically launches YouTube, Spotify, and Instagram apps on mobile with zero-webview traps.",
      "Developer Integrations Hub: programmatic API keys management, signed webhooks with HMAC-SHA256 signatures, and live test ping simulator.",
      "Pro Tier Watermark Removal: clean, unbranded public bio profiles for Pro and Business subscribers.",
      "Complete documentation, API reference, and live status monitoring infrastructure.",
    ],
  },
  {
    version: "v2.2.0",
    date: "August 2026",
    badge: "Major Update",
    title: "Real-Time Presence Engine & Edge Telemetry",
    description:
      "Introduced live audience presence powered by Server-Sent Events (SSE) and asynchronous click event ingestion via BullMQ workers.",
    features: [
      "Server-Sent Events (SSE) stream broadcasting concurrent active readers live on creator dashboards.",
      "BullMQ asynchronous click queue processing telemetry with zero impact on edge redirect latency.",
      "Granular analytics dashboard: country breakdown with flags, device types, and top referrers.",
      "Social omnichannel matrix detecting 20+ creator platforms (Discord, Twitch, Spotify, Substack, GitHub).",
    ],
  },
  {
    version: "v2.0.0",
    date: "July 2026",
    badge: "Pro Billing",
    title: "Stripe Billing & Cloudinary Image Engine",
    description:
      "Full subscription management, customer portal, and fast CDN-backed media uploads.",
    features: [
      "Stripe Checkout integration supporting Monthly and Yearly Pro memberships.",
      "Stripe Customer Portal for self-serve payment method updates and cancellations.",
      "Cloudinary integration for creator avatars with automated cropping and WebP optimization.",
      "Drag-and-drop link reordering powered by `@dnd-kit` with optimistic edge sync.",
    ],
  },
  {
    version: "v1.0.0",
    date: "April 2026",
    badge: "Initial Launch",
    title: "Foundation & Identity Engine",
    description:
      "The initial release of LinkForge featuring modern Better Auth session management and sub-10ms redirects.",
    features: [
      "Better Auth with email verification requirement and multi-device session revocation.",
      "Collision-resistant creator username allocation engine.",
      "Express & TypeScript REST API with Zod validation and global error handling.",
      "PostgreSQL schema with Prisma ORM and connection pooling.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
        {/* Header */}
        <div className="mb-14 text-center space-y-3">
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
            <History size={13} />
            <span>Product Updates</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            LinkForge Changelog
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-sm">
            Continuous improvements, feature launches, and performance optimizations.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-border/80 pl-6 sm:pl-8 space-y-12">
          {RELEASES.map((rel, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">
                    {rel.version}
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Calendar size={12} /> {rel.date}
                  </span>
                  <span className="border-border bg-muted/60 text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border">
                    {rel.badge}
                  </span>
                </div>

                <h3 className="text-foreground text-xl font-bold tracking-tight">
                  {rel.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {rel.description}
                </p>

                <div className="border-border bg-card/50 rounded-2xl border p-5 mt-4 backdrop-blur-md">
                  <h4 className="text-foreground text-xs font-bold uppercase tracking-wider mb-3">
                    What's New
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {rel.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
