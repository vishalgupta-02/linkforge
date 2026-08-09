"use client";

import { Camera, Globe, PenTool, PlayCircle } from "lucide-react";

const Usecases = () => {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/50 py-16 dark:border-white/5 dark:bg-transparent">
      <div className="mx-auto mb-16 max-w-6xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Built for every kind of creator.
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Whether you&apos;re growing an audience, designing products, or
          building a brand.
        </p>
      </div>

      <div className="space-y-24 md:space-y-32">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 md:flex-row md:gap-20">
          <div className="animate-fade-in-up flex-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              For Influencers & Creators
            </div>
            <h2 className="mb-4 text-xl font-bold tracking-tight text-zinc-950 md:text-3xl dark:text-white">
              Turn your audience into a destination.
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Route your followers from LinkedIn, Instagram, and YouTube to a
              single, beautifully branded hub. Share your latest content,
              sponsorships, and social channels effortlessly.
            </p>
          </div>
          <div
            className="animate-fade-in-up flex w-full flex-1 justify-center"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#111] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-1">
                  <div className="h-full w-full rounded-full border-2 border-white bg-zinc-100 dark:border-[#111] dark:bg-zinc-900" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Alex Rivera
                </h3>
                <p className="text-xs font-medium text-zinc-500">
                  @alexcreates
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: <PlayCircle size={14} />,
                    title: "Latest Vlog (Must Watch)",
                  },
                  {
                    icon: <Camera size={14} />,
                    title: "Follow my daily life",
                  },
                ].map((link, i) => (
                  <div
                    key={i}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition-transform duration-300 hover:scale-102 dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <div className="text-zinc-400">{link.icon}</div>
                    <span className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {link.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 md:flex-row md:gap-20">
          <div
            className="animate-fade-in-up flex w-full flex-1 justify-center md:order-1"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#111] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-1">
                  <div className="h-full w-full rounded-full border-2 border-white bg-zinc-100 dark:border-[#111] dark:bg-zinc-900" />
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Sarah Studio
                </h3>
                <p className="text-xs font-medium text-zinc-500">
                  @sarahdesign
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: <Globe size={14} />,
                    title: "Portfolio Website",
                  },
                  {
                    icon: <PenTool size={14} />,
                    title: "Figma Community Files",
                  },
                ].map((link, i) => (
                  <div
                    key={i}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition-transform duration-300 hover:scale-102 dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <div className="text-zinc-400">{link.icon}</div>
                    <span className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {link.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="animate-fade-in-up flex-1 md:order-2">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              For Designers & Creatives
            </div>
            <h2 className="mb-4 text-xl font-bold tracking-tight text-zinc-950 md:text-3xl dark:text-white">
              Showcase your best work.
            </h2>
            <p className="mb-6 max-w-md text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Build a minimalist directory of your portfolio, case studies, and
              design resources. Let your work speak for itself without the
              clutter of a traditional website.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Usecases;
