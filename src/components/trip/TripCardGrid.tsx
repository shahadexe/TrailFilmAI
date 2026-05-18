'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TripCard } from './TripCard'
import { DeleteTripDialog } from './DeleteTripDialog'
import { EmptyState } from './EmptyState'
import type { Trip } from '@/types/database'

interface TripCardGridProps {
  trips: { trip: Trip; coverUrl: string | null }[]
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function TripCardGrid({ trips }: TripCardGridProps) {
  const shouldReduce = useReducedMotion()
  const router = useRouter()

  const [items, setItems] = useState(trips)
  const [targetId, setTargetId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setItems(trips)
  }, [trips])

  const handleRequestDelete = useCallback((tripId: string) => {
    setTargetId(tripId)
    setDialogOpen(true)
  }, [])

  const handleDeleted = useCallback(
    (tripId: string) => {
      setItems((prev) => prev.filter(({ trip }) => trip.id !== tripId))
      router.refresh()
    },
    [router],
  )

  const handleOpenChange = useCallback((next: boolean) => {
    setDialogOpen(next)
    if (!next) setTargetId(null)
  }, [])

  if (items.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial={shouldReduce ? false : 'hidden'}
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map(({ trip, coverUrl }) => (
            <motion.div
              key={trip.id}
              variants={cardVariants}
              exit={
                shouldReduce
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      scale: 0.95,
                      transition: {
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1] as const,
                      },
                    }
              }
            >
              <TripCard
                trip={trip}
                coverUrl={coverUrl}
                onRequestDelete={handleRequestDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <DeleteTripDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        tripId={targetId}
        onDeleted={handleDeleted}
      />
    </>
  )
}
