'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useTripCreationStore } from '@/stores/trip-creation'
import { GenerationProgress, type GenerationPhase } from './GenerationProgress'
import { ToneSelector } from './ToneSelector'

const easing = [0.22, 1, 0.36, 1] as const

export function ToneStep() {
  const router = useRouter()
  const tripId = useTripCreationStore((s) => s.tripId)
  const selectedTone = useTripCreationStore((s) => s.selectedTone)
  const [phase, setPhase] = useState<GenerationPhase>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const shouldReduce = useReducedMotion()

  const handleGenerate = async () => {
    if (!tripId || phase === 'generating') return

    setPhase('generating')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, tone: selectedTone }),
      })

      if (!response.ok || !response.body) {
        setPhase('error')
        setErrorMessage(
          response.status === 401
            ? 'You need to be signed in to generate a story.'
            : response.status === 404
            ? 'Trip not found.'
            : 'Story generation failed. Please try again.'
        )
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
      }

      accumulated += decoder.decode()

      const result = JSON.parse(accumulated) as { success: boolean; error?: string }

      if (result.success) {
        router.push(`/trip/${tripId}`)
      } else {
        setPhase('error')
        setErrorMessage(result.error ?? 'Story generation failed. Please try again.')
      }
    } catch {
      setPhase('error')
      setErrorMessage('Story generation failed. Please try again.')
    }
  }

  const handleRetry = () => {
    setPhase('idle')
    setErrorMessage(null)
  }

  const textInitial = shouldReduce ? false : { opacity: 0, filter: 'blur(4px)', scale: 0.97 }
  const textAnimate = { opacity: 1, filter: 'blur(0px)', scale: 1 }
  const textExit = shouldReduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', scale: 0.97 }
  const textTransition = shouldReduce ? { duration: 0 } : { duration: 0.2, ease: easing }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.8, ease: easing }}
          className="font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.01em] text-ink-50 md:text-[40px]"
        >
          Choose your tone.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduce ? { duration: 0 } : { duration: 0.8, delay: 0.12, ease: easing }}
          className="font-sans text-[16px] leading-relaxed text-parchment-200"
        >
          How should your story be told?
        </motion.p>
      </div>

      <ToneSelector />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={phase === 'generating'}
        aria-disabled={phase === 'generating'}
        className={`mt-6 min-h-[44px] w-full rounded-md bg-amber-accent px-8 py-3 font-sans text-sm font-medium text-ink transition-all duration-300 ease-trailfilm hover:-translate-y-0.5 hover:bg-[#FFC881] hover:shadow-[0_8px_24px_-6px_rgba(229,166,99,0.4)] active:scale-[0.98] active:bg-[#B07F40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-40`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'generating' ? (
            <motion.span
              key="loading"
              initial={textInitial}
              animate={textAnimate}
              exit={textExit}
              transition={textTransition}
              className="flex items-center justify-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Developing your story…
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={textInitial}
              animate={textAnimate}
              exit={textExit}
              transition={textTransition}
            >
              Generate your story
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <GenerationProgress state={phase} errorMessage={errorMessage} onRetry={handleRetry} />
    </div>
  )
}
