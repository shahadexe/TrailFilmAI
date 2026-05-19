'use client'

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { NoGpsState } from '@/components/viewer/NoGpsState'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

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
  children?: ReactNode
}

export function ViewerMap({
  chapterCoords,
  activeChapterIndex,
  pinPlacingForChapter,
  onPinPlaced,
  onCancelPinPlacing,
  children,
}: ViewerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const pendingMarker = useRef<mapboxgl.Marker | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const isPlacing = pinPlacingForChapter !== undefined

  // Effect 1 — map initialization (mount once)
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [chapterCoords[0]?.lng ?? 0, chapterCoords[0]?.lat ?? 0],
      zoom: 8,
      interactive: true,
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Effect 2 — markers + path (re-run when chapterCoords changes)
  useEffect(() => {
    if (!map.current || chapterCoords.length === 0) return

    const markers: mapboxgl.Marker[] = []

    const addMarkersAndPath = () => {
      if (!map.current) return

      // Remove previously added route layer/source if they exist
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route')
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route')
      }

      // Add amber dot markers — 8px per UI-SPEC
      chapterCoords.forEach((coord) => {
        const el = document.createElement('div')
        el.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#E5A663;'
        const marker = new mapboxgl.Marker(el)
          .setLngLat([coord.lng, coord.lat])
          .addTo(map.current!)
        markers.push(marker)
      })

      // Dashed amber path line — D-05 decision: dashed = archival/editorial
      if (chapterCoords.length > 1) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: chapterCoords.map((c) => [c.lng, c.lat]),
            },
          },
        })

        // Guard: only add the layer if the source was successfully registered
        if (map.current.getSource('route')) {
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#E5A663',
              'line-width': 2,
              'line-opacity': 0.8,
              'line-dasharray': [2, 2],
            },
          })
        }
      }
    }

    if (map.current.isStyleLoaded()) {
      addMarkersAndPath()
    } else {
      map.current.once('style.load', addMarkersAndPath)
    }

    return () => {
      map.current?.off('style.load', addMarkersAndPath)
      markers.forEach((m) => m.remove())
      if (map.current?.getLayer('route')) map.current.removeLayer('route')
      if (map.current?.getSource('route')) map.current.removeSource('route')
    }
  }, [chapterCoords])

  // Effect 3 — flyTo on active chapter change
  useEffect(() => {
    if (activeChapterIndex === undefined || !map.current || isPlacing) return

    const coord = chapterCoords.find((c) => c.chapterIndex === activeChapterIndex)
    if (!coord) return

    map.current.flyTo({
      center: [coord.lng, coord.lat],
      zoom: 10,
      duration: 1500,
      essential: true,
    })

    const label = coord.label ?? `Chapter ${activeChapterIndex + 1}`
    setAnnouncement(`Map moved to ${label}`)
  }, [activeChapterIndex, chapterCoords, isPlacing])

  // Effect 4 — click-to-place pin mode
  const handleMapClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (pinPlacingForChapter === undefined || !map.current) return

      const { lat, lng } = e.lngLat

      // Remove previous pending marker
      pendingMarker.current?.remove()

      // Place a larger amber pin to distinguish from chapter markers
      const el = document.createElement('div')
      el.style.cssText =
        'width:14px;height:14px;border-radius:50%;background:#E5A663;border:2px solid #fff;box-shadow:0 0 0 3px rgba(229,166,99,0.35);'
      pendingMarker.current = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current)

      onPinPlaced?.(pinPlacingForChapter, lat, lng)
    },
    [pinPlacingForChapter, onPinPlaced]
  )

  useEffect(() => {
    if (!map.current) return

    if (isPlacing) {
      map.current.getCanvas().style.cursor = 'crosshair'
      map.current.on('click', handleMapClick)
    } else {
      map.current.getCanvas().style.cursor = ''
      map.current.off('click', handleMapClick)
      pendingMarker.current?.remove()
      pendingMarker.current = null
    }

    return () => {
      map.current?.off('click', handleMapClick)
    }
  }, [isPlacing, handleMapClick])

  return (
    <div
      role="region"
      aria-label="Trip route map"
      tabIndex={0}
      className={[
        // Base (mobile): fixed bottom sheet
        'fixed bottom-0 left-0 right-0 h-[40dvh] z-20',
        'border-t border-[rgba(255,255,255,0.06)] bg-ink/90 backdrop-blur-xl',
        // Desktop (md+): fixed right sidebar
        'md:top-0 md:left-auto md:right-0 md:bottom-auto',
        'md:h-[100dvh] md:w-[38vw]',
        'md:border-t-0 md:border-l md:border-[rgba(255,255,255,0.06)]',
        'md:bg-ink md:backdrop-blur-none',
      ].join(' ')}
    >
      <div className="relative w-full h-full">
        <div ref={mapContainer} className="absolute inset-0" />
        {chapterCoords.length === 0 && !isPlacing && <NoGpsState />}

        {/* Pin-placing mode overlay hint */}
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

        {/* Visually hidden live region */}
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>

        {children}
      </div>
    </div>
  )
}

export default ViewerMap
