'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface DashboardHeaderProps {
  count: number
}

export function DashboardHeader({ count }: DashboardHeaderProps) {
  const shouldReduce = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const t = (d: number, delay = 0) =>
    shouldReduce ? { duration: 0 } : { duration: d, delay, ease }

  return (
    <div className="mb-10 md:mb-14">
      {count > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={t(0.7)}
          className="mb-2.5 font-sans text-[11px] uppercase tracking-[0.18em] text-parchment-600"
        >
          {count} {count === 1 ? 'trip' : 'trips'}
        </motion.p>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t(1.0, 0.06)}
        className="font-serif text-[38px] font-medium leading-none tracking-[-0.02em] text-ink-50 md:text-[56px]"
      >
        Your archive.
      </motion.h1>
    </div>
  )
}
