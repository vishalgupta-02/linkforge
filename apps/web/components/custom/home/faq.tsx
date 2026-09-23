"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const HOME_FAQS = [
  {
    id: "h1",
    question: "Is LinkForge completely free to get started?",
    answer:
      "Yes! LinkForge offers a permanent Free plan that includes up to 8 links, basic light/dark themes, click analytics, and your unique public profile URL. Upgrade to Pro only when you need custom domains, unlimited links, all 8+ themes, or real-time visitor presence.",
  },
  {
    id: "h2",
    question: "Can I connect my own custom domain (e.g. links.mybrand.com)?",
    answer:
      "Absolutely. Pro users can attach any custom apex domain or subdomain in seconds. We automatically generate, deploy, and auto-renew a free Let's Encrypt SSL/TLS certificate for total brand authority.",
  },
  {
    id: "h3",
    question: "What is the 'Live Visitor Telemetry' feature?",
    answer:
      "LinkForge provides live, sub-second visitor presence counters on your dashboard and public profile. You can see how many audience members are viewing your links in real-time during live streams, product drops, or viral campaigns.",
  },
  {
    id: "h4",
    question: "How fast are link redirects and does LinkForge add tracking delays?",
    answer:
      "Our redirect engine runs on globally distributed edge networks with sub-10ms response times. We never show intermediate sponsor splash pages or inject intrusive tracking bloat.",
  },
  {
    id: "h5",
    question: "Can I customize the visual styling and layout of my page?",
    answer:
      "Yes! Choose from curated designer themes (Obsidian, Tokyo Neon, Alabaster Clean, and more), customize button borders and corner radius, add social icon matrices, and personalize your creator bio with zero coding.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-28 border-t border-zinc-200 dark:border-white/5 bg-background">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles size={13} />
            Got Questions?
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Quick answers to the most common questions about LinkForge.
          </p>
        </div>

        <div className="space-y-4">
          {HOME_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border border-border bg-card/80 transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
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
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="border-t border-border/60 px-5 pb-6 pt-3.5 sm:px-6 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Link to dedicated FAQ page */}
        <div className="mt-12 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-accent active:scale-[0.98]"
          >
            <span>Explore all questions in our FAQ Knowledge Base</span>
            <ArrowRight size={15} className="text-primary" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
