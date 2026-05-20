'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
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
}

export function ViewerMap({ chapterCoords, activeChapterIndex }: ViewerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [announcement, setAnnouncement] = useState('')
  const shouldReduceMotion = useReducedMotion()
  const sortedCoords = [...chapterCoords].sort((a, b) => a.chapterIndex - b.chapterIndex)

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: sortedCoords[0]
        ? [sortedCoords[0].lng, sortedCoords[0].lat]
        : [0, 0],
      zoom: 8,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    map.on('load', () => {
      // Dashed amber route line
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: sortedCoords.map(c => [c.lng, c.lat]),
          },
        },
      })
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#E5A663',
          'line-width': 2,
          'line-dasharray': [2, 2],
          'line-opacity': 0.7,
        },
      })

      // Chapter dot markers
      for (const coord of sortedCoords) {
        const el = document.createElement('div')
        el.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#E5A663;'
        el.dataset.chapterIndex = String(coord.chapterIndex)

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([coord.lng, coord.lat])
          .addTo(map)

        markersRef.current.push(marker)
      }
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update route + markers when coords change (e.g. after saving a new location)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const source = map.getSource('route') as mapboxgl.GeoJSONSource | undefined
    source?.setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: sortedCoords.map(c => [c.lng, c.lat]),
      },
    })

    // Re-sync markers
    for (const m of markersRef.current) m.remove()
    markersRef.current = []

    for (const coord of sortedCoords) {
      const el = document.createElement('div')
      el.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#E5A663;'
      if (!shouldReduceMotion && coord.chapterIndex === activeChapterIndex) {
        el.className = 'marker-pulse'
      }
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([coord.lng, coord.lat])
        .addTo(map)
      markersRef.current.push(marker)
    }
  }, [chapterCoords, activeChapterIndex, shouldReduceMotion, sortedCoords])

  // Pan to active chapter
  useEffect(() => {
    const map = mapRef.current
    if (activeChapterIndex === undefined || !map) return
    const coord = chapterCoords.find(c => c.chapterIndex === activeChapterIndex)
    if (!coord) return

    if (shouldReduceMotion) {
      map.jumpTo({ center: [coord.lng, coord.lat], zoom: 10 })
    } else {
      map.easeTo({ center: [coord.lng, coord.lat], zoom: 10, duration: 800 })
    }
    setAnnouncement('Map moved to ' + (coord.label ?? 'Chapter ' + (activeChapterIndex + 1)))
  }, [activeChapterIndex, chapterCoords, shouldReduceMotion])

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
        <div ref={containerRef} className="w-full h-full" />
        {chapterCoords.length === 0 && <NoGpsState />}
        <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
      </div>
    </div>
  )
}

export default ViewerMap
