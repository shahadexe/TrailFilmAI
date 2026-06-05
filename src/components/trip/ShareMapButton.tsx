'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Check, Share2 } from 'lucide-react'

interface ShareMapButtonProps {
  tripId: string
}

export function ShareMapButton({ tripId }: ShareMapButtonProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  async function handleShare() {
    const url = `${window.location.origin}/map/${tripId}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Travel Map', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopyState('copied')
        setTimeout(() => setCopyState('idle'), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {})
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-[rgba(229,166,99,0.08)] border border-[rgba(229,166,99,0.12)] flex items-center justify-center flex-shrink-0">
        <Map size={14} strokeWidth={1.5} className="text-amber-accent" />
      </div>

      <button
        onClick={handleShare}
        className={[
          'inline-flex items-center gap-2 h-9 px-4 rounded-xl font-sans text-sm font-medium',
          'transition-all duration-200',
          copyState === 'copied'
            ? 'bg-[rgba(229,166,99,0.08)] text-amber-accent border border-[rgba(229,166,99,0.3)]'
            : 'border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-parchment-200 hover:border-[rgba(229,166,99,0.4)] hover:bg-[rgba(229,166,99,0.08)] hover:text-amber-accent',
        ].join(' ')}
      >
        <AnimatePresence mode="wait">
          {copyState === 'copied' ? (
            <motion.span
              key="done"
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Check size={13} strokeWidth={2} />
              Map link copied
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Share2 size={13} strokeWidth={1.5} />
              Share travel map
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}
