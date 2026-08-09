"use client";

// ─────────────────────────────────────────────
// LinkFlow — Empty State Components
//
// EXPORTS:
//   <EmptyAnalytics />          — analytics has no data yet
//   <EmptyLinks />              — user has no links yet
//   <EmptyActivity />           — no recent activity
//   <EmptyLocations />          — no location data yet
//
// All accept an optional `action` prop for a CTA button:
//   <EmptyAnalytics action={{ label: "Share my link", onClick: () => {} }} />
// ─────────────────────────────────────────────

import Link from "next/link";

type Action = {
  label: string;
  onClick?: () => void;
  href?: string;
};

type EmptyProps = {
  action?: Action;
};

// ── Shared wrapper
function EmptyWrapper({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center transition-colors hover:border-gray-400 ${compact ? "px-6 py-10" : "px-8 py-16"} `}
    >
      {children}
    </div>
  );
}

// ── Shared CTA button
function EmptyCTA({ action }: { action: Action }) {
  const cls = `
    inline-flex items-center gap-2 mt-6
    h-10 px-5 rounded-xl
    bg-[#e8622a] hover:bg-[#d4571f]
    text-white text-[13px] font-semibold
    transition-all active:scale-95
  `;

  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {action.label}
        <svg
          width="13"
          height="13"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </Link>
    );
  }

  return (
    <button onClick={action.onClick} className={cls}>
      {action.label}
      <svg
        width="13"
        height="13"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
        />
      </svg>
    </button>
  );
}

// ══ 1. EMPTY ANALYTICS ══════════════════════════
export function EmptyAnalytics({ action }: EmptyProps) {
  return (
    <EmptyWrapper>
      {/* Ghost chart illustration */}
      <div className="relative mb-6 h-24 w-48">
        {/* Ghost bars */}
        {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-t-md"
            style={{
              left: `${i * 14.5}%`,
              width: "10%",
              height: `${h}%`,
              background: `rgba(232,98,42,${0.04 + i * 0.01})`,
              border: "1px solid rgba(232,98,42,0.08)",
              animation: `lf-empty-pulse 2.4s ease-in-out ${i * 0.15}s infinite alternate`,
            }}
          />
        ))}

        {/* Dashed baseline */}
        <div className="absolute right-0 bottom-0 left-0 h-px border-b border-dashed border-gray-300" />

        {/* Floating question mark */}
        <div
          className="absolute -top-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-[#e8622a]/20 bg-[#e8622a]/10"
          style={{
            animation: "lf-empty-float 3s ease-in-out infinite alternate",
          }}
        >
          <span
            className="text-sm font-bold text-[#e8622a]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            ?
          </span>
        </div>
      </div>

      <h3
        className="mb-2 text-[15px] font-semibold text-gray-900"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        No data yet
      </h3>
      <p className="max-w-[260px] text-[13px] leading-relaxed text-gray-600">
        Start sharing your link to see clicks, locations, and device data appear
        here.
      </p>

      {/* Steps hint */}
      <div className="mt-5 flex w-full max-w-[240px] flex-col gap-2">
        {[
          "Copy your LinkFlow URL",
          "Share it on your socials",
          "Watch the data roll in",
        ].map((step, i) => (
          <div key={step} className="flex items-center gap-3 text-left">
            <span
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                background: "rgba(232,98,42,0.12)",
                color: "#e8622a",
                border: "1px solid rgba(232,98,42,0.2)",
              }}
            >
              {i + 1}
            </span>
            <span className="text-[12px] text-gray-600">{step}</span>
          </div>
        ))}
      </div>

      {action && <EmptyCTA action={action} />}
    </EmptyWrapper>
  );
}

// ══ 2. EMPTY LINKS ═══════════════════════════
export function EmptyLinks({ action }: EmptyProps) {
  return (
    <EmptyWrapper>
      {/* Chain icon illustration */}
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(232,98,42,0.08)",
          border: "1px solid rgba(232,98,42,0.15)",
          animation: "lf-empty-float 3.5s ease-in-out infinite alternate",
        }}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#e8622a"
          strokeWidth={1.6}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
          />
        </svg>
      </div>

      <h3
        className="mb-2 text-[15px] font-semibold text-gray-900"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        No links yet
      </h3>
      <p className="max-w-[240px] text-[13px] leading-relaxed text-gray-600">
        Add your first link and start building your page. It takes 10 seconds.
      </p>

      {action && <EmptyCTA action={action} />}
    </EmptyWrapper>
  );
}

// ══ 3. EMPTY ACTIVITY ════════════════════════
export function EmptyActivity({ action }: EmptyProps) {
  return (
    <EmptyWrapper compact>
      {/* Ghost activity rows */}
      <div className="mb-5 flex w-full max-w-[180px] flex-col gap-2">
        {[100, 80, 90].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-6 w-6 flex-shrink-0 rounded-lg"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.06)",
                animation: `lf-empty-pulse 2s ease-in-out ${i * 0.2}s infinite alternate`,
              }}
            />
            <div
              className="h-2 rounded-full"
              style={{
                width: `${w}%`,
                background: "rgba(0,0,0,0.04)",
                animation: `lf-empty-pulse 2s ease-in-out ${i * 0.25}s infinite alternate`,
              }}
            />
          </div>
        ))}
      </div>

      <h3 className="mb-1.5 text-[14px] font-semibold text-gray-900">
        Quiet in here
      </h3>
      <p className="max-w-[200px] text-[12.5px] leading-relaxed text-gray-600">
        Activity will show up here as soon as someone clicks your links.
      </p>

      {action && <EmptyCTA action={action} />}
    </EmptyWrapper>
  );
}

// ══ 4. EMPTY LOCATIONS ═══════════════════════
export function EmptyLocations({ action }: EmptyProps) {
  return (
    <EmptyWrapper compact>
      {/* Globe icon */}
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(74,158,255,0.07)",
          border: "1px solid rgba(74,158,255,0.15)",
          animation: "lf-empty-float 4s ease-in-out infinite alternate",
        }}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#4a9eff"
          strokeWidth={1.6}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253"
          />
        </svg>
      </div>

      <h3 className="mb-1.5 text-[14px] font-semibold text-white/70">
        No locations yet
      </h3>
      <p className="max-w-[210px] text-[12.5px] leading-relaxed text-white/30">
        Once people start clicking your links, you&apos;ll see where in the
        world they&apos;re from.
      </p>

      {action && <EmptyCTA action={action} />}
    </EmptyWrapper>
  );
}

// ── Global keyframes (injected once)
export function EmptyStateStyles() {
  return (
    <style>{`
      @keyframes lf-empty-pulse {
        from { opacity: 0.3; }
        to   { opacity: 0.7; }
      }
      @keyframes lf-empty-float {
        from { transform: translateY(0px); }
        to   { transform: translateY(-6px); }
      }
    `}</style>
  );
}
