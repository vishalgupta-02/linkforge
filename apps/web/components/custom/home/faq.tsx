import React from "react";

const FAQ = () => {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Frequently asked questions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <h3 className="mb-2 text-lg font-bold text-zinc-950 dark:text-white">
              Getting Started
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Everything you need to know about setting up your Linkforge page.
            </p>
          </div>
          <div className="space-y-6 md:col-span-2">
            <div>
              <h4 className="mb-2 font-bold text-zinc-900 dark:text-white">
                Is Linkforge completely free?
              </h4>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Yes, the core features to build and share your link hub are free
                forever. We offer an optional Pro plan for advanced analytics
                and custom domains.
              </p>
            </div>
            <hr className="border-zinc-200 dark:border-white/5" />
            <div>
              <h4 className="mb-2 font-bold text-zinc-900 dark:text-white">
                Can I use my own domain name?
              </h4>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Absolutely. Pro users can connect any custom domain (e.g.,
                links.yourname.com) directly to their profile to maintain full
                brand consistency.
              </p>
            </div>
          </div>

          <div className="pt-8 md:col-span-1 md:pt-0">
            <h3 className="mb-2 text-lg font-bold text-zinc-950 dark:text-white">
              Monetization
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              How to get paid directly through your link.
            </p>
          </div>
          <div className="space-y-6 pt-8 md:col-span-2 md:pt-0">
            <div>
              <h4 className="mb-2 font-bold text-zinc-900 dark:text-white">
                How do I get paid?
              </h4>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                We integrate directly with Stripe and PayPal. When you sell a
                product or collect a tip, the funds go directly to your account.
                We don&apos;t hold your money.
              </p>
            </div>
            <hr className="border-zinc-200 dark:border-white/5" />
            <div>
              <h4 className="mb-2 font-bold text-zinc-900 dark:text-white">
                Does Linkforge take a cut?
              </h4>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                We take a 0% transaction fee on the Pro plan, and a standard 5%
                fee on the free plan (excluding standard Stripe/PayPal
                processing fees).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
