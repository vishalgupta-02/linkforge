"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Globe2,
  Lock,
  BarChart3,
  CreditCard,
  Zap,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  FadeIn,
  FadeInStagger,
  FadeInStaggerItem,
  GlowCard,
  RevealText,
  PageTransition,
} from "@/components/animations";

interface FAQItem {
  id: string;
  category: "general" | "links" | "domains" | "analytics" | "billing" | "security";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // General & Getting Started
  {
    id: "g1",
    category: "general",
    question: "What is LinkForge and how does it work?",
    answer:
      "LinkForge is a next-generation link-in-bio and creator hub platform. It lets you consolidate all your social profiles, websites, products, newsletters, and portfolio items into one beautifully designed, lightning-fast link (e.g. linkforge.com/yourname or your own custom domain).",
  },
  {
    id: "g2",
    category: "general",
    question: "Is LinkForge free to use?",
    answer:
      "Yes! LinkForge offers a generous Free forever plan that gives you up to 8 links, basic light/dark themes, click analytics, and your own public profile. You only need to upgrade to Pro if you require custom domains, unlimited links, all 8+ themes, or real-time visitor presence.",
  },
  {
    id: "g3",
    category: "general",
    question: "How do I claim my unique username?",
    answer:
      "Simply sign up for a free account. During onboarding, you'll choose your custom username (e.g. 'alex'). Your profile will immediately be live at linkforge.com/alex.",
  },
  {
    id: "g4",
    category: "general",
    question: "Can I use LinkForge on mobile devices?",
    answer:
      "LinkForge is 100% mobile-responsive. You can manage your links, check live analytics, change themes, and adjust settings from any phone, tablet, or desktop browser seamlessly.",
  },

  // Links & Profile Customization
  {
    id: "l1",
    category: "links",
    question: "How do I reorder or hide my links?",
    answer:
      "From your LinkForge dashboard, you can drag and drop any link card to change its display order instantly. You can also toggle the visibility switch on any link to temporarily hide it without deleting it.",
  },
  {
    id: "l2",
    category: "links",
    question: "Which social media platforms are supported?",
    answer:
      "We support over 20+ major platforms including YouTube, Instagram, TikTok, Twitter/X, GitHub, Discord, Twitch, LinkedIn, Spotify, Apple Music, Substack, Telegram, WhatsApp, and more. LinkForge automatically detects the URL and assigns the matching brand icon.",
  },
  {
    id: "l3",
    category: "links",
    question: "Can I customize the design and theme of my profile?",
    answer:
      "Yes. LinkForge features a dedicated Theme Studio where you can choose between minimal, dark, neon, and high-contrast designer themes, customize button styles, change background gradients, and select custom typography pairings.",
  },
  {
    id: "l4",
    category: "links",
    question: "Does LinkForge generate QR codes for my links?",
    answer:
      "Yes! Every LinkForge profile comes with an automatically generated high-resolution vector QR code that you can download in SVG or PNG format for print materials, business cards, stickers, or presentation slides.",
  },

  // Custom Domains & Technical
  {
    id: "d1",
    category: "domains",
    question: "Can I connect my own custom domain (e.g., links.mybrand.com)?",
    answer:
      "Yes, custom domains are available on the Pro plan. You can connect any apex domain (mybrand.com) or subdomain (links.mybrand.com) by simply adding a CNAME or A record with your domain registrar.",
  },
  {
    id: "d2",
    category: "domains",
    question: "Do you automatically provision SSL certificates for custom domains?",
    answer:
      "Yes. Once your DNS records propagate, LinkForge automatically issues and renews an enterprise-grade Let's Encrypt TLS/SSL certificate with zero manual configuration required.",
  },
  {
    id: "d3",
    category: "domains",
    question: "How fast are link redirects on LinkForge?",
    answer:
      "Redirects are executed at the edge on globally distributed nodes with sub-10ms response times. We don't run sluggish intermediate trackers or bloated redirect chains.",
  },

