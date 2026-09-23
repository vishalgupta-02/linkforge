"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquarePlus,
  Star,
  Bug,
  Lightbulb,
  CreditCard,
  HelpCircle,
  Zap,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Send,
  Heart,
  ShieldCheck,
  Globe,
  User,
  Mail,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { submitFeedback } from "@/apis/feedback";
import { authClient } from "@/lib/auth-client";
import {
  FadeIn,
  FadeInStagger,
  FadeInStaggerItem,
  GlowCard,
  RevealText,
  PageTransition,
} from "@/components/animations";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  {
    id: "general",
    label: "General Feedback",
    desc: "Overall experience, UI impressions, or workflow ideas",
    icon: MessageSquarePlus,
  },
  {
    id: "feature",
    label: "Feature Request",
    desc: "New tools, link types, bio themes, or analytics metrics",
    icon: Lightbulb,
  },
  {
    id: "bug",
    label: "Bug Report",
    desc: "Something not working as expected, glitches, or errors",
    icon: Bug,
  },
  {
    id: "billing",
    label: "Billing & Pro",
    desc: "Pricing feedback, Pro subscriptions, or payment features",
    icon: CreditCard,
  },
  {
    id: "question",
    label: "Integration & API",
    desc: "Custom domains, webhook integrations, or developer tools",
    icon: Zap,
  },
  {
    id: "other",
    label: "Other Thoughts",
    desc: "Partnerships, creator suggestions, or general inquiry",
    icon: HelpCircle,
  },
] as const;

const QUICK_TAGS = [
  "Ultra-Fast Redirects",
  "Real-time Analytics",
  "Custom Bio Themes",
  "Mobile Experience",
  "Custom Domain Setup",
  "Social Media Links",
  "Pro Subscription",
];

const RATING_DESCRIPTIONS: Record<number, { text: string; icon: string }> = {
  5: { text: "Outstanding — LinkForge is exceptional!", icon: "" },
  4: { text: "Great — Very satisfied with the experience", icon: "" },
  3: { text: "Good — Working well with room to grow", icon: "" },
  2: { text: "Needs Work — Experienced some friction", icon: "" },
  1: { text: "Frustrating — Encountered major blockers", icon: "" },
};

