'use client'

import { useEffect, useState } from 'react'
import { Map, AdvancedMarker, Polyline, useMap } from '@vis.gl/react-google-maps'
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
  const [announcement, setAnnouncement] = useState('')
  const shouldReduceMotion = useReducedMotion()
  const map = useMap()
  const sortedCoords = [...chapterCoords].sort((a, b) => a.chapterIndex - b.chapterIndex)

  useEffect(() => {
    if (activeChapterIndex === undefined || !map) return
    const coord = chapterCoords.find(c => c.chapterIndex === activeChapterIndex)
    if (!coord) return
    map.panTo({ lat: coord.lat, lng: coord.lng })
    map.setZoom(10)
    setAnnouncement('Map moved to ' + (coord.label ?? 'Chapter ' + (activeChapterIndex + 1)))
  }, [activeChapterIndex, chapterCoords, map])

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
          style={{ width: '100%', height: '100%' }}
        >
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
        </Map>

        {chapterCoords.length === 0 && <NoGpsState />}

        <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
      </div>
    </div>
  )
}

export default ViewerMap
