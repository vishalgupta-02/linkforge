'use client'

// ─────────────────────────────────────────────
// LinkFlow — Loading Component
//
// Usage:
//   <Loading />                        full page, default message
//   <Loading message="Fetching links" />
//   <Loading size="sm" />              smaller variant (card/section)
//
// Props:
//   message? : string   — optional label under the animation
//   size?    : "sm" | "md" (default "md")
//   fullPage?: boolean  (default true) — centers in viewport
// ─────────────────────────────────────────────

type LoadingProps = {
  message?: string
  size?: 'sm' | 'md'
  fullPage?: boolean
}

export default function Loading({
  message,
  size = 'md',
  fullPage = true,
}: LoadingProps) {
  const isSm = size === 'sm'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');

        @keyframes lf-breathe {
          0%, 100% { opacity: 0.15; transform: scale(0.92); }
          50%       { opacity: 0.55; transform: scale(1.08); }
        }
        @keyframes lf-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lf-ring-spin-reverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes lf-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lf-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1); }
        }

        .lf-glow {
          animation: lf-breathe 2.4s ease-in-out infinite;
        }
        .lf-ring-outer {
          animation: lf-ring-spin 2.8s linear infinite;
        }
        .lf-ring-inner {
          animation: lf-ring-spin-reverse 1.8s linear infinite;
        }
        .lf-message {
          animation: lf-fade-in 0.5s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.3s;
        }
        .lf-dot:nth-child(1) { animation: lf-dot-pulse 1.4s ease-in-out 0s    infinite; }
        .lf-dot:nth-child(2) { animation: lf-dot-pulse 1.4s ease-in-out 0.2s  infinite; }
        .lf-dot:nth-child(3) { animation: lf-dot-pulse 1.4s ease-in-out 0.4s  infinite; }
      `}</style>

      <div
        style={{
          ...(fullPage
            ? {
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0d0d0d',
              }
            : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
              }),
          fontFamily: "'DM Sans', sans-serif",
        }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isSm ? 16 : 24,
          }}>
          {/* ── Logo + ring stack ── */}
          <div
            style={{
              position: 'relative',
              width: isSm ? 56 : 72,
              height: isSm ? 56 : 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {/* Warm glow blob behind everything */}
            <div
              className='lf-glow'
              style={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(232,98,42,0.22) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />

            {/* Outer ring — sparse dashes */}
            <svg
              className='lf-ring-outer'
              style={{ position: 'absolute', inset: 0 }}
              width='100%'
              height='100%'
              viewBox='0 0 72 72'>
              <circle
                cx='36'
                cy='36'
                r='32'
                fill='none'
                stroke='rgba(232,98,42,0.35)'
                strokeWidth='1.5'
                strokeDasharray='6 14'
                strokeLinecap='round'
              />
            </svg>

            {/* Inner ring — solid arc */}
            <svg
              className='lf-ring-inner'
              style={{ position: 'absolute', inset: 8 }}
              width='calc(100% - 16px)'
              height='calc(100% - 16px)'
              viewBox='0 0 56 56'>
              <circle
                cx='28'
                cy='28'
                r='24'
                fill='none'
                stroke='rgba(255,255,255,0.08)'
                strokeWidth='1'
              />
              <circle
                cx='28'
                cy='28'
                r='24'
                fill='none'
                stroke='#e8622a'
                strokeWidth='1.5'
                strokeDasharray='38 113'
                strokeLinecap='round'
              />
            </svg>

            {/* Center logo mark */}
            <div
              style={{
                width: isSm ? 28 : 36,
                height: isSm ? 28 : 36,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}>
              <svg
                width={isSm ? 13 : 16}
                height={isSm ? 13 : 16}
                viewBox='0 0 16 16'
                fill='none'>
                <path
                  d='M8 2v12M2 8h12'
                  stroke='#e8622a'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                />
              </svg>
            </div>
          </div>

          {/* ── Text + dots ── */}
          <div
            className='lf-message'
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}>
            {/* Wordmark */}
            {!isSm && (
              <span
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 17,
                  color: 'rgba(255,255,255,0.55)',
                  letterSpacing: '-0.01em',
                }}>
                LinkFlow
              </span>
            )}

            {/* Contextual message */}
            {message && (
              <span
                style={{
                  fontSize: isSm ? 12 : 13,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.01em',
                }}>
                {message}
              </span>
            )}

            {/* Animated dots */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className='lf-dot'
                  style={{
                    width: isSm ? 4 : 5,
                    height: isSm ? 4 : 5,
                    borderRadius: '50%',
                    background: '#e8622a',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
