'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormState = 'idle' | 'sending' | 'sent' | 'error'

const easing = [0.22, 1, 0.36, 1] as const

export const MagicLinkForm = () => {
  const [state, setState] = useState<FormState>('idle')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)

  const shouldReduce = useReducedMotion()
  const t = (duration: number, delay = 0) =>
    shouldReduce ? { duration: 0 } : { duration, delay, ease: easing }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || state === 'sending') return
    setState('sending')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })
      if (error) {
        console.error('[MagicLinkForm] signInWithOtp error:', error.message)
        setState('error')
        return
      }
      setState('sent')
    } catch {
      toast.error('Something went wrong. Try again.')
      setState('idle')
    }
  }

  const handleResend = async () => {
    if (resending) return
    setResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })
      if (error) {
        toast.error('Resend failed. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setResending(false)
    }
  }

  const FormView = (
    <motion.form
      key="form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={t(0.3)}
      className="flex flex-col gap-6"
      aria-busy={state === 'sending'}
    >
      <div className="flex flex-col gap-3">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8, 0.15)}
          className="font-serif text-[28px] md:text-[40px] font-medium leading-[1.15] tracking-[-0.01em] text-ink-50"
        >
          Enter your email.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8, 0.3)}
          className="font-sans text-base text-[#E8E6DF]"
        >
          We'll send you a link. No password needed.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.8, 0.3)}
        className="flex flex-col gap-2"
      >
        <Label htmlFor="email" className="sr-only">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === 'error') setState('idle')
          }}
          disabled={state === 'sending'}
          aria-invalid={state === 'error'}
          aria-describedby={state === 'error' ? 'email-error' : undefined}
          className={`w-full bg-ink-800 border border-ink-700 rounded-md px-4 py-3 font-sans text-base text-ink-50 placeholder:text-[#6B6862] transition-colors duration-300 ease-trailfilm focus-visible:outline-none focus-visible:border-amber-accent focus-visible:ring-2 focus-visible:ring-amber-accent/30 ${
            state === 'error' ? 'border-[#D67867]' : ''
          }`}
        />
        {state === 'error' && (
          <motion.p
            id="email-error"
            role="alert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-sans text-sm text-[#D67867]"
          >
            The link couldn't be sent. Check your email and try again.
          </motion.p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(0.6, 0.45)}
      >
        <Button
          type="submit"
          disabled={state === 'sending'}
          aria-disabled={state === 'sending'}
          aria-busy={state === 'sending'}
          className="w-full min-h-[44px] rounded-md bg-amber-accent px-8 py-4 font-sans text-sm font-medium text-ink transition-all duration-300 ease-trailfilm hover:-translate-y-px hover:bg-[#FFC881] active:translate-y-px active:bg-[#B07F40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {state === 'sending' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-label="Sending link" />
          ) : (
            <span>Send link</span>
          )}
        </Button>
      </motion.div>

      <span role="status" aria-live="polite" className="sr-only">
        {state === 'sending' && 'Sending link'}
        {state === 'error' && "The link couldn't be sent."}
      </span>
    </motion.form>
  )

  const ConfirmationView = (
    <motion.div
      key="sent"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={t(0.6, 0.2)}
      className="flex flex-col gap-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          shouldReduce
            ? { duration: 0 }
            : { duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }
        }
        className="flex items-center justify-center"
      >
        <CheckCircle2 className="h-8 w-8 text-amber-accent" aria-hidden="true" />
      </motion.div>
      <h2 className="font-serif text-[28px] md:text-[40px] font-medium leading-[1.15] tracking-[-0.01em] text-ink-50 text-center">
        Check your inbox.
      </h2>
      <p className="font-sans text-base text-[#E8E6DF] text-center break-all">{email}</p>
      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="font-sans text-sm font-medium text-[#E8E6DF] hover:underline hover:text-amber-accent transition-colors duration-300 ease-trailfilm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:no-underline disabled:hover:text-[#E8E6DF]"
        aria-busy={resending}
      >
        {resending ? 'Sending...' : 'Resend email'}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        Link sent, check your inbox.
      </span>
    </motion.div>
  )

  return (
    <AnimatePresence mode="wait">
      {state === 'sent' ? ConfirmationView : FormView}
    </AnimatePresence>
  )
}
