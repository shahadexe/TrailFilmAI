'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import type { Trip } from '@/types/database'

interface TripCardProps {
  trip: Trip
  coverUrl: string | null
  onRequestDelete?: (tripId: string) => void
}

export function TripCard({ trip, coverUrl, onRequestDelete }: TripCardProps) {
  const shouldReduce = useReducedMotion()
  const easing = [0.22, 1, 0.36, 1] as const

  return (
    <motion.div
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-ink-800"
      whileHover={{
        y: shouldReduce ? 0 : -5,
        borderColor: 'rgba(229,166,99,0.3)',
        boxShadow: shouldReduce
          ? 'none'
          : '0 24px 56px -12px rgba(229,166,99,0.16), 0 8px 16px -8px rgba(0,0,0,0.5)',
      }}
      transition={{ duration: shouldReduce ? 0 : 0.45, ease: easing }}
    >
      <Link href={`/trip/${trip.id}`} aria-label={trip.title} className="block">
        {/* Portrait cover zone */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink-700">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={trip.title}
              fill
              className="object-cover object-center transition-transform duration-700 ease-trailfilm group-hover:scale-[1.07]"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 420px"
            />
          ) : (
            /* Fallback — abstract film-frame grid */
            <div className="absolute inset-0 flex items-end justify-start bg-gradient-to-br from-ink-700 to-ink-800 p-0">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 240 320"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.07]"
              >
                <rect x="20" y="20" width="200" height="280" stroke="#B5B2A8" strokeWidth="1" fill="none" rx="2" />
                {[40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280].map((cy) => (
                  <circle key={`l-${cy}`} cx="28" cy={cy} r="3" fill="#B5B2A8" />
                ))}
                {[40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280].map((cy) => (
                  <circle key={`r-${cy}`} cx="212" cy={cy} r="3" fill="#B5B2A8" />
                ))}
              </svg>
            </div>
          )}

          {/* Cinematic gradient overlay */}
          <div className="gradient-fade-bottom absolute inset-0" />

          {/* Warm amber glow that brightens on hover — emanates from the text zone */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 opacity-0 transition-opacity duration-500 ease-trailfilm group-hover:opacity-100"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(229,166,99,0.12) 0%, transparent 70%)' }}
          />

          {/* Text overlaid on gradient */}
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
            <h3 className="font-serif font-medium leading-snug text-[17px] text-ink-50 line-clamp-2 md:text-[18px]">
              {trip.title}
            </h3>
            {trip.destination && (
              <p className="mt-0.5 font-sans text-[12px] text-parchment-400 line-clamp-1 tracking-wide">
                {trip.destination}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Three-dot options — shown on hover */}
      <button
        type="button"
        aria-label="Trip options"
        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-lg bg-[rgba(10,10,10,0.6)] text-parchment-400 opacity-0 backdrop-blur-sm transition-all duration-300 ease-trailfilm group-hover:opacity-100 hover:text-ink-50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent"
        data-trip-options-trigger
        onClick={(e) => { e.stopPropagation(); onRequestDelete?.(trip.id) }}
      >
        <MoreVertical aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
