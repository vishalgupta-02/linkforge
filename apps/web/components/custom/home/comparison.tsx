import { BadgeCheck, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import React from "react";

const Comparison = () => {
  return (
    <section className="border-b border-zinc-200 py-24 dark:border-white/5">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Why not just use your social bio?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Linkforge transforms a single dead link into a powerful growth
            engine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 opacity-70 dark:border-white/5 dark:bg-[#111]">
            <h3 className="mb-6 text-lg font-bold text-zinc-500">
              Standard Social Bio
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                <XCircle size={18} /> Only 1 link allowed
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                <XCircle size={18} /> Zero analytics or tracking
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                <XCircle size={18} /> Generic platform look
              </li>
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-violet-200 bg-white p-8 shadow-xl dark:border-violet-500/30 dark:bg-violet-500/5">
            <div className="absolute top-0 right-0 p-8">
              <Sparkles size={24} className="text-violet-500/20" />
            </div>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-zinc-950 dark:text-white">
              With Linkforge{" "}
              <BadgeCheck size={18} className="text-violet-500" />
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-violet-500" /> Unlimited
                links & embeds
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-violet-500" /> Deep
                click & view analytics
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-violet-500" /> Custom
                branding & themes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
