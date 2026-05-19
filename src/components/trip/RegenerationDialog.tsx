'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { STORY_TONES } from '@/lib/gemini/prompts'
import type { StoryTone, Trip } from '@/types/database'

export interface RegenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
}

const TONE_ORDER: StoryTone[] = ['cinematic', 'poetic', 'adventurous', 'documentary']
const easing = [0.22, 1, 0.36, 1] as const

export function RegenerationDialog({ open, onOpenChange, trip }: RegenerationDialogProps) {
  const router = useRouter()
  const shouldReduce = useReducedMotion()
  const [step, setStep] = useState<'A' | 'B'>('A')
  const [selectedTone, setSelectedTone] = useState<StoryTone>(trip.story_tone ?? 'cinematic')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setStep('A')
    setSelectedTone(trip.story_tone ?? 'cinematic')
    setSubmitting(false)
    setError(null)
  }, [open, trip.story_tone])

  const handleClose = useCallback(() => {
    setSubmitting(false)
    onOpenChange(false)
  }, [onOpenChange])

  const handleConfirm = useCallback(async () => {
    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: trip.id, tone: selectedTone }),
      })

      if (!response.ok) {
        setError(
          response.status === 401
            ? 'You need to be signed in.'
            : response.status === 404
            ? 'Trip not found.'
            : 'Story generation failed. Please try again.'
        )
        setSubmitting(false)
        return
      }

      router.refresh()
      onOpenChange(false)
    } catch {
      setError('Story generation failed. Please try again.')
      setSubmitting(false)
    }
  }, [onOpenChange, router, selectedTone, submitting, trip.id])

  const contentMotion = shouldReduce
    ? {
        initial: false as const,
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, x: 16 },
        animate: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.35, ease: easing, delay: 0.03 },
        },
        exit: {
          opacity: 0,
          x: -16,
          transition: { duration: 0.25, ease: easing },
        },
      }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitting) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-[480px] overflow-hidden rounded-[10px] border border-ink-700 bg-ink-800 p-6 shadow-none gap-0">
        <AnimatePresence mode="wait" initial={false}>
          {step === 'A' ? (
            <motion.div key="stepA" {...contentMotion}>
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink-50">
                  Change your story&apos;s tone.
                </DialogTitle>
                <DialogDescription className="font-sans text-base leading-normal text-parchment-200">
                  Choose a new tone. Your current story will be replaced.
                </DialogDescription>
              </DialogHeader>

              <div role="radiogroup" aria-label="Story tone" className="mt-4 grid grid-cols-2 gap-3">
                {TONE_ORDER.map((tone) => {
                  const isSelected = selectedTone === tone
                  const toneConfig = STORY_TONES[tone]

                  return (
                    <motion.div
                      key={tone}
                      role="radio"
                      tabIndex={0}
                      aria-checked={isSelected}
                      whileTap={shouldReduce ? undefined : { scale: 0.97 }}
                      onClick={() => setSelectedTone(tone)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedTone(tone)
                        }
                      }}
                      className={`flex min-h-[80px] cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-[border-color,background-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                        isSelected
                          ? 'border-amber-accent/40 bg-[rgba(229,166,99,0.04)]'
                          : 'border-[rgba(255,255,255,0.06)] bg-ink-800 hover:border-amber-accent/20 hover:bg-[rgba(229,166,99,0.02)]'
                      }`}
                    >
                      <span className={`font-serif text-base font-medium leading-tight ${isSelected ? 'text-amber-accent' : 'text-ink-50'}`}>
                        {toneConfig.label}
                      </span>
                      <span className="font-sans text-sm leading-tight text-parchment-600">
                        {toneConfig.description}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-[44px] rounded-md border border-[rgba(255,255,255,0.08)] bg-transparent px-5 py-2 font-sans text-sm font-medium text-ink-50 transition-colors duration-300 ease-trailfilm hover:border-parchment-600 hover:bg-ink-800"
                >
                  Keep current story
                </button>
                <button
                  type="button"
                  onClick={() => setStep('B')}
                  className="min-h-[44px] rounded-md border border-[rgba(255,255,255,0.08)] bg-transparent px-5 py-2 font-sans text-sm font-medium text-ink-50 transition-[border-color,background-color,color] duration-300 ease-trailfilm hover:border-amber-accent/40 hover:bg-[rgba(229,166,99,0.08)] hover:text-amber-accent"
                >
                  Continue
                </button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div key="stepB" {...contentMotion}>
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink-50">
                  Replace your story?
                </DialogTitle>
                <DialogDescription className="font-sans text-base leading-normal text-parchment-200">
                  This will replace your current story. This can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="mt-4 flex flex-col gap-2">
                  <p role="alert" className="font-sans text-sm text-error">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    aria-disabled={submitting}
                    className="self-start rounded-md border border-error px-4 py-2 font-sans text-sm font-medium text-error transition-colors duration-300 ease-trailfilm hover:bg-error/10 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                  >
                    Try again
                  </button>
                </div>
              )}

              <DialogFooter className="mt-6 flex flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-[44px] rounded-md border border-[rgba(255,255,255,0.08)] bg-transparent px-5 py-2 font-sans text-sm font-medium text-ink-50 transition-colors duration-300 ease-trailfilm hover:border-parchment-600 hover:bg-ink-800"
                >
                  Keep current story
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  aria-disabled={submitting}
                  className="min-h-[44px] rounded-md bg-error px-5 py-2 font-sans text-sm font-medium text-white transition-colors duration-300 ease-trailfilm hover:bg-[#c5674e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Regenerate story
                </button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
