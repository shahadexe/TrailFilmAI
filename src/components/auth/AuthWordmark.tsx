'use client'

import { motion, useReducedMotion } from 'framer-motion'

export const AuthWordmark = () => {
  const shouldReduce = useReducedMotion()
  const t = shouldReduce
    ? { duration: 0 }
    : { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0 }

  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={t}
      className="font-serif text-[28px] md:text-[40px] font-medium tracking-[0.06em] uppercase text-ink-50"
    >
      TRAILFILM
    </motion.h1>
  )
}
