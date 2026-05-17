'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ImageOff, MoreVertical } from 'lucide-react'
import type { Trip } from '@/types/database'

interface TripCardProps {
  trip: Trip
  coverUrl: string | null
}

export function TripCard({ trip, coverUrl }: TripCardProps) {
  const shouldReduce = useReducedMotion()
  const easing = [0.22, 1, 0.36, 1] as const

  return (
    <motion.div
      className="relative group overflow-hidden rounded-lg border border-ink-700 bg-ink-800 cursor-pointer"
      whileHover={{ y: -4, borderColor: 'rgba(229, 166, 99, 0.30)' }}
      transition={{ duration: shouldReduce ? 0 : 0.3, ease: easing }}
    >
      <Link href={`/trip/${trip.id}`} aria-label={trip.title}>
        {/* Cover zone */}
        <div className="aspect-video w-full bg-ink-700 relative">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={trip.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff aria-hidden="true" className="h-6 w-6 text-parchment-400" />
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="px-4 py-3 flex flex-col gap-1">
          <h3 className="font-serif font-medium leading-tight text-lg md:text-xl text-ink-50 line-clamp-2">
            {trip.title}
          </h3>
          {trip.destination && (
            <p className="font-sans text-sm text-parchment-400 line-clamp-1">
              {trip.destination}
            </p>
          )}
        </div>
      </Link>

      {/* Three-dot menu placeholder — Plan 06 will wire the dialog */}
      <button
        type="button"
        aria-label="Trip options"
        className="absolute top-2 right-2 z-10 grid place-items-center h-9 w-9 rounded bg-ink/70 text-parchment-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-trailfilm focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent"
        data-trip-options-trigger
      >
        <MoreVertical aria-hidden="true" className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
