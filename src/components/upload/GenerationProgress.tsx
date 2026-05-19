'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export type GenerationPhase = 'idle' | 'generating' | 'error'

interface GenerationProgressProps {
  state: GenerationPhase
  errorMessage?: string | null
  onRetry?: () => void
}

const STATUSES = ['Reading your photos…', 'Weaving your story…', 'Almost ready…']
const easing = [0.22, 1, 0.36, 1] as const

export function GenerationProgress({ state, errorMessage, onRetry }: GenerationProgressProps) {
  const [statusIndex, setStatusIndex] = useState(0)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    if (state !== 'generating') {
      setStatusIndex(0)
      return
    }

    const interval = window.setInterval(() => {
      setStatusIndex((current) => Math.min(current + 1, STATUSES.length - 1))
    }, 9000)

    return () => window.clearInterval(interval)
  }, [state])

  if (state === 'idle') {
    return null
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {state === 'generating' && (
        <>
          <span
            aria-live="polite"
            className="min-h-[21px] text-center font-sans text-sm text-parchment-400"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={STATUSES[statusIndex]}
                initial={shouldReduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={shouldReduce ? { duration: 0 } : { duration: 0.35, ease: easing }}
              >
                {STATUSES[statusIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <div aria-hidden="true" className="h-1 w-full overflow-hidden rounded-full bg-ink-700">
            <div className="h-full w-1/4 rounded-full bg-amber-accent progress-indeterminate" />
          </div>
        </>
      )}

      {state === 'error' && (
        <div className="mt-1 flex flex-col gap-2">
          <p role="alert" className="font-sans text-sm text-error">
            {errorMessage ?? 'Story generation failed. Please try again.'}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] rounded-md border border-error px-5 py-2 font-sans text-sm font-medium text-error transition-colors duration-300 ease-out hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
