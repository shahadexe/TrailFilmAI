'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import { formatExifTimestamp } from '@/lib/utils/format-exif'
import type { Photo } from '@/types/database'

interface TripPhotoCellProps {
  photo: Photo
  publicUrl: string
  index: number
}

export function TripPhotoCell({ photo, publicUrl, index }: TripPhotoCellProps) {
  const shouldReduce = useReducedMotion()

  const hasTimestamp = photo.taken_at !== null
  const hasGps = photo.latitude !== null && photo.longitude !== null
  const hasBadge = hasTimestamp || hasGps

  return (
    <motion.div
      className="group relative aspect-square overflow-hidden rounded-lg bg-ink-700"
      whileHover={{ scale: shouldReduce ? 1 : 1.02 }}
      transition={{ duration: shouldReduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        src={publicUrl}
        alt={`Photo ${index + 1}`}
        fill
        className="object-cover object-center"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={index < 4}
      />

      {hasBadge && (
        <div className="gradient-fade-bottom absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 ease-trailfilm bg-ink/60">
          {hasTimestamp && (
            <div className="flex items-center gap-1">
              <Clock aria-hidden="true" className="h-2.5 w-2.5 text-parchment-400" />
              <span className="font-sans text-[12px] font-medium uppercase tracking-[0.05em] text-parchment-400">
                {formatExifTimestamp(new Date(photo.taken_at!))}
              </span>
            </div>
          )}

          {hasGps && (
            <div className="inline-flex items-center gap-1 self-start rounded bg-amber-accent/15 px-2 py-1">
              <MapPin aria-hidden="true" className="h-2.5 w-2.5 text-amber-accent" />
              <span className="font-sans text-[12px] font-medium uppercase tracking-[0.05em] text-amber-accent">
                GPS available
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
