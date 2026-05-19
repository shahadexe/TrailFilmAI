'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MoreVertical, Link as LucideLink, Check } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Trip } from '@/types/database'
import { RegenerationDialog } from './RegenerationDialog'

export function TripDetailHeader({ trip }: { trip: Trip }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPublic, setIsPublic] = useState<boolean>(trip.is_public)
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false)
  const [visibilityError, setVisibilityError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const shouldReduceMotion = useReducedMotion()
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

  async function handleVisibilityToggle() {
    setMenuOpen(false)
    setVisibilityError(null)
    setIsTogglingVisibility(true)
    const newValue = !isPublic
    setIsPublic(newValue) // optimistic update
    try {
      const res = await fetch(`/api/trips/${trip.id}/visibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: newValue }),
      })
      if (!res.ok) throw new Error('Failed')
    } catch {
      setIsPublic(!newValue) // revert on error
      setVisibilityError('Could not update visibility. Please try again.')
    } finally {
      setIsTogglingVisibility(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.origin + '/t/' + trip.id)
    setCopyState('copied')
    setTimeout(() => setCopyState('idle'), 2000)
  }

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

        <div className="flex items-center gap-2 flex-shrink-0">
          {isPublic && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy trip link"
              className="inline-flex h-8 items-center gap-1 rounded-lg px-3 font-sans text-sm font-medium text-parchment-200 transition-colors duration-200 ease-trailfilm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              style={{
                border: copyState === 'copied'
                  ? '1px solid rgba(229,166,99,0.4)'
                  : '1px solid rgba(255,255,255,0.08)',
                background: copyState === 'copied'
                  ? 'rgba(229,166,99,0.08)'
                  : 'rgba(255,255,255,0.04)',
                color: copyState === 'copied' ? '#E5A663' : undefined,
              }}
            >
              {copyState === 'copied' ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" style={{ color: '#E5A663' }} />
              ) : (
                <LucideLink className="h-3.5 w-3.5 flex-shrink-0 text-parchment-400" aria-hidden="true" />
              )}
              <AnimatePresence mode="wait">
                {copyState === 'idle' ? (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="hidden sm:inline"
                  >
                    Copy link
                  </motion.span>
                ) : (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="hidden sm:inline"
                  >
                    Copied
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Screen reader live region for copy confirmation */}
              <span aria-live="polite" aria-atomic="true" className="sr-only">
                {copyState === 'copied' ? 'Link copied to clipboard.' : ''}
              </span>
            </button>
          )}

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
                  {trip.generation_status === 'completed' && (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={isTogglingVisibility}
                      onClick={isTogglingVisibility ? undefined : handleVisibilityToggle}
                      className={`w-full px-4 py-2.5 text-left font-sans text-sm font-normal transition-colors duration-200 ease-trailfilm ${
                        isTogglingVisibility
                          ? 'cursor-not-allowed opacity-50 text-ink-50'
                          : 'text-ink-50 hover:bg-ink-700'
                      }`}
                    >
                      {isTogglingVisibility ? 'Updating…' : isPublic ? 'Make private' : 'Make public'}
                    </button>
                  )}
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
        </div>
      </header>

      {visibilityError && (
        <p className="mt-2 font-sans text-xs text-error">{visibilityError}</p>
      )}

      <RegenerationDialog open={dialogOpen} onOpenChange={setDialogOpen} trip={trip} />
    </>
  )
}
