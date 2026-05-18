'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { TripPhotoCell } from './TripPhotoCell'

export type PhotoForDisplay = {
  id: string
  publicUrl: string
  taken_at: string | null
  hasGps: boolean
}

interface TripPhotoGridProps {
  photos: PhotoForDisplay[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const cellVariants = {
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

export function TripPhotoGrid({ photos }: TripPhotoGridProps) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduce ? false : 'hidden'}
      animate="visible"
      className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      {photos.map((photo, index) => (
        <motion.div key={photo.id} variants={cellVariants}>
          <TripPhotoCell photo={photo} index={index} />
        </motion.div>
      ))}
    </motion.div>
  )
}
