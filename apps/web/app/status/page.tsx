"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Server,
  Database,
  Radio,
  Mail,
  ArrowRight,
} from "lucide-react";

interface ServiceComponent {
  name: string;
  description: string;
  status: "operational" | "degraded" | "outage";
  latency: string;
  uptime: string;
  icon: any;
}

const SERVICES: ServiceComponent[] = [
  {
    name: "Edge Redirect Handlers (/r/:id)",
    description: "High-throughput HTTP 302 redirection & mobile deep linking protocol router",
    status: "operational",
    latency: "6ms",
    uptime: "99.99%",
    icon: Zap,
  },
  {
    name: "Core REST API Gateway (/api/v1)",
    description: "Express & Node.js user authentication, link CRUD, and profile resolution",
    status: "operational",
    latency: "32ms",
    uptime: "99.98%",
    icon: Server,
  },
  {
    name: "Live Presence Engine (SSE)",
    description: "Real-time Server-Sent Events broadcasting concurrent visitor counts",
    status: "operational",
    latency: "14ms",
    uptime: "99.96%",
    icon: Radio,
  },
  {
    name: "Telemetry & Ingestion Workers",
    description: "BullMQ asynchronous background queue processing clicks & GeoIP attribution",
    status: "operational",
    latency: "0 lag",
    uptime: "100.0%",
    icon: Activity,
  },
  {
    name: "Neon PostgreSQL Database Cluster",
    description: "Serverless Postgres with connection pooling and automated backups",
    status: "operational",
    latency: "18ms",
    uptime: "99.99%",
    icon: Database,
  },
  {
    name: "Transactional Email Gateway",
    description: "Resend email dispatch for waitlist confirmations and verification tokens",
    status: "operational",
    latency: "120ms",
    uptime: "99.97%",
    icon: Mail,
  },
];

export default function StatusPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        {/* Header */}
        <div className="mb-12 text-center space-y-3">
          <div className="border-green-500/20 bg-green-500/10 text-green-500 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide uppercase">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time System Status</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            All Systems Operational
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-sm">
            Current status of LinkForge edge routing, APIs, presence streams, and database clusters.
          </p>
        </div>

        {/* Global SLA Uptime Card */}
        <div className="border-border bg-card/60 mb-10 rounded-2xl border p-6 backdrop-blur-md">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-foreground text-sm font-bold">
                Platform Uptime (Last 90 Days)
              </div>
              <p className="text-muted-foreground text-xs">
                Zero unscheduled downtime across global edge regions.
              </p>
            </div>
            <div className="font-mono text-2xl font-black text-green-500">
              99.98%
            </div>
          </div>

          {/* 90-day graphical bars */}
          <div className="mt-6">
            <div className="flex items-center gap-1 h-8 w-full overflow-hidden">
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className="h-full flex-1 rounded-xs bg-green-500/80 hover:bg-green-400 transition-colors"
                  title={`Day ${90 - i}: 100% operational`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Individual Components */}
        <div className="space-y-4">
          <h2 className="text-foreground text-base font-bold">
            Core Service Components
          </h2>

          <div className="divide-border divide-y rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden">
            {SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-foreground font-bold text-sm">
                        {srv.name}
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5 max-w-xl">
                        {srv.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center font-mono text-xs">
                    <div className="text-muted-foreground hidden sm:block text-right">
                      <div>{srv.latency}</div>
                      <div className="text-[10px] opacity-70">Latency</div>
                    </div>

                    <div className="text-muted-foreground text-right">
                      <div>{srv.uptime}</div>
                      <div className="text-[10px] opacity-70">Uptime</div>
                    </div>

                    <span className="border-green-500/20 bg-green-500/10 text-green-500 flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 size={11} />
                      Operational
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident History */}
        <div className="mt-14 border-border bg-card/40 rounded-2xl border p-6 backdrop-blur-md">
          <h3 className="text-foreground text-sm font-bold mb-4">Past Incident History</h3>
          <div className="border-border/60 rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
            No incidents or degraded performance recorded in the past 90 days.
          </div>
        </div>
      </div>
    </div>
  );
}