  // Analytics & Telemetry
  {
    id: "a1",
    category: "analytics",
    question: "What kind of analytics does LinkForge provide?",
    answer:
      "LinkForge tracks total page views, individual link clicks, click-through rates (CTR), geographic distribution (country and city level on Pro), referring platforms (e.g. Twitter, Instagram, Reddit), and device/browser breakdowns.",
  },
  {
    id: "a2",
    category: "analytics",
    question: "What is the 'Live Visitor Telemetry' feature?",
    answer:
      "Pro users have access to real-time presence indicators. You can see how many active visitors are browsing your link hub right now, which is invaluable during live stream drops, product launches, or viral social media posts.",
  },
  {
    id: "a3",
    category: "analytics",
    question: "Is LinkForge analytics privacy-friendly and GDPR compliant?",
    answer:
      "Yes! We do not use intrusive cross-site tracking cookies, store PII without consent, or sell your telemetry data to third-party ad networks. Our tracking is 100% GDPR, CCPA, and PECR compliant.",
  },

  // Billing & Pro Subscription
  {
    id: "b1",
    category: "billing",
    question: "How does the Pro subscription billing work?",
    answer:
      "You can choose between monthly (₹299/month) or annual billing (₹2,870/year, saving 20%). Billing is processed automatically and securely through Stripe.",
  },
  {
    id: "b2",
    category: "billing",
    question: "Can I cancel my subscription at any time?",
    answer:
      "Absolutely. You can cancel your subscription with a single click in your Account Settings. You will continue to have access to Pro features until the end of your current billing period.",
  },
  {
    id: "b3",
    category: "billing",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and UPI via Stripe's encrypted payment processing infrastructure.",
  },

  // Security & Technology
  {
    id: "s1",
    category: "security",
    question: "How secure is my account and data?",
    answer:
      "We utilize modern security best practices including password hashing with Argon2, encrypted session cookies with Strict/Lax samesite policies, multi-factor authentication compatibility, and automated rate-limiting against brute force attacks.",
  },
  {
    id: "s2",
    category: "security",
    question: "Can I export my link and click data?",
    answer:
      "Yes. Pro users can export their complete profile configuration, links, and detailed historical analytics logs in structured CSV or JSON formats at any time.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "general", label: "Getting Started", icon: Sparkles },
  { id: "links", label: "Links & Themes", icon: Sliders },
  { id: "domains", label: "Custom Domains", icon: Globe2 },
  { id: "analytics", label: "Analytics & Telemetry", icon: BarChart3 },
  { id: "billing", label: "Billing & Pro", icon: CreditCard },
  { id: "security", label: "Security & Privacy", icon: Lock },
] as const;

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    g1: true,
    g2: true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <PageTransition className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background ambient gradient */}
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

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn direction="up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <HelpCircle size={14} />
              Help & Knowledge Base
            </div>
          </FadeIn>

          <RevealText
            text="Frequently Asked Questions"
            className="justify-center text-4xl font-extrabold tracking-tight sm:text-6xl"
          />

          <FadeIn delay={0.1} direction="up" className="mt-4">
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
              Have questions about setting up your bio link, configuring custom domains, tracking telemetry, or upgrading to Pro? We have you covered.
            </p>
          </FadeIn>

          {/* Search Input Bar */}
          <FadeIn delay={0.2} direction="up" className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. custom domain, analytics, pricing, SSL)..."
                className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Category Selector Tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        <div className="mt-12 space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <HelpCircle size={40} className="mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-bold text-foreground">No questions matched your search</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching with different keywords or browse all categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = !!openItems[faq.id];

              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-muted/30 cursor-pointer sm:p-6"
                  >
                    <span className="text-base font-bold text-foreground">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-muted-foreground"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="border-t border-border/60 px-5 pb-6 pt-4 sm:px-6 text-sm leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions banner */}
        <div className="mt-20 rounded-3xl border border-border bg-card/60 p-8 sm:p-12 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Still have a question?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Can&apos;t find the answer you&apos;re looking for? Reach out directly to our engineering and support team. We typically respond within a few hours.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/feedback"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Send Us a Message
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-xs font-semibold text-foreground transition-all hover:bg-accent active:scale-[0.98]"
              >
                View Plans & Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
