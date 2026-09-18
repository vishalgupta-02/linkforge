import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, Database, Eye, Bell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how LinkForge collects, protects, and handles your information and link analytics data.",
};

export default function PrivacyPolicyPage() {
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
            <Shield size={14} />
            Trust & Security
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10 text-sm leading-relaxed md:text-base">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Database className="h-5 w-5 text-primary" />
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground">
              LinkForge provides link management, profile hosting, and real-time click intelligence. In order to provide and improve our service, we collect the following types of information:
            </p>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Account Information:</strong> When you register, we collect your name, email address, password (stored exclusively as cryptographic salted hashes using bcrypt), chosen username, and profile metadata.
                </li>
                <li>
                  <strong className="text-foreground">Authentication & Session Data:</strong> Authentication sessions, authentication tokens, IP address, and login timestamps to secure account access and mitigate unauthorized sessions.
                </li>
                <li>
                  <strong className="text-foreground">Link Configuration:</strong> Destination URLs, link titles, scheduling parameters, position orders, and associated social media handles.
                </li>
                <li>
                  <strong className="text-foreground">Click & Traffic Telemetry:</strong> When visitors access your public profile or click your shortened links, we collect anonymized aggregated telemetry including timestamp, referrers, device family, browser name, and country/geographic region derived from IP.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Eye className="h-5 w-5 text-primary" />
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground">
              The information we collect is utilized strictly for the following functional purposes:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Routing & Delivery</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Executing high-performance redirects to your configured destination URLs and serving public creator profiles.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Analytics Aggregation</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Providing creators with real-time insight into audience engagement, device breakdowns, and geographical distribution.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Security & Fraud Prevention</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Detecting abusive automated bots, open redirect exploits, rate-limit violations, and malicious destination URLs.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Transactional Communications</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sending critical account notices, milestone notifications, subscription updates, and password reset requests.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Lock className="h-5 w-5 text-primary" />
              3. Data Protection & Security Controls
            </h2>
            <p className="text-muted-foreground">
              We apply defense-in-depth security engineering to safeguard all user information:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Encryption in Transit & at Rest:</strong> All web traffic and API endpoints strictly require TLS 1.3 encryption with automated HSTS headers.
              </li>
              <li>
                <strong className="text-foreground">Decoupled Public Identifiers:</strong> Internal database primary keys (UUIDs) are decoupled from public routing using random cryptographically generated public IDs.
              </li>
              <li>
                <strong className="text-foreground">Multi-Tenant Isolation:</strong> Data queries enforce authenticated user ownership validation at the ORM layer (Prisma).
              </li>
              <li>
                <strong className="text-foreground">No Plaintext Credentials:</strong> Passwords and API secrets are never stored in plaintext or logged in server telemetry.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              4. Third-Party Service Providers
            </h2>
            <p className="text-muted-foreground">
              We partner with trusted infrastructure providers to deliver specialized capabilities:
            </p>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Stripe:</strong> Payment processing and subscription management. Payment card information is handled directly by Stripe in compliance with PCI-DSS standards.
                </li>
                <li>
                  <strong className="text-foreground">Resend:</strong> Transactional email delivery for account verification, password resets, and milestone reports.
                </li>
                <li>
                  <strong className="text-foreground">Cloudinary:</strong> Secure cloud asset storage for avatar and media uploads.
                </li>
                <li>
                  <strong className="text-foreground">Sentry:</strong> Real-time error boundary monitoring and performance profiling with sensitive data sanitization.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              5. Your Rights and Data Deletion
            </h2>
            <p className="text-muted-foreground">
              You retain complete ownership over your links and profile. You may update, archive, or permanently delete links and account records directly through your dashboard. For specific data removal inquiries, contact us through our verified channels.
            </p>
          </section>

          <section className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              6. Contact Information
            </h2>
            <p className="text-muted-foreground">
              If you have any questions regarding this Privacy Policy or data handling practices, please contact our team via the{" "}
              <Link href="/contact" className="font-semibold text-primary underline underline-offset-4">
                Contact Page
              </Link>{" "}
              or review our{" "}
              <Link href="/security" className="font-semibold text-primary underline underline-offset-4">
                Security Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
