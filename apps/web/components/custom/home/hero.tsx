"use client";

import { BadgeCheck, Camera, Globe, Palette, PlayCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 pt-32 pb-16 md:pt-20 md:pb-20 dark:border-white/5">
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center gap-32 px-6 md:gap-12 lg:flex-row">
        <div className="animate-fade-in-up flex-1 text-center lg:text-left">
          <h1 className="mb-6 text-5xl leading-[1.05] font-extrabold tracking-tight text-zinc-950 md:text-7xl dark:text-white">
            One link.
            <br />
            <span className="text-zinc-400 dark:text-zinc-500">
              All of you.
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-zinc-600 lg:mx-0 dark:text-zinc-400">
            Share your links, content, and identity — all in one beautifully
            designed page. Turn your audience into a destination.
          </p>

          <div className="mx-auto mb-3 flex max-w-lg flex-col items-center justify-center gap-3 sm:flex-row lg:mx-0 lg:justify-start">
            <div className="relative w-full">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium text-zinc-700 dark:text-zinc-400">
                linkforge.bio/
              </span>
              <input
                type="text"
                placeholder="username"
                className="h-12 w-full rounded-xl border border-zinc-200 bg-white pr-4 pl-33 font-medium text-zinc-900 shadow-sm transition-all outline-none placeholder:text-zinc-400 focus:ring-1 focus:ring-violet-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-600"
              />
            </div>
            <button className="bg-primary/90 hover:bg-primary/70 text-background inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl px-6 text-sm font-semibold whitespace-nowrap shadow-sm transition-all active:scale-[0.98] sm:w-auto">
              Create page
            </button>
          </div>
          <p className="mb-3 pl-3 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            It&apos;s free, and takes less than 30 seconds.
          </p>
        </div>

        <div
          className="animate-fade-in-up relative flex w-full flex-1 justify-center"
          style={{ animationDelay: "100ms" }}
        >
          <div
            className="relative h-[620px] w-[320px] overflow-hidden rounded-[3.5rem] border-[10px] border-zinc-900 bg-zinc-50 shadow-2xl dark:border-[#1a1a1a] dark:bg-[#0c0c0c] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            style={{ animation: "float-subtle 6s ease-in-out infinite" }}
          >
            <div className="absolute inset-x-0 top-0 z-20 mx-16 h-6 rounded-b-2xl bg-zinc-900 dark:bg-[#1a1a1a]" />
            <div className="relative flex h-full w-full flex-col items-center overflow-y-hidden px-5 pt-16 pb-8">
              <div className="relative mt-4 mb-3">
                <div className="h-20 w-20 rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                    alt="Creator"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="mb-1 flex items-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Sarah Creative
                </h2>
                <BadgeCheck size={16} className="text-violet-500" />
              </div>
              <p className="mb-6 text-center text-[13px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
                Digital artist & designer. ✨
              </p>
              <div className="w-full space-y-3">
                {[
                  {
                    icon: <PlayCircle size={18} />,
                    label: "Latest YouTube Video",
                  },
                  {
                    icon: <Camera size={18} />,
                    label: "Follow on Instagram",
                  },
                  {
                    icon: <Globe size={18} />,
                    label: "My Portfolio Website",
                  },
                  {
                    icon: <Palette size={18} />,
                    label: "Download my Brushes",
                  },
                ].map((link, i) => (
                  <div
                    key={i}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-1 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {link.icon}
                    </div>
                    <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                      {link.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="py-4 text-xs text-zinc-500 dark:text-zinc-400">
                Made with Linkforge
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
