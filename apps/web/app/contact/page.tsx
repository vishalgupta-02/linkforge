import React from "react";
import Link from "next/link";
import { Mail, MessageSquare, ArrowLeft, Github, Globe, Shield, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Get in touch with the LinkForge team for inquiries, bug reports, feature suggestions, or security disclosures.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">

        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="mb-12 border-b border-border pb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <MessageSquare size={14} />
            Get in Touch
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Contact & Support
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Have questions or need assistance? Connect directly with our engineering and support team.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Github className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              GitHub Discussions & Issues
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Submit feature requests, report bugs, or participate in open-source roadmap discussions.
            </p>
            <div className="mt-6">
              <a
                href="https://github.com/vishalgupta-02/linkforge/issues"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Open GitHub Issues
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Security Disclosures
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Found a security vulnerability? Follow our coordinated vulnerability disclosure guidelines.
            </p>
            <div className="mt-6">
              <Link
                href="/security"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Security Policy & Guidelines
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              General Inquiries
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              For partnership, billing support, or general platform inquiries.
            </p>
            <div className="mt-6">
              <a
                href="mailto:support@linkforge.bio"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                support@linkforge.bio
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all hover:border-primary/40">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Response Time
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Community inquiries are typically reviewed within 24–48 hours. Critical security reports receive expedited triage within 12 hours.
            </p>
            <div className="mt-6">
              <Link
                href="/privacy"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Review Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
