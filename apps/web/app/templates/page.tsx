"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  Sliders,
  Smartphone,
} from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  category: "creator" | "developer" | "music" | "minimal";
  themeKey: string;
  tagline: string;
  bgClass: string;
  cardClass: string;
  btnClass: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "obsidian",
    name: "Obsidian Dark",
    category: "creator",
    themeKey: "obsidian",
    tagline: "Ultra-sleek charcoal minimalism with subtle border glows.",
    bgClass: "bg-[#09090b] text-zinc-100",
    cardClass: "bg-zinc-900 border-zinc-800",
    btnClass: "bg-zinc-800 text-zinc-100 border border-zinc-700",
  },
  {
    id: "tokyo-neon",
    name: "Tokyo Neon",
    category: "developer",
    themeKey: "neon",
    tagline: "Vibrant cyberpunk neon cyan & fuchsia accents for tech builders.",
    bgClass: "bg-[#080811] text-[#f8fafc]",
    cardClass: "bg-[#0f0f23] border-[#06b6d4]/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    btnClass: "bg-[#06b6d4]/15 text-[#38bdf8] border border-[#06b6d4]/40",
  },
  {
    id: "alabaster",
    name: "Alabaster Clean",
    category: "minimal",
    themeKey: "alabaster",
    tagline: "High-contrast editorial typography inspired by modern magazines.",
    bgClass: "bg-[#fafafa] text-[#18181b]",
    cardClass: "bg-white border-zinc-200 shadow-sm",
    btnClass: "bg-zinc-900 text-white",
  },
  {
    id: "sunset",
    name: "Sunset Horizon",
    category: "music",
    themeKey: "sunset",
    tagline: "Warm gradient aura capturing twilight energy for audio artists.",
    bgClass: "bg-gradient-to-b from-[#180a22] to-[#0c0512] text-amber-50",
    cardClass: "bg-white/5 border-amber-500/20 backdrop-blur-md",
    btnClass: "bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-200 border border-amber-500/30",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    category: "creator",
    themeKey: "forest",
    tagline: "Calming botanical tones and organic earth aesthetic.",
    bgClass: "bg-[#06140e] text-emerald-50",
    cardClass: "bg-emerald-950/40 border-emerald-800/30",
    btnClass: "bg-emerald-800/20 text-emerald-300 border border-emerald-700/40",
  },
  {
    id: "midnight",
    name: "Midnight Indigo",
    category: "developer",
    themeKey: "midnight",
    tagline: "Deep oceanic blue gradients for engineering and product leaders.",
    bgClass: "bg-[#030712] text-indigo-100",
    cardClass: "bg-[#0b1120] border-indigo-950",
    btnClass: "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30",
  },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = TEMPLATES.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory,
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="mb-12 text-center space-y-3">
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
            <Palette size={13} />
            <span>Theme Studio Gallery</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Creator Profile Templates
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-sm">
            Hand-crafted designer aesthetics with bespoke button radii, typography pairings, and dark/light color schemes.
          </p>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-2 pt-6 text-xs font-semibold">
            {[
              { id: "all", label: "All Templates" },
              { id: "creator", label: "Content Creators" },
              { id: "developer", label: "Developers & Builders" },
              { id: "music", label: "Musicians & Podcasts" },
              { id: "minimal", label: "Minimalist / Editorial" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-4 py-2 border transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary text-primary-foreground font-bold"
                    : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="border-border bg-card/60 overflow-hidden rounded-2xl border flex flex-col justify-between backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-xl group"
            >
              {/* Mini Phone Frame Mockup */}
              <div className={`p-6 ${t.bgClass} flex flex-col items-center justify-center min-h-[260px]`}>
                <div className="h-14 w-14 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-xs font-bold mb-3">
                  LF
                </div>
                <div className="text-sm font-bold tracking-tight mb-1">Creator Name</div>
                <div className="text-[11px] opacity-60 mb-4">@creator_handle</div>

                <div className="w-full max-w-[200px] space-y-2">
                  <div className={`py-2 px-3 rounded-xl text-center text-xs font-semibold ${t.btnClass}`}>
                    Latest Project
                  </div>
                  <div className={`py-2 px-3 rounded-xl text-center text-xs font-semibold ${t.btnClass}`}>
                    YouTube Channel
                  </div>
                </div>
              </div>

              {/* Details & Action */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-base font-bold">{t.name}</h3>
                  <span className="text-muted-foreground text-[11px] capitalize font-mono">
                    {t.category}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t.tagline}
                </p>

                <div className="border-border border-t pt-4 flex items-center justify-between">
                  <Link
                    href="/dashboard/edit-public-profile"
                    className="text-primary hover:underline text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Customize in Studio</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link
                    href="/signup"
                    className="border-border bg-muted/60 hover:bg-muted text-foreground text-xs font-bold rounded-lg px-3 py-1.5 border transition-all"
                  >
                    Use Theme
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
