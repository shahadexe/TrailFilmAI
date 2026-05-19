'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface StepIndicatorProps {
  step: 1 | 2 | 3
}

const LABELS = ['Details', 'Photos', 'Tone']

export function StepIndicator({ step }: StepIndicatorProps) {
  const shouldReduce = useReducedMotion()

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Step ${step} of 3`}
      className="flex items-center gap-4"
    >
      {LABELS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const isActive = step === n
        const isDone = step > n

        return (
          <div key={n} className="flex items-center gap-2.5">
            {/* Step number circle */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-sans text-[10px] font-medium transition-all duration-400 ease-trailfilm ${
                isActive
                  ? 'bg-amber-accent text-ink shadow-[0_0_12px_rgba(229,166,99,0.5)]'
                  : isDone
                  ? 'bg-[rgba(229,166,99,0.15)] text-amber-accent'
                  : 'bg-[rgba(255,255,255,0.05)] text-parchment-600/40'
              }`}
            >
              {isDone ? (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
                  <path d="M1 3l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : n}
            </div>

            {/* Segment bar */}
            <div className="relative h-0.5 w-10 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
              {(isActive || isDone) && (
                <motion.div
                  className={`absolute inset-0 rounded-full bg-amber-accent ${isActive ? 'step-bar-glow' : ''}`}
                  initial={shouldReduce ? false : { scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={
                    shouldReduce
                      ? { duration: 0 }
                      : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                  }
                />
              )}
            </div>

            {/* Label */}
            <span
              className={`font-sans text-[11px] uppercase tracking-[0.1em] transition-colors duration-300 ${
                isActive
                  ? 'text-parchment-200'
                  : isDone
                  ? 'text-parchment-600'
                  : 'text-parchment-600/40'
              }`}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
