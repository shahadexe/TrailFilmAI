'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function MarketingPage() {
  const shouldReduce = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const t = (d: number, delay = 0) =>
    shouldReduce ? { duration: 0 } : { duration: d, delay, ease }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-4">

      {/* Grain overlay */}
      <div
        aria-hidden
        className="grain-overlay pointer-events-none fixed inset-0 z-10 opacity-[0.032]"
      />

      {/* Ambient radial glow — breathing */}
      <div
        aria-hidden
        className="ambient-glow pointer-events-none absolute inset-0 z-0"
        style={{ animation: 'glow-breathe 12s ease-in-out infinite' }}
      />

      {/* Atmospheric bokeh orbs — simulates camera bokeh depth */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {([
          { w: 280, top: '10%', left:  '5%', opacity: 0.055, blur: 80, dur: '14s', delay: '0s'   },
          { w: 200, top: '68%', left: '87%', opacity: 0.045, blur: 60, dur: '18s', delay: '2.4s' },
          { w: 140, top: '38%', left: '22%', opacity: 0.032, blur: 48, dur: '11s', delay: '4.1s' },
          { w: 320, top: '78%', left: '42%', opacity: 0.06,  blur: 90, dur: '21s', delay: '0.8s' },
          { w: 170, top: '18%', left: '74%', opacity: 0.042, blur: 54, dur: '16s', delay: '3.2s' },
          { w: 120, top: '52%', left: '58%', opacity: 0.028, blur: 40, dur: '13s', delay: '5.5s' },
        ] as const).map((orb, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width:  orb.w,
              height: orb.w,
              top:    orb.top,
              left:   orb.left,
              background: 'radial-gradient(circle, rgba(229,166,99,1) 0%, transparent 68%)',
              opacity: orb.opacity,
              filter:  `blur(${orb.blur}px)`,
              borderRadius: '50%',
              animation: `float-bokeh ${orb.dur} ease-in-out infinite`,
              animationDelay: orb.delay,
            }}
          />
        ))}
      </div>

      {/* Decorative film-strip sprocket holes */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-0 flex flex-col justify-center gap-5 px-4 opacity-[0.15]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-3 w-1.5 rounded-sm bg-parchment-600" />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-0 flex flex-col justify-center gap-5 px-4 opacity-[0.15]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-3 w-1.5 rounded-sm bg-parchment-600" />
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-20 flex flex-col items-center gap-9 text-center">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.7)}
          className="font-sans text-[11px] uppercase tracking-[0.18em] text-parchment-600"
        >
          Travel journaling, reimagined
        </motion.p>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(1.0, 0.1)}
          className="font-serif font-medium uppercase leading-none tracking-[0.03em] text-ink-50"
          style={{ fontSize: 'clamp(60px, 13vw, 120px)' }}
        >
          Trailfilm
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8, 0.35)}
          className="max-w-[280px] font-sans text-[15px] leading-relaxed text-parchment-400 md:text-base"
        >
          Your memories deserve a director.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.7, 0.55)}
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800/80 px-7 py-3 font-sans text-sm font-medium text-ink-50 backdrop-blur-sm transition-all duration-500 ease-trailfilm hover:border-[rgba(229,166,99,0.4)] hover:bg-[#130f0a] hover:shadow-[0_8px_32px_-8px_rgba(229,166,99,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            <span>Begin your archive</span>
            <ArrowRight
              aria-hidden
              className="h-3.5 w-3.5 text-parchment-400 transition-all duration-300 ease-trailfilm group-hover:translate-x-0.5 group-hover:text-amber-accent"
            />
          </Link>
        </motion.div>
      </div>

      {/* Bottom film-notch rule */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(1.0, 0.9)}
        aria-hidden
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5"
      >
        {[0.15, 0.4, 1, 0.4, 0.15].map((op, i) => (
          <div key={i} className="h-px w-10 bg-parchment-600" style={{ opacity: op }} />
        ))}
      </motion.div>

    </main>
  )
}
