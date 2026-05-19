'use client'

import { motion, useReducedMotion } from 'framer-motion'

export const AuthWordmark = () => {
  const shouldReduce = useReducedMotion()
  const t = shouldReduce
    ? { duration: 0 }
    : { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: 0 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={t}
      className="flex flex-col gap-1.5"
    >
      <h1 className="font-serif text-[30px] font-medium uppercase tracking-[0.05em] text-ink-50 leading-none">
        Trailfilm
      </h1>
      <p className="font-sans text-[13px] text-parchment-600 leading-snug">
        Sign in to your archive.
      </p>
    </motion.div>
  )
}
