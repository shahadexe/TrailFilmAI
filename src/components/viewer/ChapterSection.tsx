'use client'

import { useEffect, useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import Image from 'next/image'
import type { StoryChapter } from '@/types/database'

interface ChapterSectionProps {
  chapter: StoryChapter
  chapterIndex: number
  photoUrl: string
  onInView?: (chapterIndex: number) => void
}

const paragraphContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

export function ChapterSection({
  chapter,
  chapterIndex,
  photoUrl,
  onInView,
}: ChapterSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const shouldReduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Spec-locked motion values — do not alter input/output ranges
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  const textY = useTransform(scrollYProgress, [0.1, 0.3], [40, 0])

  // Reduced-motion fallback: useInView for paragraph reveal entrance
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' })

  // Active-chapter flyTo callback — useInView with once: false so scroll-back works
  const isMapActiveView = useInView(sectionRef, { once: false, amount: 0.3 })

  useEffect(() => {
    if (isMapActiveView) {
      onInView?.(chapterIndex)
    }
  }, [isMapActiveView, chapterIndex, onInView])

  const eyebrow = `CHAPTER ${String(chapterIndex + 1).padStart(2, '0')}`

  const paragraphItem = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0 : 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section
      ref={sectionRef}
      aria-label={chapter.title}
      className="relative overflow-hidden min-h-[100dvh] bg-ink"
    >
      {/* Photo parallax backdrop */}
      <motion.div
        className="absolute inset-0 scale-110"
        style={{ y: shouldReduce ? '0%' : parallaxY }}
      >
        <Image
          src={photoUrl}
          alt={chapter.title}
          fill
          className="object-cover object-center"
          priority={chapterIndex === 0}
          sizes="100vw"
        />
      </motion.div>

      {/* Gradient overlays — CSS classes already in globals.css */}
      <div
        className="gradient-fade-top absolute inset-x-0 top-0 h-[30%] z-[5]"
        aria-hidden="true"
      />
      <div
        className="gradient-fade-bottom absolute inset-x-0 bottom-0 h-[60%] z-[5]"
        aria-hidden="true"
      />

      {/* Atmospheric ambient-glow — first chapter only */}
      {chapterIndex === 0 && (
        <div
          className="ambient-glow absolute inset-0 z-[3] pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Text content zone */}
      <motion.div
        className="absolute bottom-0 left-0 z-10 px-8 pb-16 md:px-16 md:pb-24 max-w-full md:max-w-[480px]"
        style={
          shouldReduce
            ? { opacity: 1, y: 0 }
            : { opacity: textOpacity, y: textY }
        }
      >
        <p className="font-sans text-[11px] font-normal uppercase tracking-[0.18em] text-parchment-600 mb-1">
          {eyebrow}
        </p>
        <h2 className="font-serif font-medium text-2xl md:text-3xl leading-tight text-balance text-parchment mt-1">
          {chapter.title}
        </h2>
        <motion.div
          variants={paragraphContainer}
          initial="hidden"
          animate={shouldReduce ? (isInView ? 'visible' : 'hidden') : 'visible'}
          className="mt-3"
        >
          <motion.p
            variants={paragraphItem}
            className="max-w-[62ch] font-sans text-base font-normal leading-[1.75] text-parchment-200"
          >
            {chapter.narrative}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}
