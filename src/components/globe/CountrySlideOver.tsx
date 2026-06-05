'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, ChevronRight } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { format, parseISO } from 'date-fns'

export interface TripForGlobe {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
  iso_country_code: string | null
  cover_url?: string
}

interface CountrySlideOverProps {
  countryName: string | null
  trips: TripForGlobe[]
  open: boolean
  onClose: () => void
}

function formatTripDate(start: string | null, end: string | null): string {
  if (!start) return ''
  const s = format(parseISO(start), 'MMM yyyy')
  if (!end || end === start) return s
  const e = format(parseISO(end), 'MMM yyyy')
  return `${s} — ${e}`
}

const ease = [0.22, 1, 0.36, 1] as const

export function CountrySlideOver({ countryName, trips, open, onClose }: CountrySlideOverProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[400px] border-l border-[rgba(255,255,255,0.06)] bg-[#0D0D0D] p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-parchment-600 mb-1 flex items-center gap-1.5">
                  <MapPin size={9} strokeWidth={1.5} className="text-amber-accent" />
                  Trips in
                </p>
                <SheetTitle className="font-serif text-xl font-medium text-ink-50 tracking-[-0.01em]">
                  {countryName ?? 'Unknown'}
                </SheetTitle>
                <p className="mt-1 font-sans text-xs text-parchment-600">
                  {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-parchment-600 hover:text-parchment-400 hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          </SheetHeader>

          {/* Trip list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            <AnimatePresence>
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease }}
                >
                  <Link
                    href={`/trip/${trip.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 p-3 rounded-xl hover-depth surface-card transition-all duration-300 hover:border-[rgba(229,166,99,0.2)]"
                  >
                    {/* Cover photo or placeholder */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-ink-700">
                      {trip.cover_url ? (
                        <img
                          src={trip.cover_url}
                          alt={trip.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin size={18} strokeWidth={1} className="text-parchment-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[15px] font-medium text-ink-50 truncate group-hover:text-amber-accent transition-colors duration-200">
                        {trip.title}
                      </p>
                      {(trip.start_date || trip.end_date) && (
                        <p className="font-sans text-xs text-parchment-600 mt-0.5">
                          {formatTripDate(trip.start_date, trip.end_date)}
                        </p>
                      )}
                    </div>

                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className="text-parchment-600 group-hover:text-amber-accent group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                    />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>

            {trips.length === 0 && (
              <p className="text-center font-sans text-sm text-parchment-600 py-8">
                No trips in this country yet.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
