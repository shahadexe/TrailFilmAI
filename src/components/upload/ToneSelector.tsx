'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { STORY_TONES } from '@/lib/gemini/prompts'
import { useTripCreationStore } from '@/stores/trip-creation'
import type { StoryTone } from '@/types/database'

const TONE_ORDER: StoryTone[] = ['cinematic', 'poetic', 'adventurous', 'documentary']

export function ToneSelector() {
  const selectedTone = useTripCreationStore((s) => s.selectedTone)
  const setSelectedTone = useTripCreationStore((s) => s.setSelectedTone)
  const shouldReduce = useReducedMotion()

  const chooseTone = (tone: StoryTone) => {
    setSelectedTone(tone)
  }

  return (
    <div role="radiogroup" aria-label="Story tone" className="grid w-full grid-cols-2 gap-3">
      {TONE_ORDER.map((tone) => {
        const isSelected = selectedTone === tone
        const toneConfig = STORY_TONES[tone]

        return (
          <motion.div
            key={tone}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            whileTap={shouldReduce ? undefined : { scale: 0.97 }}
            onClick={() => chooseTone(tone)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                chooseTone(tone)
              }
            }}
            className={`flex min-h-[80px] cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-[border-color,background-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
              isSelected
                ? 'border-amber-accent/40 bg-[rgba(229,166,99,0.04)]'
                : 'border-[rgba(255,255,255,0.06)] bg-ink-800 hover:border-amber-accent/20 hover:bg-[rgba(229,166,99,0.02)]'
            }`}
          >
            <span
              className={`font-serif text-base font-medium leading-tight ${
                isSelected ? 'text-amber-accent' : 'text-ink-50'
              }`}
            >
              {toneConfig.label}
            </span>
            <span className="font-sans text-sm leading-snug text-parchment-600">
              {toneConfig.description}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
