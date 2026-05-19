'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MapPin, Check, Loader2, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
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
  existingCoords: ChapterCoord[]
  onLocationSaved: (chapterIndex: number, lat: number, lng: number, label: string) => void
}

// ─── Place search input (one per chapter) ──────────────────────────────────────

interface PlaceSearchProps {
  chapterId: string
  initialValue: string
  onPlaceSelected: (name: string, lat: number, lng: number) => void
  onClear: () => void
  hasPendingPin: boolean
}

function PlaceSearch({ chapterId, initialValue, onPlaceSelected, onClear, hasPendingPin }: PlaceSearchProps) {
  const placesLib = useMapsLibrary('places')
  const inputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null)
  const [inputValue, setInputValue] = useState(initialValue)

  useEffect(() => {
    if (!placesLib || !inputRef.current || autocompleteRef.current) return

    const ac = new placesLib.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      const lat = place.geometry?.location?.lat()
      const lng = place.geometry?.location?.lng()
      if (lat == null || lng == null) return

      const label = place.name ?? place.formatted_address ?? inputRef.current?.value ?? ''
      setInputValue(label)
      onPlaceSelected(label, lat, lng)
    })

    autocompleteRef.current = ac
  }, [placesLib, onPlaceSelected])

  function handleClear() {
    setInputValue('')
    onClear()
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex-1 min-w-0">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-parchment-600 pointer-events-none" aria-hidden />
      <input
        ref={inputRef}
        id={`place-search-${chapterId}`}
        type="text"
        placeholder="Search for a place…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={[
          'w-full rounded-md bg-ink border px-3 py-1.5 pl-8 font-sans text-[13px] text-parchment-200',
          'placeholder:text-parchment-600 focus:outline-none transition-colors',
          hasPendingPin
            ? 'border-amber-accent/50 bg-amber-accent/05'
            : 'border-white/10 focus:border-amber-accent/60',
        ].join(' ')}
        autoComplete="off"
      />
      {(inputValue || hasPendingPin) && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear location"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-parchment-600 hover:text-parchment-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Main editor ───────────────────────────────────────────────────────────────

export function LocationEditor({
  tripId,
  chapters,
  existingCoords,
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

  const handlePlaceSelected = useCallback(
    (chapterId: string, name: string, lat: number, lng: number) => {
      setField(chapterId, { locationName: name, pendingLat: lat, pendingLng: lng, error: null })
    },
    [setField]
  )

  const handleClear = useCallback(
    (chapterId: string) => {
      setField(chapterId, { locationName: '', pendingLat: null, pendingLng: null, error: null })
    },
    [setField]
  )

  const handleSave = useCallback(
    async (chapter: StoryChapter) => {
      const s = states[chapter.id]
      if (!s || s.saving) return

      if (!s.locationName.trim()) {
        setField(chapter.id, { error: 'Search and select a place first.' })
        return
      }
      if (s.pendingLat === null || s.pendingLng === null) {
        setField(chapter.id, { error: 'Select a place from the dropdown to get coordinates.' })
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
              location_name: s.locationName.trim(),
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
        onLocationSaved(chapter.chapter_index, s.pendingLat, s.pendingLng, s.locationName.trim())

        setTimeout(() => setField(chapter.id, { saved: false }), 3000)
      } catch (err) {
        setField(chapter.id, {
          saving: false,
          error: err instanceof Error ? err.message : 'Save failed',
        })
      }
    },
    [states, tripId, setField, onLocationSaved]
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

                <PlaceSearch
                  chapterId={chapter.id}
                  initialValue={s.locationName}
                  onPlaceSelected={(name, lat, lng) => handlePlaceSelected(chapter.id, name, lat, lng)}
                  onClear={() => handleClear(chapter.id)}
                  hasPendingPin={hasPendingPin}
                />

                {hasPendingPin && (
                  <p className="font-sans text-[11px] text-parchment-600 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-amber-accent/70" aria-hidden />
                    {s.pendingLat!.toFixed(4)}, {s.pendingLng!.toFixed(4)}
                  </p>
                )}

                {s.error && (
                  <p className="font-sans text-[12px] text-red-400">{s.error}</p>
                )}

                <button
                  type="button"
                  disabled={s.saving || s.saved || !hasPendingPin}
                  onClick={() => handleSave(chapter)}
                  className="self-end flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-[12px] font-medium bg-amber-accent text-ink disabled:opacity-40 hover:bg-[#FFC881] transition-colors"
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

export type { ChapterLocationState }
