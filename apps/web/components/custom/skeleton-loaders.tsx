// components/SkeletonLoaders.tsx
import React from "react";

// Base skeleton utility
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-200 dark:bg-white/10 ${className}`}
    />
  );
}

// Specific implementation: The Links List Loader
export function LinkListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/5 dark:bg-[#111]"
        >
          {/* Drag Handle & Icon Skeleton */}
          <div className="flex shrink-0 items-center gap-3">
            <Skeleton className="h-5 w-4 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>

          {/* Text Skeletons */}
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>

          {/* Toggle Skeleton */}
          <div className="shrink-0 border-l border-zinc-100 pl-4 dark:border-white/5">
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
