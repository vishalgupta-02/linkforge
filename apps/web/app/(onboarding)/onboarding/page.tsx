'use client'

// ─────────────────────────────────────────────
// LinkFlow — Onboarding Flow
// Route: app/onboarding/page.tsx
//
// Steps:
//   1. Set username + display name
//   2. Add first link
//   3. Share your page
//
// On completion → router.push("/dashboard")
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Types
type Step = 1 | 2 | 3

type OnboardingState = {
  username: string
  displayName: string
  bio: string
  linkTitle: string
  linkUrl: string
}

// ── Progress bar
function ProgressBar({ step }: { step: Step }) {
  const pct = ((step - 1) / 2) * 100
  const labels = ['Your profile', 'First link', 'Share']

  return (
    <div className='w-full max-w-sm mx-auto'>
      {/* Step labels */}
      <div className='flex justify-between mb-3'>
        {labels.map((label, i) => {
          const s = (i + 1) as Step
          const done = step > s
          const active = step === s
          return (
            <div key={label} className='flex flex-col items-center gap-1.5'>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                  done
                    ? 'bg-[#e8622a] text-white'
                    : active
                      ? 'bg-[#e8622a]/15 border-2 border-[#e8622a] text-[#e8622a]'
                      : 'bg-gray-100 border border-gray-300 text-gray-400'
                }`}>
                {done ? (
                  <svg
                    width='12'
                    height='12'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2.5}>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='m4.5 12.75 6 6 9-13.5'
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${
                  active
                    ? 'text-gray-900'
                    : done
                      ? 'text-[#e8622a]/70'
                      : 'text-gray-400'
                }`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Track */}
      <div className='relative h-1 bg-gray-200 rounded-full overflow-hidden -mt-8 mx-3.5'>
        <div
          className='absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out'
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #e8622a, #f0924a)',
            boxShadow: '0 0 8px rgba(232,98,42,0.5)',
          }}
        />
      </div>
    </div>
  )
}

// ── Shared input
function Field({
  label,
  hint,
  prefix,
  children,
}: {
  label: string
  hint?: string
  prefix?: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-[13px] font-medium text-gray-700'>{label}</label>
      {prefix ? (
        <div className='flex items-center rounded-xl border border-gray-300 bg-gray-50 overflow-hidden focus-within:border-[#e8622a]/50 focus-within:ring-1 focus-within:ring-[#e8622a]/20 transition-all'>
          <span className='px-3 text-[13px] text-gray-500 select-none border-r border-gray-300 h-11 flex items-center flex-shrink-0'>
            {prefix}
          </span>
          {children}
        </div>
      ) : (
        children
      )}
      {hint && (
        <p className='text-[11.5px] text-gray-500 leading-relaxed'>{hint}</p>
      )}
    </div>
  )
}

const inputCls = `
  w-full h-11 px-4 bg-transparent text-gray-900 text-[13.5px]
  placeholder:text-gray-400
  focus:outline-none
`

const standaloneInputCls = `
  w-full h-11 px-4 rounded-xl
  bg-white border border-gray-300
  text-gray-900 text-[13.5px]
  placeholder:text-gray-400
  focus:outline-none focus:border-[#e8622a]/50 focus:ring-1 focus:ring-[#e8622a]/20
  transition-all
`

