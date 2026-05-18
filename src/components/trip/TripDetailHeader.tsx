import Link from 'next/link'
import type { Trip } from '@/types/database'

export function TripDetailHeader({ trip }: { trip: Trip }) {
  return (
    <header className="flex flex-col gap-1">
      <Link
        href="/dashboard"
        className="inline-flex items-center self-start font-sans text-sm font-medium text-parchment-400 transition-colors duration-300 ease-trailfilm hover:text-ink-50 hover:underline hover:decoration-amber-accent hover:underline-offset-4"
      >
        ← Your archive
      </Link>

      <h1 className="mt-4 font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink-50 md:text-[40px]">
        {trip.title}
      </h1>

      {trip.destination ? (
        <p className="mt-1 font-sans text-base text-parchment-400">{trip.destination}</p>
      ) : null}
    </header>
  )
}
