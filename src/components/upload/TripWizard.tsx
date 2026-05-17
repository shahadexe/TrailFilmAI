'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTripCreationStore } from '@/stores/trip-creation'
import { TripDetailsForm } from './TripDetailsForm'
import { StepIndicator } from './StepIndicator'
import { PhotoUploadStep } from './PhotoUploadStep'

export interface TripWizardProps {
  userId: string
}

export function TripWizard({ userId }: TripWizardProps) {
  const step = useTripCreationStore((s) => s.step)
  const tripId = useTripCreationStore((s) => s.tripId)
  const reset = useTripCreationStore((s) => s.reset)
  const shouldReduce = useReducedMotion()
  const easing = [0.22, 1, 0.36, 1] as const

  // Reset wizard state when the page unmounts (user navigated away mid-flow)
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const exitTransition = shouldReduce ? { duration: 0 } : { duration: 0.3, ease: easing }
  const enterTransition = shouldReduce
    ? { duration: 0 }
    : { duration: 0.6, ease: easing, delay: 0.05 }

  return (
    <div className="w-full flex flex-col gap-8">
      <StepIndicator step={step} />
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={false}
            exit={{ opacity: 0, x: -20, transition: exitTransition }}
          >
            <TripDetailsForm userId={userId} />
          </motion.div>
        ) : (
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
      </AnimatePresence>
    </div>
  )
}
