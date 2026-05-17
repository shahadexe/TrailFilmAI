'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Upload } from 'lucide-react'

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

  // Auto-dismiss reject message after 4 seconds
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

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label="Add photos — drop here or press to open file picker"
        className={[
          'flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-md bg-ink-800 cursor-pointer transition-colors duration-150 ease-trailfilm',
          isDragOver
            ? 'border-2 border-solid border-amber-accent bg-[rgba(229,166,99,0.06)]'
            : 'border-2 border-dashed border-ink-500',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
        ]
          .filter(Boolean)
          .join(' ')}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
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
        <Upload className="h-8 w-8 text-parchment-400" aria-hidden="true" />
        <p className="font-sans text-sm font-medium text-parchment-400">Drop photos here</p>
        <p className="font-sans text-xs font-medium uppercase tracking-[0.05em] text-parchment-600">
          JPEG · PNG · WebP · up to 12 files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files ?? new DataTransfer().files)
            e.target.value = '' // allow re-selecting same file
          }}
        />
      </div>
      {rejectMessage && (
        <p role="alert" className="font-sans text-sm text-error">
          {rejectMessage}
        </p>
      )}
    </div>
  )
}
