'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Images } from 'lucide-react'

// Client-side MIME filter — reduces UX friction by rejecting obviously wrong file types early.
// Server-side enforcement is via Supabase bucket MIME restriction policy (Phase 1).
// File.type is extension-derived on most platforms and can be spoofed; the bucket
// rejects non-image content regardless of what the browser reports.
const ACCEPTED_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_PHOTOS = 12

export interface PhotoDropzoneProps {
  existingCount: number
  onFilesAccepted: (files: File[]) => void
  disabled?: boolean
}

export function PhotoDropzone({ existingCount, onFilesAccepted, disabled = false }: PhotoDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [rejectMessage, setRejectMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const shouldReduce = useReducedMotion()

  useEffect(() => {
    if (!rejectMessage) return
    const id = setTimeout(() => setRejectMessage(null), 4000)
    return () => clearTimeout(id)
  }, [rejectMessage])

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleFiles = useCallback(
    (filesIn: FileList | File[]) => {
      const all = Array.from(filesIn)
      const accepted = all.filter((f) => (ACCEPTED_MIMES as readonly string[]).includes(f.type))
      const rejected = all.filter((f) => !(ACCEPTED_MIMES as readonly string[]).includes(f.type))

      if (rejected.length > 0) {
        setRejectMessage('Only JPEG, PNG, or WebP files are accepted.')
      }

      const cap = Math.max(0, MAX_PHOTOS - existingCount)
      let toAdd = accepted
      if (accepted.length > cap) {
        setRejectMessage('12 photos is the maximum. Extra files were skipped.')
        toAdd = accepted.slice(0, cap)
      }

      if (toAdd.length > 0) {
        onFilesAccepted(toAdd)
      }
    },
    [existingCount, onFilesAccepted]
  )

  const remaining = MAX_PHOTOS - existingCount

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Add photos — drop here or press to open file picker"
        animate={
          isDragOver
            ? { borderColor: 'rgba(229,166,99,0.6)', backgroundColor: 'rgba(229,166,99,0.04)' }
            : { borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(13,13,13,0.6)' }
        }
        transition={{ duration: shouldReduce ? 0 : 0.2 }}
        className={[
          'flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          disabled ? 'pointer-events-none opacity-40' : 'hover:border-[rgba(255,255,255,0.14)]',
        ]
          .filter(Boolean)
          .join(' ')}
        onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
      >
        {/* Concentric ring pulse on drag-over */}
        {isDragOver && !shouldReduce && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-amber-accent/30"
                style={{
                  width:  '40%',
                  height: '40%',
                  animation: 'expand-ring 1.7s ease-out infinite',
                  animationDelay: `${i * 0.38}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Icon */}
        <motion.div
          animate={isDragOver ? { scale: shouldReduce ? 1 : 1.1, y: shouldReduce ? 0 : -2 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)]"
        >
          <Images
            aria-hidden
            className={`h-5 w-5 transition-colors duration-200 ${isDragOver ? 'text-amber-accent' : 'text-parchment-600'}`}
          />
        </motion.div>

        {/* Copy */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className={`font-sans text-[14px] font-medium transition-colors duration-200 ${isDragOver ? 'text-amber-accent' : 'text-parchment-400'}`}>
            {isDragOver ? 'Drop to add photos' : 'Drop photos here'}
          </p>
          <p className="font-sans text-[11px] uppercase tracking-[0.1em] text-parchment-600/60">
            JPEG · PNG · WebP
            {remaining < MAX_PHOTOS && ` · ${remaining} remaining`}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files ?? new DataTransfer().files)
            e.target.value = ''
          }}
        />
      </motion.div>

      <AnimatePresence>
        {rejectMessage && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-sans text-[13px] text-error"
          >
            {rejectMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
