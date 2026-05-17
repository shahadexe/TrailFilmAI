'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TripCard } from './TripCard'
import type { Trip } from '@/types/database'

interface TripCardGridProps {
  trips: { trip: Trip; coverUrl: string | null }[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function TripCardGrid({ trips }: TripCardGridProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduce ? false : 'hidden'}
      animate="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {trips.map(({ trip, coverUrl }) => (
        <motion.div key={trip.id} variants={cardVariants}>
          <TripCard trip={trip} coverUrl={coverUrl} />
        </motion.div>
      ))}
    </motion.div>
  )
}
