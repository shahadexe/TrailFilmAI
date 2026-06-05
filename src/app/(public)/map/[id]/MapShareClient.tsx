'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { MapPin, ArrowRight } from 'lucide-react'
import type { RoutePoint } from '@/components/map/SVGRouteOverlay'

const MapboxBackground = dynamic(
  () => import('@/components/map/MapboxBackground').then((m) => m.MapboxBackground),
  { ssr: false }
)

interface MapShareClientProps {
  tripTitle: string
  startDate: string | null
  endDate: string | null
  routePoints: RoutePoint[]
  mapboxToken: string
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return ''
  const s = format(parseISO(start), 'MMM d, yyyy')
  if (!end || end === start) return s
  const e = format(parseISO(end), 'MMM d, yyyy')
  return `${s} — ${e}`
}

const ease = [0.22, 1, 0.36, 1] as const

export function MapShareClient({
  tripTitle,
  startDate,
  endDate,
  routePoints,
  mapboxToken,
}: MapShareClientProps) {
  const prefersReducedMotion = useReducedMotion()
  const [mapLoaded, setMapLoaded] = useState(false)

  const handleMapReady = useCallback(() => setMapLoaded(true), [])

  const dur = prefersReducedMotion ? 0 : 1

  const hasRoute = routePoints.length >= 2
  const dateRange = formatDateRange(startDate, endDate)

  return (
    <main className="relative w-full min-h-[100dvh] bg-ink overflow-hidden">

      {/* Grain overlay */}
      <div className="grain-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.025]" />

      {/* Full-bleed map */}
      <div className="absolute inset-0">
        {mapboxToken && (hasRoute || routePoints.length === 1) ? (
          <MapboxBackground
            token={mapboxToken}
            points={routePoints}
            onMapReady={handleMapReady}
          />
        ) : (
          /* No GPS fallback — atmospheric background */
          <div className="w-full h-full bg-ink">
            <div className="absolute inset-0 ambient-glow opacity-50" />
          </div>
        )}
      </div>

      {/* Top info overlay */}
      <motion.div
        className="relative z-20 px-6 pt-10 pb-4 md:px-12 md:pt-14"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mapLoaded || !mapboxToken ? 1 : 0, y: mapLoaded || !mapboxToken ? 0 : -20 }}
        transition={{ duration: dur, ease }}
      >
        {/* Eyebrow */}
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-parchment-600 mb-3 flex items-center gap-2">
          <MapPin size={10} strokeWidth={1.5} className="text-amber-accent" />
          Your Journey
        </p>

        {/* Trip title */}
        <h1
          className="font-serif text-[clamp(28px,5vw,52px)] font-medium leading-[1.1] tracking-[-0.02em] text-ink-50"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
        >
          {tripTitle}
        </h1>

        {/* Date range */}
        {dateRange && (
          <p className="mt-2 font-sans text-sm text-parchment-400" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
            {dateRange}
          </p>
        )}

        {/* Stops count */}
        {routePoints.length > 0 && (
          <p className="mt-1 font-sans text-[12px] text-parchment-600">
            {routePoints.length} {routePoints.length === 1 ? 'stop' : 'stops'}
          </p>
        )}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-10 md:px-12 md:pb-12"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.5) 60%, transparent 100%)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, delay: dur * 0.4, ease }}
      >
        {/* Location names */}
        {routePoints.some((p) => p.label) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {routePoints
              .filter((p) => p.label)
              .slice(0, 5)
              .map((p, i) => (
                <span
                  key={i}
                  className="font-sans text-[11px] uppercase tracking-[0.12em] text-parchment-600 px-2 py-1 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {p.label}
                </span>
              ))}
          </div>
        )}

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 group"
        >
          <span className="font-serif text-lg md:text-xl font-medium text-amber-accent transition-colors duration-200 group-hover:text-amber-bright">
            Create your own archive
          </span>
          <span className="w-7 h-7 rounded-full flex items-center justify-center border border-amber-accent/40 text-amber-accent group-hover:bg-amber-accent group-hover:text-ink transition-all duration-300">
            <ArrowRight size={14} strokeWidth={2} />
          </span>
        </Link>

        <p className="mt-3 font-sans text-[11px] text-parchment-600 tracking-[0.06em]">
          Made with{' '}
          <Link href="/" className="text-parchment-400 hover:text-amber-accent transition-colors duration-200">
            Trailfilm
          </Link>
        </p>
      </motion.div>

      {/* No GPS message */}
      {routePoints.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="font-sans text-sm text-parchment-600">No GPS coordinates available for this trip.</p>
        </div>
      )}
    </main>
  )
}
