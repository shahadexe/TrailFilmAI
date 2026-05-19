'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTripCreationStore } from '@/stores/trip-creation'
import { TripDetailsForm } from './TripDetailsForm'
import { StepIndicator } from './StepIndicator'
import { PhotoUploadStep } from './PhotoUploadStep'
import { ToneStep } from './ToneStep'

export interface TripWizardProps {
  userId: string
  resumeTripId?: string | null
  resumeStep?: 3
}

export function TripWizard({ userId, resumeTripId, resumeStep }: TripWizardProps) {
  const router = useRouter()
  const step = useTripCreationStore((s) => s.step)
  const tripId = useTripCreationStore((s) => s.tripId)
  const setTripId = useTripCreationStore((s) => s.setTripId)
  const setStep = useTripCreationStore((s) => s.setStep)
  const reset = useTripCreationStore((s) => s.reset)
  const shouldReduce = useReducedMotion()
  const easing = [0.22, 1, 0.36, 1] as const

  useEffect(() => {
    if (resumeTripId) setTripId(resumeTripId)
    if (resumeStep === 3) setStep(3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset wizard state and bust dashboard cache when leaving /new mid-flow.
  // router.refresh() forces the dashboard RSC to re-fetch so any trip created
  // at Step 1 appears in the archive immediately on back-navigation.
  useEffect(() => {
    return () => {
      reset()
      router.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  const exitTransition = shouldReduce ? { duration: 0 } : { duration: 0.3, ease: easing }
  const enterTransition = shouldReduce
    ? { duration: 0 }
    : { duration: 0.6, ease: easing, delay: 0.05 }

  return (
    <div className="w-full flex flex-col gap-8">
      <StepIndicator step={step} />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={false}
            exit={{ opacity: 0, x: -20, transition: exitTransition }}
          >
            <TripDetailsForm userId={userId} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: enterTransition }}
          >
            {tripId ? (
              <PhotoUploadStep tripId={tripId} userId={userId} />
            ) : (
              <p className="font-sans text-sm text-parchment-400">Trip not created — go back to Step 1.</p>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: enterTransition }}
            exit={{ opacity: 0, x: -20, transition: exitTransition }}
          >
            <ToneStep />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
