import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, KeyRound, Server, EyeOff, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Vulnerability Reporting",
  description:
    "Learn about LinkForge's defensive security controls, vulnerability disclosure process, and threat model mitigations.",
};

export default function SecurityPolicyPage() {
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
            <ShieldCheck size={14} />
            Defensive Engineering
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Security & Vulnerability Disclosure
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Our platform security architecture, threat model mitigations, and coordinated disclosure process.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed md:text-base">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <KeyRound className="h-5 w-5 text-primary" />
              1. Core Security Architecture
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Decoupled Identifiers</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Public profile routes and redirect links utilize random cryptographically secure nanoid/alphanumeric tokens, preventing internal database primary key enumeration (IDOR).
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Multi-Tenant Scoping</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All link mutations, soft deletions, and profile updates enforce authenticated session userId ownership verification directly in database queries.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Constant-Time Auth</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Administrative queue endpoints and bearer tokens utilize constant-time cryptographic hash digests to eliminate timing side-channel attacks.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-foreground">Defensive Rate Limiting</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Token bucket rate limiting backed by Redis protects API gateways, authentication endpoints, and public redirect pipelines against brute-force and DDoS attempts.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <Server className="h-5 w-5 text-primary" />
              2. Infrastructure & Transport Protection
            </h2>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">HTTP Security Headers:</strong> Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS with 1-year maxAge and subdomains), X-Content-Type-Options: nosniff, and X-Frame-Options: DENY.
                </li>
                <li>
                  <strong className="text-foreground">Open Redirect & SSRF Defense:</strong> All user-supplied destination URLs are sanitized and validated against malicious schemes (e.g. javascript:, data:, file:) before redirect execution.
                </li>
                <li>
                  <strong className="text-foreground">Error Boundary Isolation:</strong> Stack traces, database schema details, and server internals are suppressed from client API responses and routed to Sentry.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
              <AlertTriangle className="h-5 w-5 text-primary" />
              3. Coordinated Vulnerability Disclosure
            </h2>
            <p className="text-muted-foreground">
              We take the security of our community and creators seriously. If you identify a security issue, please adhere to responsible disclosure practices:
            </p>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Do not perform destructive actions:</strong> Avoid accessing or modifying other users&apos; accounts or degrading service availability.
                </li>
                <li>
                  <strong className="text-foreground">Report confidentially:</strong> Email your technical proof-of-concept and reproduction steps to{" "}
                  <a href="mailto:security@linkforge.bio" className="font-semibold text-primary underline">
                    security@linkforge.bio
                  </a>{" "}
                  or create a confidential GitHub Security Advisory.
                </li>
                <li>
                  <strong className="text-foreground">Triage & Remediation:</strong> Our team will acknowledge reports within 24 hours and provide an estimated timeline for remediation.
                </li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
