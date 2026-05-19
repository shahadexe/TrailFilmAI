'use client'

import { MapPin } from 'lucide-react'

export function NoGpsState() {
  return (
    <div
      aria-hidden="false"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
    >
      <MapPin
        aria-hidden="true"
        className="h-5 w-5 text-parchment-600 opacity-50"
        strokeWidth={1.5}
      />
      <p className="font-sans text-[13px] text-parchment-600 text-center opacity-50">
        No location data
      </p>
    </div>
  )
}
