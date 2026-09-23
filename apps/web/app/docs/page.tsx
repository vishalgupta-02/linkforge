"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Zap,
  Code2,
  Activity,
  Layers,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Shield,
  Search,
  ExternalLink,
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  items: { id: string; label: string }[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      { id: "intro", label: "Introduction to LinkForge" },
      { id: "quickstart", label: "5-Minute Quickstart" },
      { id: "architecture", label: "Platform Architecture" },
    ],
  },
  {
    id: "core-features",
    title: "Core Features",
    items: [
      { id: "links-crud", label: "Link Management & Sorting" },
      { id: "socials", label: "Social Matrix Integration" },
      { id: "themes", label: "Custom Themes & Branding" },
      { id: "presence", label: "Live Visitor Presence (SSE)" },
    ],
  },
  {
    id: "telemetry",
    title: "Analytics & Telemetry",
    items: [
      { id: "redirects", label: "Edge Redirection Pipeline" },
      { id: "click-tracking", label: "Click Event Ingestion" },
      { id: "geolocation", label: "GeoIP & Device Attribution" },
    ],
  },
  {
    id: "developer-api",
    title: "API & Extensibility",
    items: [
      { id: "api-keys", label: "API Keys & Authentication" },
      { id: "webhooks", label: "Real-time Webhook Events" },
      { id: "rate-limits", label: "Rate Limits & Quotas" },
    ],
  },
];

export default function DocsPage() {
  const [activeDoc, setActiveDoc] = useState("intro");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        {/* Docs Header */}
        <div className="border-border mb-10 flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
          <div>
            <div className="border-primary/20 bg-primary/10 text-primary mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <BookOpen size={13} />
              <span>Developer & Creator Docs</span>
            </div>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
              LinkForge Documentation
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              Comprehensive guides, architectural overviews, and API references
              to build, customize, and scale your creator presence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/api"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
            >
              <span>REST API Reference</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="relative">
                <Search
                  size={15}
                  className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-border bg-background focus:border-primary h-10 w-full rounded-xl border pr-3 pl-9 text-xs outline-none"
                />
              </div>

              <div className="space-y-6 text-xs">
                {DOC_SECTIONS.map((sec) => (
                  <div key={sec.id}>
                    <h4 className="text-foreground mb-2 font-bold tracking-wider uppercase">
                      {sec.title}
                    </h4>
                    <ul className="space-y-1 border-l border-border/60 pl-3">
                      {sec.items
                        .filter((item) =>
                          item.label
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        )
                        .map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => setActiveDoc(item.id)}
                              className={`w-full text-left py-1 px-2 rounded-lg transition-colors ${
                                activeDoc === item.id
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Article Body */}
          <article className="lg:col-span-3 space-y-8 text-sm leading-relaxed">
            {activeDoc === "intro" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Introduction to LinkForge
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Why LinkForge was engineered from the ground up for modern creators and developers.
                  </p>
                </div>

                <div className="border-border bg-card/50 rounded-2xl border p-6 space-y-4">
                  <h3 className="text-foreground font-bold text-base">The LinkForge Philosophy</h3>
                  <p className="text-muted-foreground">
                    Traditional link-in-bio platforms are bloated with third-party trackers, slow client-side redirects that take 400ms–1500ms, and rigid closed ecosystems. LinkForge solves this with a two-tier architecture:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Sub-10ms Edge Redirection:</strong> Redirection handlers respond with direct HTTP 302 or native mobile deep linking protocols, enqueuing click ingestion asynchronously.
                    </li>
                    <li>
                      <strong className="text-foreground">Real-Time Visitor Presence:</strong> Server-Sent Events (SSE) stream concurrent active audience metrics to creators live without constant polling.
                    </li>
                    <li>
                      <strong className="text-foreground">Full Data Portability:</strong> Creators own 100% of their historical traffic logs, link graph data, and analytics events.
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-border bg-card/40 rounded-xl border p-4">
                    <div className="text-primary font-mono text-2xl font-black">&lt;10ms</div>
                    <div className="text-foreground font-bold text-xs mt-1">Redirect Latency</div>
                    <p className="text-muted-foreground text-[11px] mt-1">Direct edge routing powered by Redis & Express.</p>
                  </div>
                  <div className="border-border bg-card/40 rounded-xl border p-4">
                    <div className="text-primary font-mono text-2xl font-black">100%</div>
                    <div className="text-foreground font-bold text-xs mt-1">Privacy Safe</div>
                    <p className="text-muted-foreground text-[11px] mt-1">Anonymized GeoIP resolution with no cross-site cookies.</p>
                  </div>
                  <div className="border-border bg-card/40 rounded-xl border p-4">
                    <div className="text-primary font-mono text-2xl font-black">20+</div>
                    <div className="text-foreground font-bold text-xs mt-1">Platforms</div>
                    <p className="text-muted-foreground text-[11px] mt-1">Auto-detected social media icons and deep links.</p>
                  </div>
                </div>
              </div>
            )}

            {activeDoc === "quickstart" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    5-Minute Quickstart
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Create your profile, publish your primary links, and share your bio in under five minutes.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-border bg-card/60 rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                      <h4 className="text-foreground font-bold text-sm">Claim your creator username</h4>
                    </div>
                    <p className="text-muted-foreground text-xs mt-2 pl-9">
                      Register an account with email or GitHub OAuth. Your handle will instantly resolve at <code className="bg-muted px-1.5 py-0.5 rounded font-mono">linkforge.bio/username</code>.
                    </p>
                  </div>

                  <div className="border-border bg-card/60 rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                      <h4 className="text-foreground font-bold text-sm">Add your essential links & socials</h4>
                    </div>
                    <p className="text-muted-foreground text-xs mt-2 pl-9">
                      In the Links dashboard, click "Add New Link". Paste destination URLs. LinkForge automatically resolves icons for YouTube, GitHub, Twitter, Spotify, and more.
                    </p>
                  </div>

                  <div className="border-border bg-card/60 rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                      <h4 className="text-foreground font-bold text-sm">Reorder links with drag-and-drop</h4>
                    </div>
                    <p className="text-muted-foreground text-xs mt-2 pl-9">
                      Use the grab handles to arrange your links. Order is saved optimistically with immediate edge cache invalidation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeDoc !== "intro" && activeDoc !== "quickstart" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl capitalize">
                    {activeDoc.replace("-", " ")}
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Detailed technical documentation and implementation reference for {activeDoc}.
                  </p>
                </div>

                <div className="border-border bg-card/50 rounded-2xl border p-6 space-y-4">
                  <h3 className="text-foreground font-bold text-base">Key Capabilities</h3>
                  <p className="text-muted-foreground">
                    LinkForge provides native APIs, real-time BullMQ background workers, and edge-first routing to ensure high reliability and zero downtime.
                  </p>
                  <pre className="border-border bg-background/80 overflow-x-auto rounded-xl border p-4 font-mono text-xs text-muted-foreground">
                    <code>{`// Sample LinkForge API Request
const response = await fetch("https://api.linkforge.bio/api/v1/links", {
  headers: {
    "Authorization": "Bearer lf_live_your_token",
    "Content-Type": "application/json"
  }
});
const links = await response.json();`}</code>
                  </pre>
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
