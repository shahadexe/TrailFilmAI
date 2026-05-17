'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { PhotoProgressRing } from './PhotoProgressRing'

export type PhotoUploadState =
  | 'queued'
  | 'compressing'
  | 'uploading'
  | 'success'
  | 'failed_retry'
  | 'failed_permanent'

export interface PhotoItem {
  id: string
  file: File
  previewUrl: string
  exif: { takenAt: Date | null; latitude: number | null; longitude: number | null } | null
  state: PhotoUploadState
  progress: number
  retryCount: 0 | 1
  storagePath?: string
  photoRowId?: string
  errorMessage?: string
}

export interface PhotoUploadGridProps {
  items: PhotoItem[]
  onRetry: (id: string) => void
  onRemove: (id: string) => void
}

export function PhotoUploadGrid({ items, onRetry, onRemove }: PhotoUploadGridProps) {
  const shouldReduce = useReducedMotion()
  const enter = shouldReduce
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={enter}
          className="relative aspect-square overflow-hidden rounded-md bg-ink-700"
        >
          {/* Preview thumbnail — raw img because blob: URLs are not supported by next/image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.previewUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* State overlays */}
          {item.state === 'compressing' && (
            <div
              className="absolute inset-0 animate-pulse border border-ink-500"
              aria-label="Compressing"
            />
          )}

          {item.state === 'uploading' && (
            <>
              <div className="absolute inset-0 bg-ink/50" aria-hidden="true" />
              <PhotoProgressRing progress={item.progress} filename={item.file.name} />
            </>
          )}

          {item.state === 'success' && (
            <div
              className="absolute top-1 right-1 grid place-items-center rounded-full bg-ink/70"
              aria-label="Upload complete"
            >
              <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success" />
            </div>
          )}

          {item.state === 'failed_retry' && (
            <div
              className="absolute inset-0 bg-error/20 flex items-center justify-center"
              aria-label="Upload failed"
            >
              <AlertCircle aria-hidden="true" className="h-5 w-5 text-error" />
            </div>
          )}

          {item.state === 'failed_permanent' && (
            <div
              className="absolute inset-0 bg-error/20 flex items-center justify-center"
              aria-label="Upload failed permanently"
            >
              <XCircle aria-hidden="true" className="h-5 w-5 text-error" />
            </div>
          )}

          {/* Action strip — Retry / Remove */}
          {(item.state === 'failed_retry' || item.state === 'failed_permanent') && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-ink/80 py-1">
              {item.state === 'failed_retry' ? (
                <button
                  type="button"
                  onClick={() => onRetry(item.id)}
                  className="font-sans text-xs font-medium uppercase tracking-[0.05em] text-amber-accent min-h-[44px] inline-flex items-center px-2"
                >
                  Retry
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="font-sans text-xs font-medium uppercase tracking-[0.05em] text-parchment-400 min-h-[44px] inline-flex items-center px-2"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
