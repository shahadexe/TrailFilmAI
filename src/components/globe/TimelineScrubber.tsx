'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

interface TimelineScrubberProps {
  years: number[]
  selectedYear: number | null
  onChange: (year: number | null) => void
}

export function TimelineScrubber({ years, selectedYear, onChange }: TimelineScrubberProps) {
  const sorted = [...years].sort()
  const [hovered, setHovered] = useState<number | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = parseInt(e.target.value, 10)
      if (idx === 0) {
        onChange(null)
      } else {
        onChange(sorted[idx - 1] ?? null)
      }
    },
    [sorted, onChange]
  )

  if (sorted.length === 0) return null

  const currentIdx = selectedYear ? sorted.indexOf(selectedYear) + 1 : 0
  const pct = sorted.length > 0 ? (currentIdx / (sorted.length)) * 100 : 0

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-30 px-6 pb-8 md:px-10"
      style={{
        background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.5) 60%, transparent 100%)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Year label */}
      <div className="mb-3 flex items-end justify-between">
        <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-parchment-600">
          Filter by year
        </p>
        <p className="font-serif text-lg font-medium text-amber-accent">
          {selectedYear ?? 'All time'}
        </p>
      </div>

      {/* Year tick labels */}
      <div className="relative mb-2">
        <div className="flex justify-between">
          <button
            onClick={() => onChange(null)}
            className={[
              'font-sans text-[11px] transition-colors duration-200',
              selectedYear === null ? 'text-amber-accent' : 'text-parchment-600 hover:text-parchment-400',
            ].join(' ')}
          >
            All
          </button>
          {sorted.map((yr) => (
            <button
              key={yr}
              onClick={() => onChange(selectedYear === yr ? null : yr)}
              onMouseEnter={() => setHovered(yr)}
              onMouseLeave={() => setHovered(null)}
              className={[
                'font-sans text-[11px] transition-colors duration-200',
                selectedYear === yr
                  ? 'text-amber-accent'
                  : hovered === yr
                  ? 'text-parchment-400'
                  : 'text-parchment-600',
              ].join(' ')}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Range input */}
      <input
        type="range"
        min={0}
        max={sorted.length}
        value={currentIdx}
        onChange={handleChange}
        className="globe-timeline-scrubber w-full"
        style={{ '--scrubber-pct': `${pct}%` } as React.CSSProperties}
        aria-label="Filter trips by year"
      />
    </motion.div>
  )
}
