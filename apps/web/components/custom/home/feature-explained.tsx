"use client";

import { CheckCircle2, GripVertical, LinkIcon, TrendingUp } from "lucide-react";
import React from "react";

const FeatureExplained = () => {
  return (
    <section className="border-t border-zinc-200 py-24 dark:border-white/5">
      <div className="mx-auto max-w-6xl space-y-32 px-6">
        <div className="flex flex-col items-center gap-12 md:flex-row md:gap-20">
          <div className="animate-fade-in-up flex-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              <LinkIcon size={14} /> Link Management
            </div>
            <h2 className="mb-4 text-xl font-bold tracking-tight text-zinc-950 md:text-3xl dark:text-white">
              Manage with zero friction.
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Add, edit, and reorder your links instantly. Our streamlined
              editor lets you update your profile without navigating through
              clunky forms.
            </p>
            <ul className="space-y-3">
              {[
                "Drag and drop reordering",
                "Instant visibility toggles",
                "Inline editing interface",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <CheckCircle2 size={16} className="text-violet-500" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="animate-fade-in-up flex w-full flex-1 justify-center"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#111]">
              <div className="space-y-3">
                {[
                  {
                    title: "My Latest Video",
                    url: "youtube.com/...",
                    on: true,
                  },
                  {
                    title: "Portfolio Website",
                    url: "sarah.design",
                    on: true,
                  },
                  {
                    title: "Digital Store",
                    url: "store.sarah.design",
                    on: false,
                  },
                ].map((link, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition-opacity dark:border-white/5 dark:bg-[#0a0a0a] ${!link.on ? "opacity-50 grayscale" : ""}`}
                  >
                    <GripVertical size={16} className="text-zinc-400" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {link.title}
                      </p>
                      <p className="text-xs text-zinc-500">{link.url}</p>
                    </div>
                    <div
                      className={`flex h-4 w-8 items-center rounded-full p-0.5 ${link.on ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700"}`}
                    >
                      <div
                        className={`h-3 w-3 rounded-full bg-white shadow-sm dark:bg-black ${link.on ? "translate-x-4" : ""}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="border-b border-zinc-200 py-32 dark:border-white/5">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 md:flex-row">
            <div className="flex w-full flex-1 justify-between">
              <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-xl dark:border-white/10 dark:bg-[#111]">
                <h3 className="mb-6 text-sm font-semibold text-zinc-500">
                  Last 30 Days
                </h3>

                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/5 dark:bg-[#1a1a1a]">
                    <p className="mb-1 text-xs font-medium text-zinc-500">
                      Total Views
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      14.2K
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/5 dark:bg-[#1a1a1a]">
                    <p className="mb-1 text-xs font-medium text-zinc-500">
                      Total Clicks
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      8.4K
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                  Top Links
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                      My latest vlog
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      4.1K
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-violet-500"
                      style={{ width: "70%" }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                      Preset Pack (Store)
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      2.8K
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-violet-500"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
                <TrendingUp size={14} />
                Built-in Analytics
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 md:text-3xl dark:text-white">
                Understand your audience.
              </h2>
              <p className="text-md text-zinc-600 dark:text-zinc-400">
                Stop guessing what works. Linkforge provides deep,
                privacy-friendly analytics on clicks, views, and top performing
                links so you can optimize your strategy.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-3 font-medium text-zinc-800 dark:text-zinc-200">
                  <CheckCircle2 size={18} className="text-zinc-400" /> Real-time
                  view tracking
                </li>
                <li className="flex items-center gap-3 font-medium text-zinc-800 dark:text-zinc-200">
                  <CheckCircle2 size={18} className="text-zinc-400" /> Device
                  and location data
                </li>
                <li className="flex items-center gap-3 font-medium text-zinc-800 dark:text-zinc-200">
                  <CheckCircle2 size={18} className="text-zinc-400" /> CTR
                  (Click-through rate) metrics
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature 3: Themes (From original landing page) */}
        <div className="animate-fade-in-up text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            See it in action
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-zinc-600 dark:text-zinc-400">
            Match your brand perfectly with premium themes that require zero
            coding.
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="h-[400px] w-[260px] overflow-hidden rounded-[2.5rem] border-8 border-zinc-200 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-2 dark:border-zinc-800">
                <div className="mx-auto mt-6 mb-3 h-16 w-16 rounded-full bg-zinc-200" />
                <div className="mx-auto mb-6 h-3 w-24 rounded-full bg-zinc-200" />
                <div className="space-y-3">
                  <div className="h-10 w-full rounded-lg border border-zinc-100 bg-zinc-300" />
                  <div className="h-10 w-full rounded-lg border border-zinc-100 bg-zinc-300" />
                </div>
              </div>
              <p className="mt-6 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                Clean & Minimal
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-[400px] w-[260px] overflow-hidden rounded-[2.5rem] border-8 border-zinc-200 bg-[#0a0a0a] p-4 shadow-sm transition-transform duration-300 hover:-translate-y-2 dark:border-zinc-800">
                <div className="mx-auto mt-6 mb-3 h-16 w-16 rounded-full bg-zinc-800" />
                <div className="mx-auto mb-6 h-3 w-24 rounded-full bg-zinc-800" />
                <div className="space-y-3">
                  <div className="h-12 w-full rounded-xl border border-white/5 bg-zinc-900" />
                  <div className="h-12 w-full rounded-xl border border-white/5 bg-zinc-900" />
                </div>
              </div>
              <p className="mt-6 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                Professional
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-[400px] w-[260px] overflow-hidden rounded-[2.5rem] border-8 border-zinc-200 bg-violet-900 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-2 dark:border-zinc-800">
                <div className="mx-auto mt-6 mb-3 h-16 w-16 rounded-full border-2 border-violet-400 bg-violet-800" />
                <div className="mx-auto mb-6 h-3 w-24 rounded-full bg-violet-800" />
                <div className="space-y-3">
                  <div className="h-12 w-full rounded-full border border-violet-400/30 bg-violet-800/50" />
                  <div className="h-12 w-full rounded-full border border-violet-400/30 bg-violet-800/50" />
                </div>
              </div>
              <p className="mt-6 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                Expressive
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureExplained;
