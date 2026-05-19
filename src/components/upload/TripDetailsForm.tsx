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

const inputBase =
  'w-full rounded-xl border bg-[#0D0D0D] px-4 py-3 font-sans text-[15px] text-ink-50 placeholder:text-parchment-600/60 transition-all duration-300 ease-trailfilm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent/35 focus-visible:border-amber-accent/55 focus-visible:shadow-[0_0_0_4px_rgba(229,166,99,0.07),0_0_20px_-8px_rgba(229,166,99,0.2)] disabled:opacity-40 disabled:cursor-not-allowed'

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
      {/* Heading */}
      <div className="flex flex-col gap-2">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8)}
          className="font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.01em] text-ink-50 md:text-[36px]"
        >
          Name your trip.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8, 0.12)}
          className="font-sans text-[14px] text-parchment-400 leading-relaxed"
        >
          Give it a name. Where did it take you?
        </motion.p>
      </div>

      {/* Title field */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.8, 0.18)}
        className="flex flex-col gap-1.5"
      >
        <label htmlFor="trip-title" className="font-sans text-[12px] font-medium uppercase tracking-[0.1em] text-parchment-600">
          Trip name
        </label>
        <input
          id="trip-title"
          type="text"
          autoComplete="off"
          placeholder="Manali in October"
          disabled={state === 'submitting'}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'trip-title-error' : undefined}
          className={`${inputBase} ${errors.title ? 'border-error/60' : 'border-[rgba(255,255,255,0.07)]'}`}
          {...register('title')}
        />
        {errors.title && (
          <p id="trip-title-error" role="alert" className="font-sans text-[13px] text-error">
            {errors.title.message}
          </p>
        )}
      </motion.div>

      {/* Destination field */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.8, 0.24)}
        className="flex flex-col gap-1.5"
      >
        <label
          htmlFor="trip-destination"
          className="flex items-center gap-2 font-sans text-[12px] font-medium uppercase tracking-[0.1em] text-parchment-600"
        >
          <span>Destination</span>
          <span className="normal-case tracking-normal text-parchment-600/50">optional</span>
        </label>
        <input
          id="trip-destination"
          type="text"
          autoComplete="off"
          placeholder="Ladakh"
          disabled={state === 'submitting'}
          aria-invalid={!!errors.destination}
          aria-describedby={errors.destination ? 'trip-destination-error' : undefined}
          className={`${inputBase} ${errors.destination ? 'border-error/60' : 'border-[rgba(255,255,255,0.07)]'}`}
          {...register('destination')}
        />
        {errors.destination && (
          <p id="trip-destination-error" role="alert" className="font-sans text-[13px] text-error">
            {errors.destination.message}
          </p>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.6, 0.32)}
      >
        <button
          type="submit"
          disabled={state === 'submitting'}
          aria-disabled={state === 'submitting'}
          aria-busy={state === 'submitting'}
          className="w-full min-h-[46px] rounded-xl bg-amber-accent px-8 py-3 font-sans text-sm font-medium text-ink transition-all duration-300 ease-trailfilm hover:-translate-y-0.5 hover:bg-[#FFC881] hover:shadow-[0_8px_24px_-6px_rgba(229,166,99,0.4)] active:scale-[0.98] active:translate-y-0 active:bg-[#B07F40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {state === 'submitting' ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto" aria-label="Creating trip" />
          ) : (
            'Continue'
          )}
        </button>
      </motion.div>

      <span role="status" aria-live="polite" className="sr-only">
        {state === 'submitting' && 'Creating trip'}
      </span>
    </motion.form>
  )
}
