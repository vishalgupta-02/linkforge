"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="animate-in fade-in flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center duration-300 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
            <AlertCircle size={18} />
          </div>
          <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
            {this.props.fallbackMessage || "Failed to load component"}
          </p>
          <p className="mb-4 text-xs text-zinc-500">
            Something went wrong while rendering this section.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <RefreshCw size={12} /> Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
