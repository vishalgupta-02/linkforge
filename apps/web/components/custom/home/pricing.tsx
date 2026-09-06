"use client";

import React from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useCreateCheckout } from "@/hooks/use-create-checkout";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { PRICING_PLANS } from "@/configs/pricing.config";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

const Pricing = () => {
  const { data: session } = authClient.useSession();
  const { data: billingStatus, isLoading: isBillingLoading } =
    useBillingStatus();
  const { mutate: createCheckout, isPending: isCheckoutPending } =
    useCreateCheckout();

  const currentPlan = billingStatus?.data?.plan || "FREE";
  const isPro =
    currentPlan.toUpperCase() === "PRO" ||
    currentPlan.toUpperCase() === "BUSINESS";

  const freePlan = PRICING_PLANS.find((p) => p.id === "FREE") || PRICING_PLANS[0];
  const proPlan = PRICING_PLANS.find((p) => p.id === "PRO") || PRICING_PLANS[1];

  return (
    <section
      id="pricing"
      className="border-b border-zinc-200 bg-zinc-50/50 py-24 dark:border-white/5 dark:bg-transparent"
    >
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
          {/* FREE PLAN */}
          <div className="animate-fade-in-up flex flex-col rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all delay-100 hover:shadow-md dark:border-white/10 dark:bg-[#111]">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                {freePlan.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-zinc-500">
                {freePlan.description}
              </p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                {freePlan.price}
              </span>
              <span className="text-sm font-medium text-zinc-500">
                {" "}
                {freePlan.interval}
              </span>
            </div>
            <ul className="mb-10 flex-1 space-y-4">
              {freePlan.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <CheckCircle2 size={18} className="shrink-0 text-zinc-400" />
                  {feature}
                </li>
              ))}
            </ul>

            {session?.user ? (
              <button
                disabled={!isPro}
                className="inline-flex h-12 w-full cursor-default items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-bold text-zinc-900 shadow-sm transition-all dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {!isPro ? "Current Plan" : "Included"}
              </button>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-bold text-zinc-900 shadow-sm transition-all hover:bg-zinc-100 active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {freePlan.ctaLabel}
              </Link>
            )}
          </div>

          {/* PRO PLAN */}
          <div className="animate-fade-in-up border-primary dark:border-primary relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white p-8 shadow-xl transition-all delay-200 hover:shadow-2xl dark:bg-[#111] dark:shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
            <div className="bg-primary absolute top-0 right-0 rounded-bl-xl px-4 py-1.5 text-[11px] font-bold tracking-wider text-white uppercase">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
                {proPlan.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-zinc-500">
                {proPlan.description}
              </p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                {proPlan.price}
              </span>
              <span className="text-sm font-medium text-zinc-500">
                {" "}
                {proPlan.interval}
              </span>
            </div>
            <ul className="mb-10 flex-1 space-y-4">
              {proPlan.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {isPro ? (
              <Link
                href="/dashboard/settings"
                className="hover:bg-primary/80 bg-primary text-background inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <Sparkles size={16} />
                Current Plan — Manage in Settings
              </Link>
            ) : (
              <button
                onClick={() => createCheckout()}
                disabled={isCheckoutPending || isBillingLoading}
                className="hover:bg-primary/80 bg-primary text-background inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCheckoutPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {isCheckoutPending
                  ? "Redirecting to Stripe..."
                  : proPlan.ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;


