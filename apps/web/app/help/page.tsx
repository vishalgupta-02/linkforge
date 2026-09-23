"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  BookOpen,
  CreditCard,
  BarChart3,
  Shield,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  Mail,
  Zap,
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "getting-started",
    q: "How do I claim and customize my public creator handle?",
    a: "During signup or in your Profile settings, pick any available username. Your public bio page instantly resolves at linkforge.bio/yourhandle. You can update your display name, avatar, and bio at any time with zero downtime.",
  },
  {
    category: "links",
    q: "How does drag-and-drop link reordering work?",
    a: "Navigate to your Links dashboard and drag any link using the grip handle. The ordering updates immediately in the UI and synchronizes with our database and edge cache in milliseconds.",
  },
  {
    category: "analytics",
    q: "How fast are click events recorded in my dashboard?",
    a: "LinkForge processes clicks asynchronously through BullMQ distributed workers. Your audience is redirected in under 10ms, while click telemetry, country data, and device types appear in your analytics within 2–5 seconds.",
  },
  {
    category: "billing",
    q: "How do I cancel or modify my Pro subscription?",
    a: "Go to Dashboard > Settings > Billing and click 'Manage Stripe Subscription'. You'll be redirected to the secure Stripe Customer Portal where you can update payment methods, switch intervals, or cancel anytime.",
  },
  {
    category: "mobile",
    q: "When will the native iOS and Android apps launch?",
    a: "The LinkForge mobile apps are currently in private TestFlight and Play Store beta. You can secure your spot and queue position on our /mobile waitlist page.",
  },
  {
    category: "developers",
    q: "Can I use LinkForge programmatically with an API key?",
    a: "Yes! Navigate to Dashboard > Integrations to generate a scoped API key (lf_live_...) and register signed webhook endpoints. Complete instructions are available in our /api reference.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        {/* Header */}
        <div className="mb-12 text-center space-y-3">
          <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
            <HelpCircle size={13} />
            <span>Support & Help Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            How can we help you today?
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">
            Search our knowledge base or browse frequently asked questions below.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-6 max-w-lg relative">
            <Search
              size={16}
              className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Search guides, billing, links, or telemetry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border bg-card/60 focus:border-primary focus:ring-primary/20 h-12 w-full rounded-2xl border pr-4 pl-11 text-xs outline-none backdrop-blur-md transition-all focus:ring-4"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 text-xs font-semibold">
          {[
            { id: "all", label: "All Topics" },
            { id: "getting-started", label: "Getting Started" },
            { id: "links", label: "Links & Bio" },
            { id: "analytics", label: "Analytics & Clicks" },
            { id: "billing", label: "Billing & Pro" },
            { id: "developers", label: "Developer API" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-xl px-4 py-2 border transition-all ${
                activeCategory === cat.id
                  ? "border-primary bg-primary text-primary-foreground font-bold"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border-border bg-card/50 rounded-2xl border transition-all backdrop-blur-md"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-foreground"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-border/60 border-t px-5 pt-3 pb-5 text-xs leading-relaxed text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support Card */}
        <div className="border-border bg-card/40 mt-16 rounded-2xl border p-8 text-center backdrop-blur-md space-y-4">
          <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <MessageSquare size={22} />
          </div>
          <h3 className="text-foreground text-xl font-bold">Still have questions?</h3>
          <p className="text-muted-foreground text-xs max-w-md mx-auto">
            Our support engineers and creators team respond to inquiries directly.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/feedback"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all"
            >
              <span>Send Message</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/contact"
              className="border-border bg-card hover:bg-muted text-foreground flex items-center gap-2 rounded-xl border px-5 py-2.5 text-xs font-semibold transition-all"
            >
              <span>Contact Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
