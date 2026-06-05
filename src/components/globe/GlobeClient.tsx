'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CountrySlideOver, type TripForGlobe } from './CountrySlideOver'
import { TimelineScrubber } from './TimelineScrubber'

interface GlobeClientProps {
  trips: TripForGlobe[]
}

interface CountryPolygon {
  properties: {
    ISO_A2: string
    ADMIN: string
  }
}

const AMBER = 'rgba(229, 166, 99, 0.85)'
const AMBER_HOVER = 'rgba(255, 200, 129, 0.95)'
const UNVISITED = 'rgba(31, 31, 31, 0.8)'
const STROKE = 'rgba(255, 255, 255, 0.04)'

export default function GlobeClient({ trips }: GlobeClientProps) {
  const globeRef = useRef<{ controls: () => { autoRotate: boolean; autoRotateSpeed: number; enableZoom: boolean }; pointOfView: (pov: object, ms: number) => void } | null>(null)
  const [worldData, setWorldData] = useState<CountryPolygon[]>([])
  const [hoverCountry, setHoverCountry] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [globeReady, setGlobeReady] = useState(false)
  const [Globe, setGlobe] = useState<React.ComponentType<Record<string, unknown>> | null>(null)

  // Load react-globe.gl dynamically
  useEffect(() => {
    import('react-globe.gl').then((mod) => {
      setGlobe(() => mod.default as React.ComponentType<Record<string, unknown>>)
    })
  }, [])

  // Load world GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then((r) => r.json())
      .then((data) => {
        setWorldData(data.features as CountryPolygon[])
      })
      .catch(() => {})
  }, [])

  // Derive visited countries filtered by year
  const visitedCodes = useMemo(() => {
    const filtered = selectedYear
      ? trips.filter((t) => {
          const yr = t.start_date ? new Date(t.start_date).getFullYear() : null
          return yr === selectedYear
        })
      : trips
    return new Set(filtered.map((t) => t.iso_country_code).filter(Boolean) as string[])
  }, [trips, selectedYear])

  // Available years
  const years = useMemo(() => {
    const yrs = new Set(
      trips
        .map((t) => (t.start_date ? new Date(t.start_date).getFullYear() : null))
        .filter(Boolean) as number[]
    )
    return Array.from(yrs).sort()
  }, [trips])

  // Globe ready callback
  const handleGlobeReady = useCallback(() => {
    setGlobeReady(true)
    if (globeRef.current) {
      const controls = globeRef.current.controls()
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.4
      controls.enableZoom = false
    }
  }, [])

  // Stop rotation on interaction
  const stopRotation = useCallback(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false
    }
  }, [])

  const handlePolygonHover = useCallback((polygon: CountryPolygon | null) => {
    setHoverCountry(polygon?.properties?.ISO_A2 ?? null)
  }, [])

  const handlePolygonClick = useCallback(
    (polygon: CountryPolygon) => {
      stopRotation()
      const code = polygon.properties?.ISO_A2
      const name = polygon.properties?.ADMIN
      if (!code) return
      setSelectedCountry({ code, name })
    },
    [stopRotation]
  )

  const tripsForCountry = useMemo(() => {
    if (!selectedCountry) return []
    return trips.filter((t) => t.iso_country_code === selectedCountry.code)
  }, [trips, selectedCountry])

  const getCapColor = useCallback(
    (polygon: CountryPolygon) => {
      const code = polygon.properties?.ISO_A2
      if (code === hoverCountry) return AMBER_HOVER
      if (visitedCodes.has(code)) return AMBER
      return UNVISITED
    },
    [visitedCodes, hoverCountry]
  )

  const getSideColor = useCallback(
    (polygon: CountryPolygon) => {
      const code = polygon.properties?.ISO_A2
      if (visitedCodes.has(code)) return 'rgba(229, 166, 99, 0.15)'
      return 'rgba(0,0,0,0.1)'
    },
    [visitedCodes]
  )

  return (
    <div className="relative w-full h-full" onClick={stopRotation}>
      {/* Globe */}
      <motion.div
        className="globe-container w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: globeReady ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {Globe && worldData.length > 0 && (
          <Globe
            ref={globeRef}
            globeImageUrl=""
            backgroundColor="rgba(0,0,0,0)"
            atmosphereColor="rgba(229, 166, 99, 0.12)"
            atmosphereAltitude={0.15}
            polygonsData={worldData}
            polygonCapColor={getCapColor as (d: object) => string}
            polygonSideColor={getSideColor as (d: object) => string}
            polygonStrokeColor={() => STROKE}
            polygonAltitude={(d: object) => {
              const polygon = d as CountryPolygon
              const code = polygon.properties?.ISO_A2
              if (code === hoverCountry) return 0.015
              if (visitedCodes.has(code)) return 0.006
              return 0.001
            }}
            onPolygonHover={handlePolygonHover as (d: object | null) => void}
            onPolygonClick={handlePolygonClick as (d: object) => void}
            polygonLabel={(d: object) => {
              const polygon = d as CountryPolygon
              const code = polygon.properties?.ISO_A2
              const name = polygon.properties?.ADMIN
              const count = trips.filter((t) => t.iso_country_code === code).length
              if (count === 0) return ''
              return `<div style="
                font-family: Inter, sans-serif;
                font-size: 12px;
                color: #E8E6DF;
                background: rgba(10,10,10,0.9);
                border: 1px solid rgba(229,166,99,0.3);
                padding: 6px 10px;
                border-radius: 8px;
                backdrop-filter: blur(8px);
              ">
                <strong style="color:#E5A663">${name}</strong><br/>
                ${count} ${count === 1 ? 'trip' : 'trips'}
              </div>`
            }}
            onGlobeReady={handleGlobeReady}
            width={typeof window !== 'undefined' ? window.innerWidth : 800}
            height={typeof window !== 'undefined' ? window.innerHeight : 600}
          />
        )}
      </motion.div>

      {/* Timeline scrubber */}
      {years.length > 1 && (
        <TimelineScrubber
          years={years}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
        />
      )}

      {/* Country slide-over */}
      <CountrySlideOver
        countryName={selectedCountry?.name ?? null}
        trips={tripsForCountry}
        open={selectedCountry !== null}
        onClose={() => setSelectedCountry(null)}
      />

      {/* Empty state */}
      {trips.length === 0 && globeReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center px-6">
            <p className="font-serif text-xl text-parchment-400">No trips mapped yet.</p>
            <p className="mt-2 font-sans text-sm text-parchment-600">
              Countries will glow amber as you add trips with GPS photos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
