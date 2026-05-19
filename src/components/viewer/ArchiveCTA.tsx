'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'

export function ArchiveCTA() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      ref={ref}
      className="flex min-h-dvh flex-col items-center justify-center bg-ink px-4 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : shouldReduceMotion ? 0 : 24 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Link
          href="/signup"
          aria-label="Create your own travel archive on Trailfilm"
          className="font-serif text-base font-normal text-parchment-400 hover:text-amber-accent hover:underline hover:decoration-amber-accent hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          style={{
            transition:
              'color 200ms cubic-bezier(0.22, 1, 0.36, 1), text-decoration-color 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          Create your own archive &#x2192;
        </Link>
      </motion.div>
    </section>
  )
}
