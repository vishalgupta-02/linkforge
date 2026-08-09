import { Github, Globe, Instagram, Youtube } from "lucide-react";
import React from "react";

const Integrations = () => {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50/50 py-24 dark:border-white/5 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Connect everything you already use.
        </h2>
        <p className="mb-12 text-lg text-zinc-600 dark:text-zinc-400">
          Link directly to your favorite platforms. We automatically format and
          optimize the routing.
        </p>
        <div className="flex flex-wrap justify-center gap-6 opacity-60">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm transition-transform duration-300 hover:scale-102 dark:border-white/10 dark:bg-[#111]">
            <div className="group relative w-fit">
              <Instagram size={28} className="text-zinc-900 dark:text-white" />
              <div className="absolute bottom-10 left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs whitespace-nowrap text-white group-hover:block">
                Instagram Profile
              </div>
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm transition-transform duration-300 hover:scale-102 dark:border-white/10 dark:bg-[#111]">
            <div className="group relative w-fit">
              <Youtube size={28} className="text-zinc-900 dark:text-white" />
              <div className="absolute bottom-10 left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs whitespace-nowrap text-white group-hover:block">
                YouTube Channel
              </div>
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm transition-transform duration-300 hover:scale-102 dark:border-white/10 dark:bg-[#111]">
            <div className="group relative w-fit">
              <Github size={28} className="text-zinc-900 dark:text-white" />
              <div className="absolute bottom-10 left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs whitespace-nowrap text-white group-hover:block">
                GitHub Profile
              </div>
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm transition-transform duration-300 hover:scale-102 dark:border-white/10 dark:bg-[#111]">
            <div className="group relative w-fit">
              <Globe size={28} className="text-zinc-900 dark:text-white" />
              <div className="absolute bottom-10 left-1/2 mb-2 hidden -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs whitespace-nowrap text-white group-hover:block">
                Custom URL
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
