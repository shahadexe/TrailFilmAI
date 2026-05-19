'use client'

import { motion, useScroll, useReducedMotion } from 'framer-motion'

export function ScrollProgress() {
  const shouldReduce = useReducedMotion()
  const { scrollYProgress } = useScroll()

  if (shouldReduce) {
    // Static decorative bar — communicates story content exists below
    return (
      <div
        aria-hidden="true"
        className="fixed left-0 top-0 z-50 h-screen w-[3px] pointer-events-none"
        style={{
          background: '#E5A663',
          opacity: 0.15,
          borderRadius: '0 2px 2px 0',
        }}
      />
    )
  }

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-50 h-screen w-[3px] pointer-events-none"
      style={{
        scaleY: scrollYProgress,
        transformOrigin: 'top',
        background: '#E5A663',
        borderRadius: '0 2px 2px 0',
      }}
    />
  )
}