// ── Step 1: Profile
function StepProfile({
  state,
  onChange,
}: {
  state: OnboardingState
  onChange: (k: keyof OnboardingState, v: string) => void
}) {
  return (
    <div className='flex flex-col gap-5'>
      {/* Avatar picker */}
      <div className='flex flex-col items-center gap-3 mb-2'>
        <div
          className='w-20 h-20 rounded-full flex items-center justify-center text-3xl cursor-pointer relative group'
          style={{ background: 'linear-gradient(135deg, #e8622a, #f0924a)' }}>
          {state.displayName ? state.displayName[0].toUpperCase() : '✨'}
          <div className='absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
            <svg
              width='18'
              height='18'
              fill='none'
              viewBox='0 0 24 24'
              stroke='white'
              strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z'
              />
            </svg>
          </div>
        </div>
        <p className='text-[11px] text-gray-500'>Photo upload coming soon</p>
      </div>

      <Field
        label='Display name'
        hint='This is your public name — use your real name or brand name.'>
        <input
          type='text'
          placeholder='Jane Doe'
          value={state.displayName}
          onChange={(e) => onChange('displayName', e.target.value)}
          className={standaloneInputCls}
        />
      </Field>

      <Field label='Username' prefix='linkflow.to/'>
        <input
          type='text'
          placeholder='janedoe'
          value={state.username}
          onChange={(e) =>
            onChange(
              'username',
              e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
            )
          }
          className={inputCls}
        />
      </Field>

      <Field label='Short bio' hint='One line. What do you do?'>
        <textarea
          placeholder='Designer · Creator · Maker of things'
          value={state.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          rows={2}
          className={`${standaloneInputCls} h-auto py-3 resize-none leading-relaxed`}
          maxLength={100}
        />
      </Field>
    </div>
  )
}

// ── Step 2: First link
function StepFirstLink({
  state,
  onChange,
}: {
  state: OnboardingState
  onChange: (k: keyof OnboardingState, v: string) => void
}) {
  const SUGGESTIONS = [
    { icon: '🎨', label: 'Portfolio', url: 'https://myportfolio.com' },
    { icon: '📸', label: 'Instagram', url: 'https://instagram.com/' },
    { icon: '🎵', label: 'Spotify', url: 'https://open.spotify.com/' },
    { icon: '📝', label: 'Newsletter', url: 'https://substack.com/' },
    { icon: '🛒', label: 'Shop', url: 'https://myshop.com' },
    { icon: '📺', label: 'YouTube', url: 'https://youtube.com/@' },
  ]

  return (
    <div className='flex flex-col gap-5'>
      <p className='text-[13px] text-gray-600 leading-relaxed -mt-1'>
        Add your most important link first. You can add more from your
        dashboard.
      </p>

      {/* Quick suggestions */}
      <div>
        <p className='text-[11px] text-gray-500 uppercase tracking-[0.12em] font-medium mb-3'>
          Quick add
        </p>
        <div className='grid grid-cols-3 gap-2'>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                onChange('linkTitle', s.label)
                onChange('linkUrl', s.url)
              }}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-center
                ${
                  state.linkTitle === s.label
                    ? 'border-[#e8622a]/40 bg-[#e8622a]/10'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }`}>
              <span className='text-xl'>{s.icon}</span>
              <span
                className={`text-[11px] font-medium transition-colors ${state.linkTitle === s.label ? 'text-[#e8622a]' : 'text-gray-600'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <div className='flex-1 h-px bg-gray-300' />
        <span className='text-[11px] text-gray-500'>or enter manually</span>
        <div className='flex-1 h-px bg-gray-300' />
      </div>

      <Field label='Link label'>
        <input
          type='text'
          placeholder='e.g. My Portfolio'
          value={state.linkTitle}
          onChange={(e) => onChange('linkTitle', e.target.value)}
          className={standaloneInputCls}
        />
      </Field>

      <Field label='URL'>
        <input
          type='url'
          placeholder='https://yoursite.com'
          value={state.linkUrl}
          onChange={(e) => onChange('linkUrl', e.target.value)}
          className={standaloneInputCls}
        />
      </Field>
    </div>
  )
}

