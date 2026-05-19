import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthWordmark } from '@/components/auth/AuthWordmark'
import { MagicLinkForm } from '@/components/auth/MagicLinkForm'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16">

      {/* Grain overlay */}
      <div aria-hidden className="grain-overlay pointer-events-none fixed inset-0 z-10 opacity-[0.03]" />

      {/* Primary ambient glow — breathing */}
      <div
        aria-hidden
        className="ambient-glow pointer-events-none absolute inset-0 z-0"
        style={{ animation: 'glow-breathe 12s ease-in-out infinite' }}
      />

      {/* Secondary bokeh orb — top-right offset for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0"
        style={{
          width: 220,
          height: 220,
          top: '8%',
          right: '6%',
          background: 'radial-gradient(circle, rgba(229,166,99,1) 0%, transparent 65%)',
          opacity: 0.042,
          filter: 'blur(52px)',
          borderRadius: '50%',
          animation: 'float-bokeh 16s ease-in-out infinite',
          animationDelay: '3.5s',
        }}
      />

      {/* Tertiary bokeh orb — bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0"
        style={{
          width: 160,
          height: 160,
          bottom: '10%',
          left: '5%',
          background: 'radial-gradient(circle, rgba(229,166,99,1) 0%, transparent 65%)',
          opacity: 0.032,
          filter: 'blur(40px)',
          borderRadius: '50%',
          animation: 'float-bokeh 20s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />

      {/* Glass card — entrance animation via CSS */}
      <div className="surface-card card-enter relative z-20 w-full max-w-[420px] rounded-2xl px-8 py-10 shadow-2xl md:px-10"
        style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(229,166,99,0.04)' }}
      >
        {/* Inner top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(229,166,99,0.22), transparent)' }}
        />
        {/* Inner bottom glow — subtle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px rounded-b-2xl"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(229,166,99,0.06), transparent)' }}
        />

        <div className="flex flex-col gap-8">
          <AuthWordmark />

          <MagicLinkForm />

          <div className="relative flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" />
            <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-parchment-600">or</span>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" />
          </div>

          <GoogleAuthButton />
        </div>
      </div>

    </main>
  )
}
