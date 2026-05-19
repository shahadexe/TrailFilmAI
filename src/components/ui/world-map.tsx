'use client'

import { useMemo, useRef } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo'
import type { GeoPermissibleObjects } from 'd3-geo'

interface Dot {
  start: { lat: number; lng: number }
  end:   { lat: number; lng: number }
}

interface WorldMapProps {
  dots?: Dot[]
  lineColor?: string
}

const WIDTH = 800
const HEIGHT = 450

export function WorldMap({ dots = [], lineColor = '#E5A663' }: WorldMapProps) {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-80px' })

  const projection = useMemo(
    () => geoNaturalEarth1().scale(160).translate([WIDTH / 2, HEIGHT / 2]).rotate([-10, 0]),
    []
  )
  const path = useMemo(() => geoPath(projection), [projection])

  function projectPoint(lat: number, lng: number): [number, number] | null {
    const p = projection([lng, lat])
    return p ? [p[0], p[1]] : null
  }

  const arcs = useMemo(() => {
    return dots.flatMap((dot) => {
      const start = projectPoint(dot.start.lat, dot.start.lng)
      const end   = projectPoint(dot.end.lat,   dot.end.lng)
      if (!start || !end) return []
      const [startX, startY] = start
      const [endX,   endY]   = end
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2
      const curvature = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      ) * 0.3
      const controlX = midX
      const controlY = midY - curvature
      const pathD = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`
      return [{ startX, startY, endX, endY, controlX, controlY, pathD }]
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dots, projection])

  const graticule = useMemo(() => geoGraticule()(), [])

  const latitudeLines = [60, 30, 0, -30, -60]

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox="0 0 800 450"
        style={{ width: '100%', height: 'auto' }}
        aria-hidden="true"
      >
        {/* Sphere background */}
        <path
          d={path({ type: 'Sphere' } as GeoPermissibleObjects) ?? ''}
          fill="rgba(255,255,255,0.015)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />

        {/* Graticule */}
        <path
          d={path(graticule) ?? ''}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="0.5"
        />

        {/* Latitude accent lines */}
        {latitudeLines.map((lat) => {
          const y = projection([0, lat])?.[1]
          if (y == null) return null
          if (lat === 0) {
            return (
              <line
                key={lat}
                x1="0"
                y1={y}
                x2={WIDTH}
                y2={y}
                stroke="rgba(229,166,99,0.10)"
                strokeWidth="1"
                strokeDasharray="6 10"
              />
            )
          }
          return (
            <line
              key={lat}
              x1="0"
              y1={y}
              x2={WIDTH}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Endpoint dots (always static) */}
        {arcs.map((arc, i) => (
          <g key={`dots-${i}`}>
            <circle cx={arc.startX} cy={arc.startY} r="2.5" fill={lineColor} opacity="0.8" />
            <circle cx={arc.endX}   cy={arc.endY}   r="2.5" fill={lineColor} opacity="0.8" />
          </g>
        ))}

        {/* Arcs */}
        {arcs.map((arc, i) =>
          shouldReduceMotion ? (
            <path
              key={i}
              d={arc.pathD}
              fill="none"
              stroke={lineColor}
              strokeWidth="1.5"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
          ) : (
            <motion.path
              key={i}
              d={arc.pathD}
              fill="none"
              stroke={lineColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isInView
                  ? { pathLength: 1, opacity: 0.7 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{
                pathLength: { duration: 1.5, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] },
                opacity:    { duration: 0.3, delay: i * 0.2 },
              }}
            />
          )
        )}

        {/* Traveling dots per arc */}
        {arcs.map((arc, i) =>
          shouldReduceMotion ? (
            <circle
              key={`sd-${i}`}
              cx={arc.controlX}
              cy={arc.controlY}
              r="3"
              fill={lineColor}
              opacity="0.9"
            />
          ) : (
            <circle key={`td-${i}`} r="3" fill={lineColor} opacity="0.9">
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
                path={arc.pathD}
              />
            </circle>
          )
        )}
      </svg>
    </div>
  )
}

export default WorldMap
