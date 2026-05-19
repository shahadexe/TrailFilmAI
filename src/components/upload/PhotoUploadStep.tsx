'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PhotoDropzone } from './PhotoDropzone'
import { PhotoUploadGrid, type PhotoItem, type PhotoUploadState } from './PhotoUploadGrid'
import { extractExif } from '@/lib/utils/exif'
import { useUploadPipeline } from './useUploadPipeline'
import { useTripCreationStore } from '@/stores/trip-creation'

export interface PhotoUploadStepProps {
  tripId: string
  userId: string
}

export function PhotoUploadStep({ tripId, userId }: PhotoUploadStepProps) {
  const [items, setItems] = useState<PhotoItem[]>([])
  const [batchStarted, setBatchStarted] = useState(false)
  const setStep = useTripCreationStore((s) => s.setStep)

  const shouldReduce = useReducedMotion()
  const easing = [0.22, 1, 0.36, 1] as const
  const t = (d: number, delay = 0) =>
    shouldReduce ? { duration: 0 } : { duration: d, delay, ease: easing }

  const { uploadBatch, retryOne } = useUploadPipeline({ tripId, userId, setItems })

  // WR-02: Guard against stale setItems calls after unmount during EXIF extraction
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Accept new files: create preview URLs, add to state, then extract EXIF in background
  // IMPORTANT: extractExif must run on the ORIGINAL file BEFORE compression (RESEARCH Pitfall 1)
  const onFilesAccepted = useCallback(
    async (files: File[]) => {
      const additions: PhotoItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        exif: null,
        state: 'queued' as PhotoUploadState,
        progress: 0,
        retryCount: 0 as 0 | 1,
      }))
      setItems((prev) => [...prev, ...additions])

      // Extract EXIF in background — do NOT compress here; pipeline compresses after extraction
      await Promise.all(
        additions.map(async (item) => {
          const exif = await extractExif(item.file)
          if (!mountedRef.current) return
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, exif } : p)))
        })
      )
    },
    []
  )

  const onRemove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  const onRetry = useCallback(
    (id: string) => { retryOne(id, items) },
    [retryOne, items]
  )

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      setItems((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.previewUrl))
        return prev
      })
    }
  }, [])

  // Derived state
  const activeCount = items.filter(
    (p) => p.state === 'queued' || p.state === 'compressing' || p.state === 'uploading'
  ).length
  const successCount = items.filter((p) => p.state === 'success').length
  const permanentFailCount = items.filter((p) => p.state === 'failed_permanent').length
  const allTerminal =
    items.length > 0 &&
    activeCount === 0 &&
    items.every((p) => p.state === 'success' || p.state === 'failed_permanent')

  // CTA enabled: before batch starts — need at least 1 photo with EXIF resolved
  const ctaEnabled = !batchStarted && items.length > 0 && items.every((p) => p.exif !== null)

  const onBegin = useCallback(async () => {
    if (batchStarted) return
    setBatchStarted(true)
    try {
      await uploadBatch(items)
    } catch (err) {
      console.error('[PhotoUploadStep] uploadBatch fatal:', err)
      toast.error('Upload interrupted. Check your connection.')
      setBatchStarted(false)
    }
  }, [batchStarted, items, uploadBatch])

  // Advance to tone selection once the upload batch finishes with at least one saved photo.
  useEffect(() => {
    if (!batchStarted) return
    if (!allTerminal) return
    if (successCount === 0) return
    const timeoutId = setTimeout(() => setStep(3), 350)
    return () => clearTimeout(timeoutId)
  }, [batchStarted, allTerminal, successCount, setStep])

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col gap-2">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8)}
          className="font-serif text-[28px] font-medium leading-[1.15] tracking-[-0.01em] text-ink-50 md:text-[36px]"
        >
          Add your photos.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={t(0.8, 0.12)}
          className="font-sans text-[14px] text-parchment-400 leading-relaxed"
        >
          Drop up to 12 photos. We&apos;ll handle the rest.
        </motion.p>
      </div>

      {/* Dropzone or grid */}
      {items.length === 0 ? (
        <PhotoDropzone existingCount={0} onFilesAccepted={onFilesAccepted} />
      ) : (
        <>
          <PhotoUploadGrid items={items} onRetry={onRetry} onRemove={onRemove} />
          {!batchStarted && items.length < 12 && (
            <PhotoDropzone
              existingCount={items.length}
              onFilesAccepted={onFilesAccepted}
              disabled={batchStarted}
            />
          )}
        </>
      )}

      {/* Live upload counter (D-10) */}
      {batchStarted && activeCount > 0 && (
        <p role="status" aria-live="polite" className="font-sans text-[13px] font-medium text-amber-accent">
          Uploading {activeCount} of {items.length}&hellip;
        </p>
      )}

      {/* Partial failure note (D-11) */}
      {batchStarted && allTerminal && permanentFailCount > 0 && (
        <p role="status" className="font-sans text-[13px] text-parchment-400">
          {permanentFailCount} photo{permanentFailCount > 1 ? 's' : ''} failed. Successful photos are saved.
        </p>
      )}

      {/* Begin CTA */}
      <button
        type="button"
        onClick={onBegin}
        disabled={!ctaEnabled || batchStarted}
        aria-disabled={!ctaEnabled || batchStarted}
        aria-busy={batchStarted && activeCount > 0}
        className="w-full min-h-[46px] rounded-xl bg-amber-accent px-8 py-3 font-sans text-sm font-medium text-ink transition-all duration-300 ease-trailfilm hover:-translate-y-0.5 hover:bg-[#FFC881] hover:shadow-[0_8px_24px_-6px_rgba(229,166,99,0.4)] active:scale-[0.98] active:translate-y-0 active:bg-[#B07F40] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {batchStarted && activeCount > 0 ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" aria-label="Uploading" />
        ) : (
          'Begin the story.'
        )}
      </button>
    </div>
  )
}
