'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function EmptyState() {
  const shouldReduce = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const t = (d: number, delay = 0) =>
    shouldReduce ? { duration: 0 } : { duration: d, delay, ease }

  return (
    <div className="flex flex-col items-center gap-10 py-20 text-center md:py-28">

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.9)}
        className="relative"
      >
        <svg
          width="180"
          height="140"
          viewBox="0 0 180 140"
          aria-hidden="true"
          className="overflow-visible"
        >
          {/* Ambient glow behind illustration */}
          <defs>
            <radialGradient id="pinGlow" cx="50%" cy="60%" r="40%">
              <stop offset="0%" stopColor="#E5A663" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#E5A663" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="90" cy="100" rx="60" ry="24" fill="url(#pinGlow)" />

          {/* Rear polaroid (rotated) */}
          <g transform="rotate(-6 90 70)">
            <rect x="28" y="18" width="108" height="90" rx="3"
              stroke="#6B6862" strokeOpacity="0.18" fill="#6B6862" fillOpacity="0.04" />
          </g>

          {/* Film frame */}
          <rect x="36" y="26" width="108" height="82" rx="2"
            stroke="#1F1F1F" strokeWidth="2" fill="none" />
          {/* Sprocket holes — left */}
          {[38, 54, 70, 86, 102].map((cy) => (
            <circle key={`l-${cy}`} cx="41" cy={cy} r="2.5" fill="#1F1F1F" />
          ))}
          {/* Sprocket holes — right */}
          {[38, 54, 70, 86, 102].map((cy) => (
            <circle key={`r-${cy}`} cx="139" cy={cy} r="2.5" fill="#1F1F1F" />
          ))}

          {/* Animated map pin */}
          <motion.g
            animate={shouldReduce ? undefined : { y: [0, -5, 0] }}
            transition={
              shouldReduce
                ? undefined
                : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }
            }
          >
            <path
              d="M90 46 C82 46 76 52 76 60 C76 70 90 86 90 86 C90 86 104 70 104 60 C104 52 98 46 90 46 Z"
              fill="#E5A663"
            />
            <circle cx="90" cy="60" r="4" fill="#0A0A0A" />
            {/* Pin shadow */}
            <ellipse cx="90" cy="90" rx="8" ry="3" fill="#E5A663" fillOpacity="0.18" />
          </motion.g>
        </svg>
      </motion.div>

      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.8, 0.15)}
        className="flex flex-col gap-3"
      >
        <h2 className="font-serif font-medium text-[26px] leading-tight text-ink-50 md:text-[32px]">
          Your first chapter awaits.
        </h2>
        <p className="font-sans text-[15px] text-parchment-400 leading-relaxed max-w-xs mx-auto">
          Upload photos from a trip.<br />We&apos;ll write the story.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.7, 0.3)}
      >
        <Link
          href="/new"
          className="group inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-accent px-7 py-3 font-sans text-sm font-medium text-ink transition-all duration-300 ease-trailfilm hover:-translate-y-px hover:bg-[#FFC881] active:translate-y-px active:bg-[#B07F40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          Create your first trip
          <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </div>
  )
}
