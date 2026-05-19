'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function ViewerNav() {
  const [navOpacity, setNavOpacity] = useState(1)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let prev = 0
    let raf: number

    const update = () => {
      const y = window.scrollY
      const scrollingUp = y < prev
      prev = y

      let opacity: number
      if (scrollingUp && y > 80) {
        // Scroll-up reversal — NOT 1.0, preserves ghost quality
        opacity = 0.85
      } else if (y <= 80) {
        opacity = 1
      } else if (y >= 180) {
        opacity = 0.08
      } else {
        // Linear remap 1.0 → 0.08 over 80–180px range
        opacity = 1 - ((y - 80) / 100) * 0.92
      }

      setNavOpacity(opacity)
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b border-[rgba(255,255,255,0.05)] bg-ink/80 backdrop-blur-xl"
      style={{
        opacity: navOpacity,
        transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="mx-auto flex h-14 md:h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Back to dashboard — left zone */}
        <Link
          href="/dashboard"
          aria-label="Back to your trips"
          className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 font-sans text-sm font-medium text-parchment-400 transition-colors duration-300 ease-trailfilm hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.97]"
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={1.5} />
          <span className="hidden md:inline">Back to trips</span>
        </Link>

        {/* Wordmark — right zone, identity only */}
        <span className="font-serif text-[19px] font-medium uppercase tracking-[0.04em] text-ink-50 transition-all duration-300 ease-trailfilm hover:tracking-[0.07em]">
          Trailfilm
        </span>
      </div>

      {/* Amber accent hairline — carry forward from AppNav */}
      <div
        aria-hidden
        className="nav-accent-line pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-px w-1/2 opacity-60"
      />
    </header>
  )
}