// ── Step 3: Share
function StepShare({ state }: { state: OnboardingState }) {
  const [copied, setCopied] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const handle = state.username || 'yourname'
  const url = `linkflow.to/${handle}`

  useEffect(() => {
    const t = setTimeout(() => setCelebrating(true), 300)
    return () => clearTimeout(t)
  }, [])

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const SHARE_OPTIONS = [
    {
      label: 'Twitter / X',
      icon: '𝕏',
      color: '#000',
      bg: 'rgba(255,255,255,0.08)',
      href: `https://twitter.com/intent/tweet?text=Check out my links 👇&url=https://${url}`,
    },
    {
      label: 'Instagram',
      icon: '📸',
      color: '#fff',
      bg: 'rgba(225,48,108,0.15)',
      href: '#',
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      color: '#fff',
      bg: 'rgba(37,211,102,0.15)',
      href: `https://wa.me/?text=https://${url}`,
    },
  ]

  return (
    <div className='flex flex-col gap-6'>
      {/* Celebration header */}
      <div className='flex flex-col items-center text-center gap-2 py-2'>
        <div
          className='text-4xl mb-1 transition-all duration-500'
          style={{
            transform: celebrating
              ? 'scale(1) rotate(0deg)'
              : 'scale(0.5) rotate(-20deg)',
            opacity: celebrating ? 1 : 0,
          }}>
          🎉
        </div>
        <h3
          className='text-[18px] font-semibold text-gray-900 transition-all duration-500'
          style={{
            fontFamily: "'DM Serif Display', serif",
            opacity: celebrating ? 1 : 0,
            transform: celebrating ? 'translateY(0)' : 'translateY(8px)',
          }}>
          Your page is live!
        </h3>
        <p className='text-[13px] text-gray-500'>
          Share it with the world and start getting clicks.
        </p>
      </div>

      {/* URL preview card */}
      <div className='rounded-xl border border-gray-300 bg-gray-50 p-4 flex flex-col gap-3'>
        <div className='flex items-center gap-3'>
          {/* Mini avatar */}
          <div
            className='w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'
            style={{ background: 'linear-gradient(135deg, #e8622a, #f0924a)' }}>
            {state.displayName ? state.displayName[0].toUpperCase() : '✨'}
          </div>
          <div className='min-w-0'>
            <p className='text-[13px] font-semibold text-gray-900 truncate'>
              {state.displayName || 'Your Name'}
            </p>
            <p className='text-[11px] text-gray-500 truncate'>{url}</p>
          </div>
        </div>

        {/* Copy bar */}
        <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300'>
          <div
            className='w-1.5 h-1.5 rounded-full bg-[#4caf7d] flex-shrink-0'
            style={{ animation: 'pulse 2s infinite' }}
          />
          <span className='flex-1 text-[12px] text-gray-700 truncate font-mono'>
            {url}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              copied
                ? 'bg-[#4caf7d]/15 text-[#4caf7d]'
                : 'bg-[#e8622a]/15 text-[#e8622a] hover:bg-[#e8622a]/25'
            }`}>
            {copied ? (
              <>
                <svg
                  width='11'
                  height='11'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2.5}>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m4.5 12.75 6 6 9-13.5'
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  width='11'
                  height='11'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2}>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184'
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share buttons */}
      <div className='flex flex-col gap-2'>
        <p className='text-[11px] text-gray-500 uppercase tracking-[0.12em] font-medium'>
          Share on
        </p>
        <div className='flex gap-2'>
          {SHARE_OPTIONS.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target='_blank'
              rel='noreferrer'
              className='flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[12px] font-medium text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 transition-all'
              style={{ background: opt.bg }}>
              <span>{opt.icon}</span>
              <span>{opt.label.split(' ')[0]}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══ MAIN ONBOARDING PAGE ══════════════════════
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [state, setState] = useState<OnboardingState>({
    username: '',
    displayName: '',
    bio: '',
    linkTitle: '',
    linkUrl: '',
  })

  const onChange = (k: keyof OnboardingState, v: string) =>
    setState((p) => ({ ...p, [k]: v }))

  const canNext: Record<Step, boolean> = {
    1: state.displayName.trim().length > 0 && state.username.trim().length > 0,
    2: state.linkTitle.trim().length > 0 && state.linkUrl.trim().length > 0,
    3: true,
  }

  const STEP_META: Record<Step, { title: string; subtitle: string }> = {
    1: {
      title: 'Set up your profile',
      subtitle: 'Tell the world who you are.',
    },
    2: {
      title: 'Add your first link',
      subtitle: "What's the most important place you want to send people?",
    },
    3: {
      title: 'Share your page',
      subtitle: "You're all set — now spread the word.",
    },
  }

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step)
    else router.push('/dashboard')
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
  }

  const handleSkip = () => {
    if (step < 3) setStep((s) => (s + 1) as Step)
    else router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes step-in {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-panel { animation: step-in 0.35s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className='min-h-screen bg-[#faf8f5] flex flex-col'>
        {/* ── Top progress strip (ultra-thin, full width) */}
        <div className='h-0.5 w-full bg-black/[0.04]'>
          <div
            className='h-full transition-all duration-500 ease-out'
            style={{
              width: `${((step - 1) / 2) * 100}%`,
              background: 'linear-gradient(90deg, #e8622a, #f0924a)',
              boxShadow: '0 0 8px rgba(232,98,42,0.6)',
            }}
          />
        </div>

        {/* ── Navbar */}
        <nav className='flex items-center justify-between px-6 h-14 border-b border-black/[0.05]'>
          <div className='flex items-center gap-2.5'>
            <div className='w-6 h-6 rounded-full border border-black/20 flex items-center justify-center'>
              <svg width='11' height='11' viewBox='0 0 14 14' fill='none'>
                <path
                  d='M7 1.5v11M1.5 7h11'
                  stroke='#e8622a'
                  strokeWidth='1.8'
                  strokeLinecap='round'
                />
              </svg>
            </div>
            <span className='text-[14px] font-semibold tracking-tight text-gray-900'>
              LinkFlow
            </span>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className='text-[12px] text-gray-500 hover:text-gray-700 transition-colors'>
            Skip setup →
          </button>
        </nav>

        {/* ── Main */}
        <div className='flex-1 flex items-start justify-center px-4 py-10 overflow-y-auto'>
          <div className='w-full max-w-sm flex flex-col gap-8'>
            {/* Progress tracker */}
            <ProgressBar step={step} />

            {/* Card */}
            <div className='bg-white border border-black/[0.07] rounded-2xl overflow-hidden'>
              {/* Card header */}
              <div className='px-6 py-5 border-b border-black/[0.05]'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-[10px] font-semibold text-[#e8622a]/60 uppercase tracking-[0.15em]'>
                    Step {step} of 3
                  </span>
                </div>
                <h2
                  className='text-[18px] font-semibold text-gray-900 leading-tight'
                  style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {STEP_META[step].title}
                </h2>
                <p className='text-[12.5px] text-gray-500 mt-1 leading-relaxed'>
                  {STEP_META[step].subtitle}
                </p>
              </div>

              {/* Card body */}
              <div className='p-6 step-panel' key={step}>
                {step === 1 && (
                  <StepProfile state={state} onChange={onChange} />
                )}
                {step === 2 && (
                  <StepFirstLink state={state} onChange={onChange} />
                )}
                {step === 3 && <StepShare state={state} />}
              </div>

              {/* Card footer — actions */}
              <div className='px-6 py-4 border-t border-black/[0.05] flex items-center gap-3'>
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className='h-10 px-4 rounded-xl border border-black/[0.1] text-gray-600 hover:text-gray-900 hover:border-black/[0.2] text-[13px] font-medium transition-all flex items-center gap-2'>
                    <svg
                      width='13'
                      height='13'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18'
                      />
                    </svg>
                    Back
                  </button>
                )}

                {/* Skip — only on step 2 */}
                {step === 2 && (
                  <button
                    onClick={handleSkip}
                    className='h-10 px-4 text-[12px] text-gray-500 hover:text-gray-700 transition-colors ml-auto'>
                    Skip for now
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={!canNext[step]}
                  className={`
                    ${step === 2 ? '' : 'ml-auto'}
                    flex items-center gap-2 h-10 px-5 rounded-xl
                    text-[13px] font-semibold transition-all active:scale-95
                    ${
                      canNext[step]
                        ? 'bg-[#e8622a] hover:bg-[#d4571f] text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}>
                  {step === 3 ? 'Go to Dashboard' : 'Continue'}
                  {step < 3 && (
                    <svg
                      width='13'
                      height='13'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2.2}>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom hint */}
            <p className='text-center text-[11.5px] text-gray-500 leading-relaxed'>
              You can change everything later from your dashboard settings.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
