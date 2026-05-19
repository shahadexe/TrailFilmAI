'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { StoryChapter } from '@/types/database'

interface StoryChapterBlockProps {
  chapter: StoryChapter
  index: number
}

export function StoryChapterBlock({ chapter, index }: StoryChapterBlockProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const shouldReduce = useReducedMotion()
  const eyebrow = `CHAPTER ${String(index + 1).padStart(2, '0')}`

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={shouldReduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-2"
    >
      <p className="font-sans text-[11px] font-normal uppercase tracking-[0.18em] text-parchment-600">
        {eyebrow}
      </p>
      <h3 className="font-serif text-xl font-medium leading-tight text-ink-50 md:text-2xl">
        {chapter.title}
      </h3>
      <p className="mt-3 max-w-[65ch] font-sans text-base font-normal leading-[1.75] text-parchment-200">
        {chapter.narrative}
      </p>
    </motion.article>
  )
}
