"use client";

import React from "react";
import { useLiveVisitors } from "@/hooks/use-live-visitors";
import { Eye, Lock } from "lucide-react";

interface LiveVisitorsProps {
  username: string;
  isPro?: boolean;
}

export function LiveVisitors({ username, isPro = false }: LiveVisitorsProps) {
  const { visitors, connected } = useLiveVisitors(username, isPro);

  if (!isPro) {
    return (
      <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
            <Eye size={12} /> Live Visitors
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Lock size={10} /> Pro
          </span>
        </div>

        <h3 className="text-2xl font-semibold tracking-tight text-muted-foreground">
          —
        </h3>

        <p className="text-muted-foreground mt-1 text-xs">
          Available on Pro plan
        </p>
      </div>
    );
  }

  return (
    <div className="border-border bg-background rounded-xl border p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <Eye size={12} /> Live Visitors
        </p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            connected
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          {connected ? "Live" : "Connecting..."}
        </span>
      </div>

      <h3 className="text-2xl font-semibold tracking-tight">
        {visitors.toLocaleString()}
      </h3>

      <p className="text-muted-foreground mt-1 text-xs">
        {connected
          ? visitors === 1
            ? "1 person viewing your profile"
            : `${visitors} people viewing your profile`
          : "Connecting..."}
      </p>
    </div>
  );
}

export default LiveVisitors;

