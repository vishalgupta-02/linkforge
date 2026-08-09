"use client";

import React from "react";

const FeatureStrip = () => {
  return (
    <div className="border-b border-zinc-200 bg-zinc-100/50 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400">
        <span>Free to start</span>
        <span className="hidden sm:inline">•</span>
        <span>Quick setup</span>
        <span className="hidden sm:inline">•</span>
        <span>Custom domains</span>
        <span className="hidden sm:inline">•</span>
        <span>Deep analytics</span>
      </div>
    </div>
  );
};

export default FeatureStrip;
