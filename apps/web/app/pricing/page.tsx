"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  CreditCard,
  Lock,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useCreateCheckout } from "@/hooks/use-create-checkout";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { PRICING_PLANS } from "@/configs/pricing.config";
import { authClient } from "@/lib/auth-client";
import {
  FadeIn,
  GlowCard,
  RevealText,
  PageTransition,
} from "@/components/animations";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const { data: session } = authClient.useSession();
  const { data: billingStatus, isLoading: isBillingLoading } = useBillingStatus();
  const { mutate: createCheckout, isPending: isCheckoutPending } = useCreateCheckout();

  const currentPlan = billingStatus?.data?.plan || "FREE";
  const isPro =
    currentPlan.toUpperCase() === "PRO" ||
    currentPlan.toUpperCase() === "BUSINESS";

  const freePlan = PRICING_PLANS.find((p) => p.id === "FREE") || PRICING_PLANS[0];
  const proPlan = PRICING_PLANS.find((p) => p.id === "PRO") || PRICING_PLANS[1];

  const proPriceDisplay = billingCycle === "monthly" ? "₹299" : "₹2,870";
  const proIntervalDisplay = billingCycle === "monthly" ? "/ month" : "/ year (save 20%)";

  const comparisonFeatures = [
    { name: "Active Links Count", free: "Up to 8 links", pro: "Unlimited", category: "Core Limits" },
    { name: "Public Bio Profile", free: true, pro: true, category: "Core Limits" },
    { name: "Custom Subdomain (linkforge.com/yourname)", free: true, pro: true, category: "Core Limits" },
    { name: "Custom Domain Connection (links.yourname.com)", free: false, pro: true, category: "Core Limits" },

    { name: "Theme Library", free: "2 Core Themes", pro: "All 8+ Designer Themes", category: "Customization & Branding" },
    { name: "Custom Button Shapes & Radius", free: "Basic", pro: "Advanced Controls", category: "Customization & Branding" },
    { name: "Custom Avatar & Bio Banner", free: true, pro: true, category: "Customization & Branding" },
    { name: "Remove LinkForge Watermark", free: false, pro: true, category: "Customization & Branding" },
    { name: "Custom CSS & Font Pairings", free: false, pro: true, category: "Customization & Branding" },

    { name: "Click History Window", free: "7 Days", pro: "365 Days / Full History", category: "Analytics & Telemetry" },
    { name: "Live Real-Time Visitor Presence", free: false, pro: true, category: "Analytics & Telemetry" },
    { name: "Geographic Location & City Breakdown", free: "Country only", pro: "Full City & Region", category: "Analytics & Telemetry" },
    { name: "Device & Browser Analytics", free: true, pro: true, category: "Analytics & Telemetry" },
    { name: "Referrer Traffic Source Tracking", free: true, pro: true, category: "Analytics & Telemetry" },
    { name: "CSV / JSON Data Export", free: false, pro: true, category: "Analytics & Telemetry" },

    { name: "High-Resolution Vector QR Codes", free: "Standard PNG", pro: "High-Res Vector (SVG/PNG)", category: "Extras & Support" },
    { name: "Global Edge DNS & SSL", free: true, pro: true, category: "Extras & Support" },
    { name: "Customer Support Tier", free: "Community", pro: "Priority Email & Chat", category: "Extras & Support" },
  ];

  return (
    <PageTransition className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(150,150,150,0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -right-32 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        {/* Heading Header */}
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn direction="up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} />
              Transparent, Value-Driven Plans
            </div>
          </FadeIn>

          <RevealText
            text="Simple pricing for limitless creator potential."
            className="justify-center text-4xl font-extrabold tracking-tight sm:text-6xl"
          />

          <FadeIn delay={0.1} direction="up" className="mt-6">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Start with all the basics completely free forever. Upgrade to Pro when you need custom domains, advanced telemetry, and live visitor pulse.
            </p>
          </FadeIn>

          {/* Billing Cycle Toggle */}
          <FadeIn delay={0.2} direction="up" className="mt-10 flex items-center justify-center">
            <div className="flex items-center rounded-2xl border border-border bg-card p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "yearly"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual Billing
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  Save 20%
                </span>
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Free Tier Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md sm:p-10">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {freePlan.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {freePlan.description}
                  </p>
                </div>
              </div>

              <div className="my-8">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  {freePlan.price}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {" "}{freePlan.interval}
                </span>
              </div>

              <div className="border-t border-border pt-6">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  What&apos;s included in Free:
                </span>
                <ul className="mt-4 space-y-3.5">
                  {freePlan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm font-medium text-foreground"
                    >
                      <CheckCircle2 size={18} className="shrink-0 text-muted-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border">
              {session?.user ? (
                <button
                  disabled={!isPro}
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-muted/60 text-sm font-bold text-foreground transition-all cursor-default"
                >
                  {!isPro ? "Current Active Plan" : "Included with Pro"}
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-muted/60 text-sm font-bold text-foreground shadow-xs transition-all hover:bg-accent active:scale-[0.98]"
                >
                  {freePlan.ctaLabel}
                </Link>
              )}
            </div>
          </div>

          {/* Pro Tier Card */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-primary bg-card p-8 shadow-xl transition-all sm:p-10 dark:shadow-[0_20px_50px_rgba(124,58,237,0.12)]">
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-primary px-4 py-1.5 text-xs font-extrabold tracking-wider text-primary-foreground uppercase">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    {proPlan.name}
                    <Sparkles size={18} className="text-primary" />
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {proPlan.description}
                  </p>
                </div>
              </div>

              <div className="my-8">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  {proPriceDisplay}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {" "}{proIntervalDisplay}
                </span>
              </div>

              <div className="border-t border-border pt-6">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Everything in Free, plus:
                </span>
                <ul className="mt-4 space-y-3.5">
                  {proPlan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm font-medium text-foreground"
                    >
                      <CheckCircle2 size={18} className="text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                    Custom domain attachment (links.yourname.com)
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                    Zero LinkForge watermark
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border">
              {isPro ? (
                <Link
                  href="/dashboard/settings"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  Manage Subscription in Settings
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => createCheckout()}
                  disabled={isCheckoutPending || isBillingLoading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCheckoutPending && <Loader2 size={18} className="animate-spin" />}
                  {isCheckoutPending
                    ? "Redirecting to Stripe..."
                    : session?.user
                    ? proPlan.ctaLabel
                    : "Get Started with Pro"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mx-auto mt-16 max-w-4xl grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card/60 p-4">
            <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Bank-Grade Security</p>
              <p className="text-muted-foreground">Processed securely via Stripe 256-bit encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card/60 p-4">
            <RefreshCw size={24} className="text-primary shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Cancel Anytime</p>
              <p className="text-muted-foreground">No lock-ins or contracts. One-click cancellation</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card/60 p-4">
            <Zap size={24} className="text-amber-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-foreground">Instant Activation</p>
              <p className="text-muted-foreground">Pro features unlock immediately after payment</p>
            </div>
          </div>
        </div>

        {/* Detailed Feature Comparison Matrix */}
        <div className="mt-32">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Compare All Features
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              A comprehensive breakdown of everything included in Free and Pro tiers.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-5 px-6 font-bold text-foreground w-1/2">Feature Overview</th>
                    <th className="py-5 px-6 font-bold text-foreground text-center w-1/4">Free</th>
                    <th className="py-5 px-6 font-bold text-primary text-center w-1/4 bg-primary/5">Pro Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonFeatures.map((item, index) => {
                    const isNewCategory =
                      index === 0 ||
                      comparisonFeatures[index - 1].category !== item.category;

                    return (
                      <React.Fragment key={index}>
                        {isNewCategory && (
                          <tr className="bg-muted/30">
                            <td
                              colSpan={3}
                              className="py-3 px-6 text-xs font-extrabold tracking-wider text-muted-foreground uppercase"
                            >
                              {item.category}
                            </td>
                          </tr>
                        )}
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-6 text-foreground font-medium text-xs sm:text-sm">
                            {item.name}
                          </td>
                          <td className="py-4 px-6 text-center text-xs sm:text-sm text-muted-foreground">
                            {typeof item.free === "boolean" ? (
                              item.free ? (
                                <CheckCircle2 size={18} className="mx-auto text-emerald-500" />
                              ) : (
                                <X size={18} className="mx-auto text-muted-foreground/40" />
                              )
                            ) : (
                              <span>{item.free}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center text-xs sm:text-sm font-semibold text-foreground bg-primary/5">
                            {typeof item.pro === "boolean" ? (
                              item.pro ? (
                                <CheckCircle2 size={18} className="mx-auto text-primary" />
                              ) : (
                                <X size={18} className="mx-auto text-muted-foreground/40" />
                              )
                            ) : (
                              <span>{item.pro}</span>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pricing FAQs */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Billing & Subscription FAQ
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Common questions about payments, invoicing, and plan upgrades.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="font-bold text-foreground text-sm mb-2">Can I switch plans or cancel at any time?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Yes. You can upgrade, downgrade, or cancel your Pro subscription whenever you want from your Account Settings. If you cancel, your Pro features remain active until the end of the billing period.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="font-bold text-foreground text-sm mb-2">What payment methods are supported?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We accept all major credit/debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, UPI, and local cards via Stripe&apos;s secured checkout gateway.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="font-bold text-foreground text-sm mb-2">What happens if I exceed 8 links on the Free plan?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Free plan supports up to 8 active links. To add unlimited links, embed videos, or add rich custom cards, you can upgrade to Pro in seconds.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h4 className="font-bold text-foreground text-sm mb-2">How does the custom domain setup work?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                With Pro, you can point a CNAME record from your DNS registrar (GoDaddy, Cloudflare, Namecheap) to LinkForge. We automatically issue and renew a free SSL certificate.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-28 rounded-3xl border border-border bg-card/60 p-10 text-center sm:p-14">
          <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Have questions or need custom enterprise pricing?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Get in touch with our team for high-volume custom domains, dedicated SLA agreements, or team workspaces.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/feedback?category=billing"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Contact Sales & Support
            </Link>
            <Link
              href="/faq"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-xs font-semibold text-foreground transition-all hover:bg-accent active:scale-[0.98]"
            >
              Read Platform FAQ
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
