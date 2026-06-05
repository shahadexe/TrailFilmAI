'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export interface RoutePoint {
  lat: number
  lng: number
  label?: string
}

interface PixelPoint {
  x: number
  y: number
}

interface SVGRouteOverlayProps {
  map: mapboxgl.Map | null
  points: RoutePoint[]
}

function quadraticBezierPath(p1: PixelPoint, p2: PixelPoint): string {
  const mx = (p1.x + p2.x) / 2
  const my = (p1.y + p2.y) / 2
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  // Control point lifts above midpoint — arc height proportional to distance
  const lift = Math.min(dist * 0.35, 120)
  const cx = mx
  const cy = my - lift
  return `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`
}

export function SVGRouteOverlay({ map, points }: SVGRouteOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [pixelPoints, setPixelPoints] = useState<PixelPoint[]>([])
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!map || points.length === 0) return

    function projectPoints() {
      if (!map) return
      const projected = points.map((p) => {
        const px = map.project([p.lng, p.lat])
        return { x: px.x, y: px.y }
      })
      setPixelPoints(projected)
    }

    projectPoints()

    map.on('move', projectPoints)
    map.on('zoom', projectPoints)
    map.on('resize', projectPoints)

    return () => {
      map.off('move', projectPoints)
      map.off('zoom', projectPoints)
      map.off('resize', projectPoints)
    }
  }, [map, points])

  if (pixelPoints.length === 0) return null

  const animDuration = prefersReducedMotion ? 0 : 2.4

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ zIndex: 10 }}
    >
      <defs>
        <filter id="route-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="marker-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Arc paths between consecutive stops */}
      {pixelPoints.map((pt, i) => {
        if (i === pixelPoints.length - 1) return null
        const next = pixelPoints[i + 1]
        const d = quadraticBezierPath(pt, next)
        const totalLen = 400 + i * 120 // approximate

        return (
          <g key={`arc-${i}`}>
            {/* Glow underlayer */}
            <path
              d={d}
              fill="none"
              stroke="rgba(229, 166, 99, 0.25)"
              strokeWidth="6"
              filter="url(#route-glow)"
            />
            {/* Main animated dash line */}
            <path
              d={d}
              fill="none"
              stroke="#E5A663"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${totalLen}`}
              strokeDashoffset={`${totalLen}`}
              filter="url(#route-glow)"
              style={{
                animation: animDuration > 0
                  ? `route-draw ${animDuration}s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.3}s forwards`
                  : undefined,
                '--path-length': totalLen,
              } as React.CSSProperties}
            />
            {/* Traveling dash overlay */}
            <path
              d={d}
              fill="none"
              stroke="rgba(229, 166, 99, 0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="8 16"
              strokeDashoffset="60"
              style={{
                animation: animDuration > 0
                  ? `dash-travel 1.2s linear ${i * 0.3 + animDuration}s infinite`
                  : undefined,
              }}
            />
          </g>
        )
      })}

      {/* Markers */}
      {pixelPoints.map((pt, i) => (
        <g key={`marker-${i}`}>
          {/* Ping ring */}
          <circle
            cx={pt.x}
            cy={pt.y}
            r="8"
            fill="none"
            stroke="#E5A663"
            strokeWidth="1.5"
            opacity="0"
            style={{
              animation: animDuration > 0
                ? `marker-ping 2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.3 + animDuration * 0.8}s infinite`
                : undefined,
            }}
          />
          {/* Dot */}
          <circle
            cx={pt.x}
            cy={pt.y}
            r="5"
            fill="#E5A663"
            filter="url(#marker-glow)"
            opacity="0"
            style={{
              animation: animDuration > 0
                ? `reveal-fade 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.3 + animDuration * 0.6}s forwards`
                : undefined,
              ...(animDuration === 0 ? { opacity: 1 } : {}),
            }}
          />
          {/* Inner dot */}
          <circle
            cx={pt.x}
            cy={pt.y}
            r="2.5"
            fill="#FAFAF7"
            opacity={animDuration === 0 ? 1 : 0}
            style={{
              animation: animDuration > 0
                ? `reveal-fade 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.3 + animDuration * 0.6}s forwards`
                : undefined,
            }}
          />
        </g>
      ))}
    </svg>
  )
}
