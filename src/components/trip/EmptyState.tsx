'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export function EmptyState() {
  const shouldReduce = useReducedMotion()

  return (
    <div className="flex flex-col items-center text-center gap-8 py-16">
      {/* Inline SVG illustration */}
      <svg
        width="160"
        height="120"
        viewBox="0 0 160 120"
        aria-hidden="true"
        className="overflow-visible"
      >
        {/* Layer 1: polaroid border (rotated -3deg) */}
        <g transform="rotate(-3 80 60)">
          <rect
            x="24"
            y="14"
            width="112"
            height="92"
            stroke="#6B6862"
            strokeOpacity="0.2"
            fill="#6B6862"
            fillOpacity="0.05"
            rx="2"
          />
        </g>

        {/* Layer 2: film frame */}
        <rect x="32" y="24" width="96" height="72" stroke="#1F1F1F" strokeWidth="2" fill="none" rx="2" />
        {/* Sprocket holes — left side */}
        {[32, 48, 64, 80].map((cy) => (
          <circle key={`l-${cy}`} cx="36" cy={cy} r="2" fill="#1F1F1F" />
        ))}
        {/* Sprocket holes — right side */}
        {[32, 48, 64, 80].map((cy) => (
          <circle key={`r-${cy}`} cx="124" cy={cy} r="2" fill="#1F1F1F" />
        ))}

        {/* Layer 3: map pin (pulsing) */}
        <motion.g
          animate={shouldReduce ? undefined : { scale: [1, 1.08, 1] }}
          transition={
            shouldReduce
              ? undefined
              : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }
          style={{ transformOrigin: '80px 60px', transformBox: 'fill-box' }}
        >
          <path
            d="M80 44 C 73 44 68 49 68 56 C 68 64 80 78 80 78 C 80 78 92 64 92 56 C 92 49 87 44 80 44 Z"
            fill="#E5A663"
          />
          <circle cx="80" cy="56" r="3" fill="#0A0A0A" />
        </motion.g>
      </svg>

      {/* Headline */}
      <h2 className="font-serif font-medium text-2xl md:text-[28px] leading-tight text-ink-50">
        Your first chapter awaits.
      </h2>

      {/* Subline */}
      <p className="font-sans text-base text-parchment-400 leading-normal">
        Upload photos. We&apos;ll write the story.
      </p>

      {/* CTA */}
      <Link
        href="/new"
        className="inline-flex items-center justify-center min-h-[44px] rounded-md bg-amber-accent px-8 py-4 font-sans text-sm font-medium text-ink transition-all duration-300 ease-trailfilm hover:-translate-y-px hover:bg-[#FFC881] active:translate-y-px active:bg-[#B07F40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Create your first trip
      </Link>
    </div>
  )
}
