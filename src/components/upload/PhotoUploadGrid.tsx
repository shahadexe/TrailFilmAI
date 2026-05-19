'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react'
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
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={enter}
          className="group relative aspect-square overflow-hidden rounded-xl bg-ink-700"
        >
          {/* Preview — blob: URLs not supported by next/image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.previewUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Compressing pulse border */}
          {item.state === 'compressing' && (
            <div className="absolute inset-0 animate-pulse rounded-xl ring-1 ring-inset ring-amber-accent/30" aria-label="Compressing" />
          )}

          {/* Uploading overlay + ring */}
          {item.state === 'uploading' && (
            <>
              <div className="absolute inset-0 bg-ink/60 backdrop-blur-[1px]" aria-hidden />
              <PhotoProgressRing progress={item.progress} filename={item.file.name} />
            </>
          )}

          {/* Success badge */}
          {item.state === 'success' && (
            <div className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 p-0.5" aria-label="Upload complete">
              <CheckCircle2 aria-hidden className="h-4 w-4 text-success" />
            </div>
          )}

          {/* Failed overlays */}
          {item.state === 'failed_retry' && (
            <div className="absolute inset-0 flex items-center justify-center bg-error/20" aria-label="Upload failed, tap to retry">
              <AlertCircle aria-hidden className="h-5 w-5 text-error" />
            </div>
          )}
          {item.state === 'failed_permanent' && (
            <div className="absolute inset-0 flex items-center justify-center bg-error/20" aria-label="Upload failed permanently">
              <XCircle aria-hidden className="h-5 w-5 text-error" />
            </div>
          )}

          {/* Queued: remove button on hover */}
          {item.state === 'queued' && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.file.name}`}
              className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-parchment-400 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:text-ink-50 focus-visible:opacity-100 focus-visible:outline-none"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Action strip for failed states */}
          {(item.state === 'failed_retry' || item.state === 'failed_permanent') && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-ink/85 py-1.5 backdrop-blur-sm">
              {item.state === 'failed_retry' ? (
                <button
                  type="button"
                  onClick={() => onRetry(item.id)}
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-amber-accent min-h-[32px] inline-flex items-center px-2 hover:text-amber-bright"
                >
                  Retry
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-parchment-400 min-h-[32px] inline-flex items-center px-2 hover:text-parchment-200"
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
