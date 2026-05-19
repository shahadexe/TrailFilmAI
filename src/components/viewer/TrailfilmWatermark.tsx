'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'

export function TrailfilmWatermark() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-50"
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
    >
      <Link
        href="/"
        aria-label="Made with Trailfilm — create your own travel archive"
        className="block font-serif text-xs font-normal text-parchment-200 opacity-50 hover:opacity-100 hover:text-amber-accent focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        style={{
          letterSpacing: '0.04em',
          transition:
            'color 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        Made with Trailfilm
      </Link>
    </motion.div>
  )
}
