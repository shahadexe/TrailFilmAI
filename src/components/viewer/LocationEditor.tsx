'use client'

import { useState, useCallback } from 'react'
import { MapPin, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import type { StoryChapter } from '@/types/database'
import type { ChapterCoord } from './ViewerMap'

interface ChapterLocationState {
  locationName: string
  pendingLat: number | null
  pendingLng: number | null
  saving: boolean
  saved: boolean
  error: string | null
}

interface LocationEditorProps {
  tripId: string
  chapters: StoryChapter[]
  /** Existing coords — chapters with GPS already have entries here */
  existingCoords: ChapterCoord[]
  onPinPlacingChange: (chapterIndex: number | undefined) => void
  /** Called after a location is successfully saved so the parent can refresh coords */
  onLocationSaved: (chapterIndex: number, lat: number, lng: number, label: string) => void
}

export function LocationEditor({
  tripId,
  chapters,
  existingCoords,
  onPinPlacingChange,
  onLocationSaved,
}: LocationEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [states, setStates] = useState<Record<string, ChapterLocationState>>(() => {
    const init: Record<string, ChapterLocationState> = {}
    for (const ch of chapters) {
      init[ch.id] = {
        locationName: ch.location_name ?? '',
        pendingLat: null,
        pendingLng: null,
        saving: false,
        saved: false,
        error: null,
      }
    }
    return init
  })

  const chaptersWithoutGps = chapters.filter(
    (ch) => !existingCoords.some((c) => c.chapterIndex === ch.chapter_index)
  )

  const setField = useCallback(
    (chapterId: string, patch: Partial<ChapterLocationState>) => {
      setStates((prev) => ({
        ...prev,
        [chapterId]: { ...prev[chapterId], ...patch },
      }))
    },
    []
  )

  // Called by parent when user clicks on map
  const handlePinPlaced = useCallback(
    (chapterId: string, lat: number, lng: number) => {
      setField(chapterId, { pendingLat: lat, pendingLng: lng })
    },
    [setField]
  )

  const handleSave = useCallback(
    async (chapter: StoryChapter) => {
      const s = states[chapter.id]
      if (!s || s.saving) return

      const trimmedName = s.locationName.trim()
      if (!trimmedName) {
        setField(chapter.id, { error: 'Enter a place name first.' })
        return
      }
      if (s.pendingLat === null || s.pendingLng === null) {
        setField(chapter.id, { error: 'Click the map to place a pin first.' })
        return
      }

      setField(chapter.id, { saving: true, error: null })

      try {
        const res = await fetch(
          `/api/trips/${tripId}/chapters/${chapter.id}/location`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location_name: trimmedName,
              lat: s.pendingLat,
              lng: s.pendingLng,
            }),
          }
        )

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error((data as { error?: string }).error ?? 'Save failed')
        }

        setField(chapter.id, { saving: false, saved: true, error: null })
        onLocationSaved(chapter.chapter_index, s.pendingLat, s.pendingLng, trimmedName)
        onPinPlacingChange(undefined)

        // Reset "saved" badge after 3 s
        setTimeout(() => setField(chapter.id, { saved: false }), 3000)
      } catch (err) {
        setField(chapter.id, {
          saving: false,
          error: err instanceof Error ? err.message : 'Save failed',
        })
      }
    },
    [states, tripId, setField, onLocationSaved, onPinPlacingChange]
  )

  if (chaptersWithoutGps.length === 0) return null

  return (
    <div className="absolute bottom-0 inset-x-0 z-10 bg-ink/95 backdrop-blur-sm border-t border-white/06">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-amber-accent flex-shrink-0" aria-hidden />
          <span className="font-sans text-[12px] font-medium text-parchment-300">
            Add missing locations ({chaptersWithoutGps.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-parchment-600" aria-hidden />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-parchment-600" aria-hidden />
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-3 px-4 pb-4 max-h-[40dvh] overflow-y-auto">
          {chaptersWithoutGps.map((chapter) => {
            const s = states[chapter.id]
            if (!s) return null
            const hasPendingPin = s.pendingLat !== null && s.pendingLng !== null

            return (
              <div
                key={chapter.id}
                className="flex flex-col gap-2 rounded-lg bg-white/04 border border-white/06 p-3"
              >
                <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-parchment-600">
                  Chapter {chapter.chapter_index + 1} — {chapter.title}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Place name (e.g. Kyoto, Japan)"
                    value={s.locationName}
                    onChange={(e) => setField(chapter.id, { locationName: e.target.value, error: null })}
                    className="flex-1 min-w-0 rounded-md bg-ink border border-white/10 px-3 py-1.5 font-sans text-[13px] text-parchment-200 placeholder:text-parchment-600 focus:outline-none focus:border-amber-accent/60"
                  />

                  <button
                    type="button"
                    onClick={() => onPinPlacingChange(chapter.chapter_index)}
                    className={[
                      'flex-shrink-0 flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-[12px] font-medium transition-colors',
                      hasPendingPin
                        ? 'bg-amber-accent/15 text-amber-accent border border-amber-accent/40'
                        : 'bg-white/06 text-parchment-400 border border-white/10 hover:border-amber-accent/40 hover:text-amber-accent',
                    ].join(' ')}
                  >
                    <MapPin className="h-3 w-3" aria-hidden />
                    {hasPendingPin ? 'Pinned' : 'Pin'}
                  </button>
                </div>

                {hasPendingPin && (
                  <p className="font-sans text-[11px] text-parchment-600">
                    {s.pendingLat!.toFixed(4)}, {s.pendingLng!.toFixed(4)}
                  </p>
                )}

                {s.error && (
                  <p className="font-sans text-[12px] text-red-400">{s.error}</p>
                )}

                <button
                  type="button"
                  disabled={s.saving || s.saved}
                  onClick={() => handleSave(chapter)}
                  className="self-end flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-[12px] font-medium bg-amber-accent text-ink disabled:opacity-50 hover:bg-[#FFC881] transition-colors"
                >
                  {s.saving ? (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  ) : s.saved ? (
                    <Check className="h-3 w-3" aria-hidden />
                  ) : null}
                  {s.saving ? 'Saving…' : s.saved ? 'Saved' : 'Save location'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Expose pin-placed handler type so CinematicViewer can bridge map clicks → editor
export type { ChapterLocationState }
