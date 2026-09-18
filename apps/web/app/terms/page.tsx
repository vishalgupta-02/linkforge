import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, AlertOctagon, Scale, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms, conditions, and usage policies for the LinkForge platform and services.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "September 17, 2026";

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
            <FileText size={14} />
            Legal Agreement
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed md:text-base">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Scale className="h-5 w-5 text-primary" />
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing, creating an account on, or interacting with LinkForge (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access or use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              2. User Accounts and Responsibilities
            </h2>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Accurate Information:</strong> You agree to provide accurate and complete registration information and maintain the security of your account credentials.
                </li>
                <li>
                  <strong className="text-foreground">Username Ownership:</strong> System-reserved keywords (e.g. admin, api, security, support) cannot be registered. We reserve the right to reclaim usernames in cases of trademark infringement or squatting.
                </li>
                <li>
                  <strong className="text-foreground">Account Confidentiality:</strong> You are solely responsible for all activities and content published under your account and public profile.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <ShieldAlert className="h-5 w-5 text-primary" />
              3. Acceptable Use and Prohibited Activities
            </h2>
            <p className="text-muted-foreground">
              LinkForge enforces strict anti-abuse protections to maintain platform safety and reputation. You agree NOT to use the Service to:
            </p>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Create links pointing to malware, phishing portals, illegal substances, or exploitative material.</li>
                <li>Execute open redirect exploits, URL cloaking, or distributed denial of service (DDoS) campaigns.</li>
                <li>Attempt to bypass rate limits, probe private internal network endpoints (SSRF), or perform unauthorized vulnerability scanning.</li>
                <li>Impersonate other individuals, brands, or official services through deceptive profile naming.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <AlertOctagon className="h-5 w-5 text-primary" />
              4. Subscription Plans and Billing
            </h2>
            <p className="text-muted-foreground">
              LinkForge provides Free, Pro, and Business tiers. Paid subscriptions are billed in advance on a recurring monthly or annual basis via Stripe. You may cancel your subscription at any time through the customer billing portal; access continues until the conclusion of the current billing cycle.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              5. Open Source and Intellectual Property
            </h2>
            <p className="text-muted-foreground">
              LinkForge is made available under the open-source MIT License. You retain all copyright and ownership of the original text, imagery, and external URLs you publish on your profile.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              6. Service Availability and Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              The service is provided &quot;as is&quot; and &quot;as available&quot;. While we strive for 99.9% uptime, we do not warrant that operation will be uninterrupted or error-free. In no event shall LinkForge or its contributors be liable for indirect, incidental, or consequential damages arising from service usage.
            </p>
          </section>

          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              7. Contact Us
            </h2>
            <p className="text-muted-foreground">
              For legal notices, terms inquiries, or reporting violations, please reach out via our{" "}
              <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">
                Contact Page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
