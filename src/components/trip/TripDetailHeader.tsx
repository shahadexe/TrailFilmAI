'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import type { Trip } from '@/types/database'
import { RegenerationDialog } from './RegenerationDialog'

export function TripDetailHeader({ trip }: { trip: Trip }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const showMenu = trip.generation_status === 'completed' || trip.generation_status === 'failed'

  useEffect(() => {
    if (!menuOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
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
        </div>

        {showMenu && (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Trip options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-parchment-400 transition-colors duration-200 ease-trailfilm hover:bg-ink-700 hover:text-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 min-w-[200px] overflow-hidden rounded-md border border-ink-700 bg-ink-800 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    setDialogOpen(true)
                  }}
                  className="w-full px-4 py-2.5 text-left font-sans text-sm font-normal text-ink-50 transition-colors duration-200 ease-trailfilm hover:bg-ink-700"
                >
                  Change tone &amp; regenerate
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <RegenerationDialog open={dialogOpen} onOpenChange={setDialogOpen} trip={trip} />
    </>
  )
}
