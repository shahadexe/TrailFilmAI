'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GenerationProgress } from '@/components/upload/GenerationProgress'

const MAX_POLL_ATTEMPTS = 15

export function GeneratingStoryState() {
  const router = useRouter()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    let attempts = 0
    const id = setInterval(() => {
      attempts++
      if (attempts >= MAX_POLL_ATTEMPTS) {
        clearInterval(id)
        setTimedOut(true)
        return
      }
      router.refresh()
    }, 4000)
    return () => clearInterval(id)
  }, [router])

  return (
    <section className="mt-12">
      <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-parchment-600">
        YOUR STORY
      </p>
      <div
        aria-hidden="true"
        className="mb-8 h-px w-full opacity-80"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(229,166,99,0.35), transparent)' }}
      />
      {timedOut ? (
        <p className="font-sans text-sm text-parchment-400">
          Story generation is taking longer than expected. Please refresh the page or try again.
        </p>
      ) : (
        <GenerationProgress state="generating" />
      )}
    </section>
  )
}
