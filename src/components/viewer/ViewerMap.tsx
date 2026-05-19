'use client'

import { useEffect, useState } from 'react'
import { Map, AdvancedMarker, Polyline, useMap } from '@vis.gl/react-google-maps'
import type { MapMouseEvent } from '@vis.gl/react-google-maps'
import { useReducedMotion } from 'framer-motion'
import { NoGpsState } from '@/components/viewer/NoGpsState'

export interface ChapterCoord {
  chapterIndex: number
  lat: number
  lng: number
  label?: string
}

interface ViewerMapProps {
  chapterCoords: ChapterCoord[]
  activeChapterIndex?: number
  /** When provided, map enters "place pin" mode for this chapter index */
  pinPlacingForChapter?: number
  onPinPlaced?: (chapterIndex: number, lat: number, lng: number) => void
  onCancelPinPlacing?: () => void
}

export function ViewerMap({
  chapterCoords,
  activeChapterIndex,
  pinPlacingForChapter,
  onPinPlaced,
  onCancelPinPlacing,
}: ViewerMapProps) {
  const [announcement, setAnnouncement] = useState('')
  const [pendingCoord, setPendingCoord] = useState<{ lat: number; lng: number } | null>(null)

  const isPlacing = pinPlacingForChapter !== undefined
  const shouldReduceMotion = useReducedMotion()
  const map = useMap()
  const sortedCoords = [...chapterCoords].sort((a, b) => a.chapterIndex - b.chapterIndex)

  // Effect 1 — flyTo equivalent
  useEffect(() => {
    if (activeChapterIndex === undefined || !map || isPlacing) return
    const coord = chapterCoords.find(c => c.chapterIndex === activeChapterIndex)
    if (!coord) return
    map.panTo({ lat: coord.lat, lng: coord.lng })
    map.setZoom(10)
    setAnnouncement('Map moved to ' + (coord.label ?? 'Chapter ' + (activeChapterIndex + 1)))
  }, [activeChapterIndex, chapterCoords, isPlacing, map])

  // Effect 2 — clear pending coord when leaving pin-placing mode
  useEffect(() => {
    if (!isPlacing) setPendingCoord(null)
  }, [isPlacing])

  function handleMapClick(e: MapMouseEvent) {
    if (pinPlacingForChapter === undefined) return
    const lat = e.detail.latLng?.lat
    const lng = e.detail.latLng?.lng
    if (lat == null || lng == null) return
    setPendingCoord({ lat, lng })
    onPinPlaced?.(pinPlacingForChapter, lat, lng)
  }

  return (
    <div
      role="region"
      aria-label="Trip route map"
      tabIndex={0}
      className={[
        'fixed bottom-0 left-0 right-0 h-[40dvh] z-20',
        'border-t border-[rgba(255,255,255,0.06)] bg-ink/90 backdrop-blur-xl',
        'md:top-0 md:left-auto md:right-0 md:bottom-auto',
        'md:h-[100dvh] md:w-[38vw]',
        'md:border-t-0 md:border-l md:border-[rgba(255,255,255,0.06)]',
        'md:bg-ink md:backdrop-blur-none',
      ].join(' ')}
    >
      <div className="relative w-full h-full">
        <Map
          defaultCenter={{ lat: sortedCoords[0]?.lat ?? 0, lng: sortedCoords[0]?.lng ?? 0 }}
          defaultZoom={8}
          colorScheme="DARK"
          disableDefaultUI={true}
          gestureHandling="greedy"
          clickableIcons={false}
          style={{ width: '100%', height: '100%', cursor: isPlacing ? 'crosshair' : undefined }}
          onClick={isPlacing ? handleMapClick : undefined}
        >
          {/* Chapter markers */}
          {sortedCoords.map((coord) => {
            const isActive = coord.chapterIndex === activeChapterIndex
            return (
              <AdvancedMarker key={coord.chapterIndex} position={{ lat: coord.lat, lng: coord.lng }}>
                <div
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E5A663' }}
                  className={isActive && !shouldReduceMotion ? 'marker-pulse' : ''}
                />
              </AdvancedMarker>
            )
          })}

          {/* Dashed amber Polyline */}
          {sortedCoords.length > 1 && (
            <Polyline
              path={sortedCoords.map(c => ({ lat: c.lat, lng: c.lng }))}
              strokeColor="#E5A663"
              strokeOpacity={0}
              strokeWeight={2}
              icons={[{
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
                offset: '0',
                repeat: '12px',
              }]}
            />
          )}

          {/* Pending pin (click-to-place mode) */}
          {isPlacing && pendingCoord && (
            <AdvancedMarker position={pendingCoord}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#E5A663', border: '2px solid #fff',
                boxShadow: '0 0 0 3px rgba(229,166,99,0.35)',
              }} />
            </AdvancedMarker>
          )}
        </Map>

        {/* NoGpsState fallback */}
        {chapterCoords.length === 0 && !isPlacing && <NoGpsState />}

        {/* Pin-placing overlay */}
        {isPlacing && (
          <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between gap-2 rounded-lg bg-ink/90 backdrop-blur-sm px-3 py-2 border border-amber-accent/30">
            <p className="font-sans text-[12px] text-amber-accent">
              Click map to place location pin
            </p>
            <button
              type="button"
              onClick={onCancelPinPlacing}
              className="font-sans text-[11px] uppercase tracking-[0.08em] text-parchment-400 hover:text-parchment-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* sr-only live region */}
        <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
      </div>
    </div>
  )
}

export default ViewerMap
