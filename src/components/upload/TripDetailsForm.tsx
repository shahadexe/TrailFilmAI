'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createTrip } from '@/lib/trips/mutations'
import { useTripCreationStore } from '@/stores/trip-creation'
import { Label } from '@/components/ui/label'

const TripDetailsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: 'A name helps you find this trip later.' })
    .max(80, { message: 'Keep it short — 80 characters max.' }),
  destination: z
    .string()
    .trim()
    .max(80, { message: 'Keep it short — 80 characters max.' })
    .optional()
    .or(z.literal('')),
})

type TripDetailsValues = z.infer<typeof TripDetailsSchema>

type FormState = 'idle' | 'submitting'

interface TripDetailsFormProps {
  userId: string
}

export function TripDetailsForm({ userId }: TripDetailsFormProps) {
  const [state, setState] = useState<FormState>('idle')

  const shouldReduce = useReducedMotion()
  const easing = [0.22, 1, 0.36, 1] as const
  const t = (d: number, delay = 0) =>
    shouldReduce ? { duration: 0 } : { duration: d, delay, ease: easing }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripDetailsValues>({
    resolver: zodResolver(TripDetailsSchema),
    defaultValues: {
      title: useTripCreationStore.getState().tripTitle,
      destination: useTripCreationStore.getState().tripDestination,
    },
    mode: 'onSubmit',
  })

  const onSubmit = async (values: TripDetailsValues) => {
    if (state === 'submitting') return
    setState('submitting')
    try {
      const supabase = createClient()
      const destination = values.destination?.trim() ? values.destination.trim() : null
      const { id } = await createTrip(supabase, { user_id: userId, title: values.title, destination })
      const store = useTripCreationStore.getState()
      store.setTripTitle(values.title)
      store.setTripDestination(values.destination ?? '')
      store.setTripId(id)
      store.setStep(2)
      // Do NOT setState('idle') here — the component unmounts when step becomes 2
    } catch (err) {
      console.error('[TripDetailsForm] createTrip failed:', err)
      toast.error("Couldn't start the trip. Try again.")
      setState('idle')
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      aria-busy={state === 'submitting'}
    >
      <div className="flex flex-col gap-3">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8)}
          className="font-serif text-[28px] md:text-[40px] font-medium leading-[1.15] tracking-[-0.01em] text-ink-50"
        >
          Name your trip.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8, 0.15)}
          className="font-sans text-base text-parchment-200"
        >
          Give it a name. Where did it take you?
        </motion.p>
      </div>

      {/* Title field */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.8, 0.15)}
        className="flex flex-col gap-2"
      >
        <Label htmlFor="trip-title" className="font-sans text-sm font-medium text-ink-50">
          Trip name
        </Label>
        <input
          id="trip-title"
          type="text"
          autoComplete="off"
          placeholder="Manali in October"
          disabled={state === 'submitting'}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'trip-title-error' : undefined}
          className={`w-full bg-ink-800 border rounded-md px-4 py-3 font-sans text-base text-ink-50 placeholder:text-parchment-600 transition-colors duration-300 ease-trailfilm focus-visible:outline-none focus-visible:border-amber-accent focus-visible:ring-2 focus-visible:ring-amber-accent/30 ${
            errors.title ? 'border-error' : 'border-ink-700'
          }`}
          {...register('title')}
        />
        {errors.title && (
          <p id="trip-title-error" role="alert" className="font-sans text-sm text-error">
            {errors.title.message}
          </p>
        )}
      </motion.div>

      {/* Destination field */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.8, 0.15)}
        className="flex flex-col gap-2"
      >
        <Label
          htmlFor="trip-destination"
          className="font-sans text-sm font-medium text-ink-50 flex items-center gap-2"
        >
          <span>Destination</span>
          <span className="font-normal text-xs text-parchment-400">(optional)</span>
        </Label>
        <input
          id="trip-destination"
          type="text"
          autoComplete="off"
          placeholder="Ladakh"
          disabled={state === 'submitting'}
          aria-invalid={!!errors.destination}
          aria-describedby={errors.destination ? 'trip-destination-error' : undefined}
          className={`w-full bg-ink-800 border rounded-md px-4 py-3 font-sans text-base text-ink-50 placeholder:text-parchment-600 transition-colors duration-300 ease-trailfilm focus-visible:outline-none focus-visible:border-amber-accent focus-visible:ring-2 focus-visible:ring-amber-accent/30 ${
            errors.destination ? 'border-error' : 'border-ink-700'
          }`}
          {...register('destination')}
        />
        {errors.destination && (
          <p id="trip-destination-error" role="alert" className="font-sans text-sm text-error">
            {errors.destination.message}
          </p>
        )}
      </motion.div>

      {/* Submit button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.6, 0.3)}
      >
        <button
          type="submit"
          disabled={state === 'submitting'}
          aria-disabled={state === 'submitting'}
          aria-busy={state === 'submitting'}
          className="w-full min-h-[44px] rounded-md bg-amber-accent px-8 py-4 font-sans text-sm font-medium text-ink transition-all duration-300 ease-trailfilm hover:-translate-y-px hover:bg-[#FFC881] active:translate-y-px active:bg-[#B07F40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {state === 'submitting' ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" aria-label="Creating trip" />
          ) : (
            <span>Continue</span>
          )}
        </button>
      </motion.div>

      <span role="status" aria-live="polite" className="sr-only">
        {state === 'submitting' && 'Creating trip'}
      </span>
    </motion.form>
  )
}
