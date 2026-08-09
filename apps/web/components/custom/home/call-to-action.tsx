import React from "react";

const CallToAction = () => {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 py-32 dark:border-white/5 dark:bg-[#0c0c0c]">
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl dark:text-white">
          Create your page in seconds.
        </h2>
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          Claim your unique URL before someone else does. It's free, fast, and
          beautifully yours.
        </p>
        <button className="bg-primary hover:bg-primary/80 text-primary-foreground inline-flex h-14 cursor-pointer items-center justify-center rounded-xl px-8 text-lg font-semibold shadow-sm transition-all active:scale-[0.98]">
          Get started for free
        </button>
        <p className="mt-4 text-[13px] font-medium text-zinc-500">
          No credit card required.
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
