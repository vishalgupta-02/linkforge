import { CheckCircle2, Sparkles } from "lucide-react";

const Pricing = () => {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50/50 py-24 dark:border-white/5 dark:bg-transparent">
      <div className="mx-auto max-w-6xl px-6">
        <div className="animate-fade-in-up mb-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Simple, transparent pricing.
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Start free. Upgrade when you grow. No hidden fees.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="animate-fade-in-up flex flex-col rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all delay-100 hover:shadow-md dark:border-white/10 dark:bg-[#111]">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                Free
              </h3>
              <p className="mt-2 text-sm font-medium text-zinc-500">
                For getting started and sharing basics.
              </p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                ₹0
              </span>
              <span className="text-sm font-medium text-zinc-500">
                {" "}
                / forever
              </span>
            </div>
            <ul className="mb-10 flex-1 space-y-4">
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="shrink-0 text-zinc-400" />
                Up to 8 links
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="shrink-0 text-zinc-400" />
                Basic themes (Light & Dark)
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="shrink-0 text-zinc-400" />
                Public profile page
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="shrink-0 text-zinc-400" />
                Basic click analytics (7 days)
              </li>
            </ul>
            <button className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-bold text-zinc-900 shadow-sm transition-all hover:bg-zinc-100 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              Get started for free
            </button>
          </div>

          <div className="animate-fade-in-up border-primary dark:border-primary relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white p-8 shadow-xl transition-all delay-200 hover:shadow-2xl dark:bg-[#111] dark:shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
            <div className="bg-primary absolute top-0 right-0 rounded-bl-xl px-4 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                Pro
              </h3>
              <p className="mt-2 text-sm font-medium text-zinc-500">
                For growing creators who need full control.
              </p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                ₹299
              </span>
              <span className="text-sm font-medium text-zinc-500">
                {" "}
                / month
              </span>
            </div>
            <ul className="mb-10 flex-1 space-y-4">
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                Unlimited links & embeds
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                All 8 premium themes
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                Advanced analytics (1 year history)
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                Deep customization options
              </li>
              <li className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                Priority support
              </li>
            </ul>
            <button className="hover:bg-primary/80 bg-primary text-background inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98]">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
