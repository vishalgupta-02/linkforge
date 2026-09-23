"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Key,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Zap,
  Activity,
  Layers,
} from "lucide-react";

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  authRequired: boolean;
  requestBody?: string;
  responseBody: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/links",
    summary: "List all creator links with click counts and status",
    authRequired: true,
    responseBody: `{
  "success": true,
  "data": [
    {
      "id": "lnk_9f8a3c2b",
      "publicId": "portfolio",
      "title": "Design Portfolio 2026",
      "url": "https://myportfolio.design",
      "position": 0,
      "counts": 1420,
      "isActive": true
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/v1/links",
    summary: "Create a new bio link",
    authRequired: true,
    requestBody: `{
  "title": "Latest YouTube Video",
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ"
}`,
    responseBody: `{
  "success": true,
  "message": "Link created successfully",
  "data": {
    "id": "lnk_4e7a89bc",
    "publicId": "yt-latest",
    "title": "Latest YouTube Video",
    "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "counts": 0,
    "isActive": true
  }
}`,
  },
  {
    method: "PATCH",
    path: "/api/v1/links/:id",
    summary: "Update link properties, position, or visibility",
    authRequired: true,
    requestBody: `{
  "title": "Updated Title",
  "isActive": false
}`,
    responseBody: `{
  "success": true,
  "message": "Link updated"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/analytics/stats",
    summary: "Retrieve click trends, top referrers, and device breakdown",
    authRequired: true,
    responseBody: `{
  "success": true,
  "data": {
    "totalClicks": 8420,
    "uniqueVisitors": 6120,
    "topCountries": [
      { "code": "US", "name": "United States", "clicks": 3820 },
      { "code": "GB", "name": "United Kingdom", "clicks": 1410 }
    ],
    "devices": { "mobile": "68%", "desktop": "28%", "tablet": "4%" }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/live/presence/:username",
    summary: "Server-Sent Events (SSE) stream of concurrent live visitors",
    authRequired: false,
    responseBody: `event: presence
data: {"username": "creator", "activeCount": 42, "timestamp": 1774351200}`,
  },
  {
    method: "POST",
    path: "/api/v1/waitlist/mobile",
    summary: "Register subscriber email for native mobile app early access",
    authRequired: false,
    requestBody: `{
  "email": "creator@example.com",
  "platform": "ios"
}`,
    responseBody: `{
  "success": true,
  "waitlistNumber": 1421,
  "totalSubscribers": 1421,
  "message": "You're #1421 on the LinkForge Mobile waitlist!"
}`,
  },
];

export default function ApiReferencePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<"curl" | "ts" | "py">("curl");

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurlSnippet = (ep: Endpoint) => {
    return `curl -X ${ep.method} "https://api.linkforge.bio${ep.path}" \\
  -H "Authorization: Bearer lf_live_your_api_key" \\
  -H "Content-Type: application/json"${
    ep.requestBody
      ? ` \\
  -d '${ep.requestBody.replace(/\n/g, "")}'`
      : ""
  }`;
  };

  const getTsSnippet = (ep: Endpoint) => {
    return `const res = await fetch("https://api.linkforge.bio${ep.path}", {
  method: "${ep.method}",
  headers: {
    "Authorization": "Bearer lf_live_your_api_key",
    "Content-Type": "application/json"
  }${ep.requestBody ? `,\n  body: JSON.stringify(${ep.requestBody})` : ""}
});
const data = await res.json();
console.log(data);`;
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        {/* Page Header */}
        <div className="border-border mb-10 flex flex-col justify-between gap-6 border-b pb-8 md:flex-row md:items-center">
          <div>
            <div className="border-primary/20 bg-primary/10 text-primary mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <Code2 size={13} />
              <span>Developer Reference</span>
            </div>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
              LinkForge REST API Reference
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              Standard REST endpoints returning JSON with predictable HTTP status
              codes, bearer token authorization, and sub-10ms edge caching.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/integrations"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
            >
              <Key size={14} />
              <span>Get API Keys</span>
            </Link>
          </div>
        </div>

        {/* Global Spec Callout */}
        <div className="border-border bg-card/50 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border p-6 backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Base URL</span>
            <div className="font-mono text-xs font-bold text-foreground">https://api.linkforge.bio/api/v1</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Authentication</span>
            <div className="font-mono text-xs font-bold text-foreground">Authorization: Bearer lf_live_...</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Rate Limit</span>
            <div className="font-mono text-xs font-bold text-foreground">1,000 req/min (Pro)</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Endpoints List */}
          <div className="space-y-2 lg:col-span-5">
            <h3 className="text-muted-foreground mb-3 text-xs font-bold uppercase tracking-wider">
              Available Endpoints
            </h3>

            {ENDPOINTS.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                      : "border-border bg-card/40 hover:bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          ep.method === "GET"
                            ? "bg-blue-500/20 text-blue-400"
                            : ep.method === "POST"
                              ? "bg-green-500/20 text-green-400"
                              : ep.method === "PATCH"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-semibold text-foreground">{ep.path}</span>
                    </div>

                    {ep.authRequired && (
                      <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                        <Key size={10} /> Auth
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{ep.summary}</p>
                </button>
              );
            })}
          </div>

          {/* Endpoint Detail & Code Sandbox */}
          <div className="space-y-6 lg:col-span-7">
            <div className="border-border bg-card/70 rounded-2xl border p-6 shadow-xl backdrop-blur-md space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      selectedEndpoint.method === "GET"
                        ? "bg-blue-500/20 text-blue-400"
                        : selectedEndpoint.method === "POST"
                          ? "bg-green-500/20 text-green-400"
                          : selectedEndpoint.method === "PATCH"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-bold text-base text-foreground">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{selectedEndpoint.summary}</p>
              </div>

              {/* Code Language Switcher */}
              <div>
                <div className="border-border flex items-center justify-between border-b pb-2 mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveLang("curl")}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono font-semibold ${
                        activeLang === "curl"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setActiveLang("ts")}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono font-semibold ${
                        activeLang === "ts"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      TypeScript
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      copyCode(
                        activeLang === "curl"
                          ? getCurlSnippet(selectedEndpoint)
                          : getTsSnippet(selectedEndpoint),
                      )
                    }
                    className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                  >
                    {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <pre className="border-border bg-background/90 overflow-x-auto rounded-xl border p-4 font-mono text-xs text-muted-foreground">
                  <code>
                    {activeLang === "curl"
                      ? getCurlSnippet(selectedEndpoint)
                      : getTsSnippet(selectedEndpoint)}
                  </code>
                </pre>
              </div>

              {/* Request / Response JSON Schema */}
              <div className="space-y-4">
                {selectedEndpoint.requestBody && (
                  <div>
                    <h4 className="text-muted-foreground mb-2 text-xs font-bold uppercase tracking-wider">
                      Request Body JSON
                    </h4>
                    <pre className="border-border bg-background/90 overflow-x-auto rounded-xl border p-3 font-mono text-xs text-muted-foreground">
                      <code>{selectedEndpoint.requestBody}</code>
                    </pre>
                  </div>
                )}

                <div>
                  <h4 className="text-muted-foreground mb-2 text-xs font-bold uppercase tracking-wider">
                    Response JSON (200 OK)
                  </h4>
                  <pre className="border-border bg-background/90 overflow-x-auto rounded-xl border p-3 font-mono text-xs text-green-400/90">
                    <code>{selectedEndpoint.responseBody}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
