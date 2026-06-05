'use client'

import { useEffect, useRef, useState } from 'react'
import type mapboxgl from 'mapbox-gl'
import type { RoutePoint } from './SVGRouteOverlay'
import { SVGRouteOverlay } from './SVGRouteOverlay'

interface MapboxBackgroundProps {
  token: string
  points: RoutePoint[]
  onMapReady?: (map: mapboxgl.Map) => void
}

export function MapboxBackground({ token, points, onMapReady }: MapboxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return

    let mapInstance: mapboxgl.Map

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import('mapbox-gl').then((mod: any) => {
      // mapbox-gl exports itself as default in ESM or as the module in CJS
      const mbgl = (mod.default ?? mod) as typeof mapboxgl
      mbgl.accessToken = token

      mapInstance = new mbgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        interactive: false,
        attributionControl: false,
        logoPosition: 'bottom-right',
      })

      mapInstance.on('load', () => {
        if (points.length === 1) {
          mapInstance.setCenter([points[0].lng, points[0].lat])
          mapInstance.setZoom(8)
        } else if (points.length > 1) {
          const lngs = points.map((p) => p.lng)
          const lats = points.map((p) => p.lat)
          const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)]
          const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)]
          mapInstance.fitBounds([sw, ne], {
            padding: { top: 80, bottom: 160, left: 80, right: 80 },
            maxZoom: 7,
          })
        }

        setMap(mapInstance)
        onMapReady?.(mapInstance)
      })
    })

    return () => {
      mapInstance?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      {/* Custom dark vignette over Mapbox */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.7) 100%)',
          zIndex: 5,
        }}
      />
      <SVGRouteOverlay map={map} points={points} />
    </div>
  )
}