function FeedbackPageContent() {
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<
    "general" | "bug" | "feature" | "billing" | "question" | "other"
  >("general");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<{
    name?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (
      cat &&
      ["general", "bug", "feature", "billing", "question", "other"].includes(
        cat,
      )
    ) {
      setCategory(cat as any);
    }

    authClient
      ?.getSession()
      .then((session) => {
        if (session.data?.user) {
          setUserSession({
            name: session.data.user.name,
            email: session.data.user.email,
          });
          if (session.data.user.name) setName(session.data.user.name);
          if (session.data.user.email) setEmail(session.data.user.email);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.replace(/^[^\s]+\s/, "");
    if (message.includes(cleanTag)) return;
    setMessage((prev) =>
      prev
        ? `${prev}\n• Feedback regarding: ${cleanTag}`
        : `Feedback regarding: ${cleanTag}`,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || message.trim().length < 5) {
      toast.error(
        "Please provide at least 5 characters in your feedback message.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        category,
        rating,
        message: message.trim(),
      });

      setIsSubmitted(true);
      toast.success(
        "Thank you! Your feedback has been sent directly to the engineering team.",
      );
    } catch (err: any) {
      toast.error(
        err.message || "Failed to submit feedback. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <PageTransition className="bg-background text-foreground relative min-h-screen transition-colors duration-300">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay dark:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(150,150,150,0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-32 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-secondary/10 absolute top-1/2 -right-32 h-72 w-72 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <FadeIn direction="up">
            <div className="border-primary/20 bg-primary/10 text-primary mb-3 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold">
              <ArrowUpRight size={13} />
              Direct Channel to LinkForge Team
            </div>
          </FadeIn>

          <RevealText
            text="Help Us Shape the Future of LinkForge"
            className="text-foreground justify-center text-3xl font-extrabold tracking-tight sm:text-5xl"
          />

          <FadeIn delay={0.15} direction="up" className="mt-4">
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm font-medium sm:text-base">
              Your insights drive our roadmap. Every bug report, feature
              suggestion, and rating is directly delivered to our core
              engineering team.
            </p>
          </FadeIn>
        </div>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-xl"
            >
              <GlowCard className="border-border bg-card p-8 text-center shadow-md sm:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5 dark:text-emerald-400">
                  <CheckCircle2 size={42} className="stroke-[2.5]" />
                </div>

                <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                  Feedback Received!
                </h2>

                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  We&apos;ve dispatched your submission to{" "}
                  <strong className="text-foreground font-semibold">
                    abhimanyug987@gmail.com
                  </strong>
                  . Our team will review your notes and factor them into
                  upcoming releases.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/dashboard"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] sm:w-auto"
                  >
                    Go to Dashboard
                    <ArrowRight size={16} />
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage("");
                    }}
                    className="border-border hover:bg-accent h-11 w-full cursor-pointer rounded-xl text-sm font-medium sm:w-auto"
                  >
                    <RotateCcw size={15} className="mr-2" />
                    Submit Another Feedback
                  </Button>
                </div>
              </GlowCard>
            </motion.div>
          ) : (
            <motion.div
              key="feedback-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-8 lg:grid-cols-12"
            >
              <div className="space-y-8 lg:col-span-12">
                <GlowCard className="border-border bg-card p-6 sm:p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <span className="text-primary text-xs font-bold tracking-wider uppercase">
                        Step 1
                      </span>
                      <h3 className="text-foreground text-lg font-bold">
                        What are you contacting us about?
                      </h3>
                    </div>
                  </div>

                  <FadeInStagger className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;

                      return (
                        <FadeInStaggerItem key={cat.id}>
                          <button
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`group relative flex w-full cursor-pointer items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-200 ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-primary/20 text-foreground shadow-xs ring-2"
                                : "border-border bg-card/60 hover:border-primary/40 hover:bg-accent/40 text-foreground"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:text-primary"
                              }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-foreground text-sm font-semibold">
                                {cat.label}
                              </h4>
                              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                                {cat.desc}
                              </p>
                            </div>
                          </button>
                        </FadeInStaggerItem>
                      );
                    })}
                  </FadeInStagger>
                </GlowCard>

                <GlowCard className="border-border bg-card p-6 sm:p-7">
                  <div className="mb-4">
                    <span className="text-primary text-xs font-bold tracking-wider uppercase">
                      Step 2
                    </span>
                    <h3 className="text-foreground text-lg font-bold">
                      Rate your overall experience
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="focus-visible:ring-primary cursor-pointer rounded-lg p-1.5 focus:outline-none focus-visible:ring-2"
                        >
                          <Star
                            size={32}
                            className={`transition-colors duration-150 ${
                              activeRating >= star
                                ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                : "fill-muted text-muted-foreground/30"
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>

                    <div className="border-border bg-muted/60 text-foreground rounded-xl border px-4 py-2 text-xs font-semibold">
                      <span className="mr-1.5 text-sm">
                        {RATING_DESCRIPTIONS[activeRating]?.icon}
                      </span>
                      {RATING_DESCRIPTIONS[activeRating]?.text}
                    </div>
                  </div>
                </GlowCard>

                <GlowCard className="border-border bg-card p-6 sm:p-7">
                  <div className="mb-6 flex flex-col gap-2">
                    <span className="text-primary text-xs font-bold tracking-wider uppercase">
                      Step 3
                    </span>
                    <h3 className="text-foreground text-lg font-bold">
                      Your Detailed Thoughts
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Be as specific as you like. Code snippets, bug steps, or
                      feature visions are welcome.
                    </p>
                  </div>

                  <div className="mb-4 flex flex-col gap-2">
                    <span className="text-muted-foreground text-[11px] font-medium">
                      Quickly mention a topic:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <textarea
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What's working well? What could be enhanced or fixed? Tell us what would make LinkForge 10x better for you..."
                        required
                        disabled={isSubmitting}
                        className="border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:ring-2 focus:outline-none"
                      />
                      <div className="text-muted-foreground absolute right-3 bottom-3 font-mono text-[11px]">
                        {message.length}/3000
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                          <User size={13} className="text-muted-foreground" />
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Rivera"
                          disabled={isSubmitting}
                          className="border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border px-3.5 text-sm transition-colors focus:ring-2 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                          <Mail size={13} className="text-muted-foreground" />
                          Email for Follow-up (Optional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          disabled={isSubmitting}
                          className="border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border px-3.5 text-sm transition-colors focus:ring-2 focus:outline-none"
                        />
                      </div>
                    </div>

                    {userSession && (
                      <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={14} />
                        Connected with account: {userSession.email}
                      </div>
                    )}

                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || message.trim().length < 5}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Dispatching Feedback...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Submit Feedback
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </GlowCard>
              </div>

              <div className="space-y-6 lg:col-span-12">
                <GlowCard className="border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Heart size={20} />
                    </div>
                    <div>
                      <h4 className="text-foreground text-sm font-bold">
                        Built for Serious Creators & Developers
                      </h4>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        We ship product enhancements every week. Your
                        suggestions shape upcoming analytics features, theme
                        engines, and creator integrations.
                      </p>
                    </div>
                  </div>
                </GlowCard>

                <GlowCard className="border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary/20 text-secondary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Globe size={20} className="text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-foreground text-sm font-bold">
                        Protected Delivery Queue
                      </h4>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        All incoming submissions are rate-limited and filtered
                        through our protected queue workers.
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default function FullFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <FeedbackPageContent />
    </Suspense>
  );
}
