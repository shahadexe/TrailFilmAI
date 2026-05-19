'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronUp, Plus, X, Loader2, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { extractExif } from '@/lib/utils/exif'
import { useUploadPipeline } from '@/components/upload/useUploadPipeline'
import { PhotoDropzone } from '@/components/upload/PhotoDropzone'
import { PhotoUploadGrid, type PhotoItem, type PhotoUploadState } from '@/components/upload/PhotoUploadGrid'
import type { PhotoForDisplay } from '@/components/trip/TripPhotoGrid'

interface AllPhotosSectionProps {
  tripId: string
  userId: string
  photos: PhotoForDisplay[]
  /** Called when new photos are successfully uploaded so the page can trigger story regeneration */
  onPhotosAdded: (count: number) => void
}

export function AllPhotosSection({
  tripId,
  userId,
  photos,
  onPhotosAdded,
}: AllPhotosSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showUploadDrawer, setShowUploadDrawer] = useState(false)
  const [items, setItems] = useState<PhotoItem[]>([])
  const [batchStarted, setBatchStarted] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const shouldReduce = useReducedMotion()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const { uploadBatch, retryOne } = useUploadPipeline({ tripId, userId, setItems })

  const onFilesAccepted = useCallback(async (files: File[]) => {
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

    await Promise.all(
      additions.map(async (item) => {
        const exif = await extractExif(item.file)
        if (!mountedRef.current) return
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, exif } : p)))
      })
    )
  }, [])

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

  useEffect(() => {
    return () => {
      setItems((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.previewUrl))
        return prev
      })
    }
  }, [])

  const activeCount = items.filter(
    (p) => p.state === 'queued' || p.state === 'compressing' || p.state === 'uploading'
  ).length
  const successCount = items.filter((p) => p.state === 'success').length
  const allTerminal =
    items.length > 0 &&
    activeCount === 0 &&
    items.every((p) => p.state === 'success' || p.state === 'failed_permanent')
  const ctaEnabled = !batchStarted && items.length > 0 && items.every((p) => p.exif !== null)

  useEffect(() => {
    if (!batchStarted || !allTerminal || successCount === 0 || uploadDone) return
    setUploadDone(true)
    onPhotosAdded(successCount)
  }, [batchStarted, allTerminal, successCount, uploadDone, onPhotosAdded])

  const handleBegin = useCallback(async () => {
    if (batchStarted) return
    setBatchStarted(true)
    try {
      await uploadBatch(items)
    } catch (err) {
      console.error('[AllPhotosSection] uploadBatch error:', err)
      setBatchStarted(false)
    }
  }, [batchStarted, items, uploadBatch])

  const handleCloseDrawer = useCallback(() => {
    if (batchStarted && activeCount > 0) return // don't close mid-upload
    setShowUploadDrawer(false)
    setItems([])
    setBatchStarted(false)
    setUploadDone(false)
  }, [batchStarted, activeCount])

  const totalPhotos = photos.length
  const buttonLabel = isExpanded
    ? `Hide all photos`
    : `Show all ${totalPhotos} photos`

  return (
    <div className="border-t border-white/06 bg-ink">
      {/* Toggle bar */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-8 py-5 md:px-16 text-left hover:bg-white/02 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="font-sans text-[13px] font-medium text-parchment-400">
          {buttonLabel}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-parchment-600 flex-shrink-0" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-parchment-600 flex-shrink-0" aria-hidden />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="all-photos"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              shouldReduce
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            }
            className="overflow-hidden"
          >
            <div className="px-8 pb-10 md:px-16">
              {/* Photo grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-lg bg-ink-700"
                  >
                    <Image
                      src={photo.publicUrl}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>

              {/* Add photos button */}
              <button
                type="button"
                onClick={() => setShowUploadDrawer(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/04 px-4 py-2.5 font-sans text-[13px] font-medium text-parchment-300 hover:border-amber-accent/40 hover:text-amber-accent transition-colors"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add more photos
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload drawer */}
      <AnimatePresence>
        {showUploadDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
              onClick={handleCloseDrawer}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={
                shouldReduce
                  ? { duration: 0 }
                  : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className="fixed bottom-0 inset-x-0 z-50 rounded-t-2xl bg-ink border-t border-white/08 px-6 pt-4 pb-8 max-h-[80dvh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg font-medium text-ink-50">Add photos</h3>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-md text-parchment-400 hover:bg-white/06 hover:text-ink-50 transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {/* Dropzone / grid */}
              {items.length === 0 ? (
                <PhotoDropzone existingCount={photos.length} onFilesAccepted={onFilesAccepted} />
              ) : (
                <>
                  <PhotoUploadGrid items={items} onRetry={onRetry} onRemove={onRemove} />
                  {!batchStarted && items.length + photos.length < 12 && (
                    <div className="mt-3">
                      <PhotoDropzone
                        existingCount={photos.length + items.length}
                        onFilesAccepted={onFilesAccepted}
                        disabled={batchStarted}
                      />
                    </div>
                  )}
                </>
              )}

              {batchStarted && activeCount > 0 && (
                <p role="status" aria-live="polite" className="mt-3 font-sans text-[13px] text-amber-accent">
                  Uploading {activeCount} of {items.length}…
                </p>
              )}

              {allTerminal && successCount > 0 && (
                <div className="mt-4 rounded-lg bg-amber-accent/10 border border-amber-accent/25 px-4 py-3 flex items-start gap-3">
                  <RefreshCw className="h-4 w-4 text-amber-accent mt-0.5 flex-shrink-0" aria-hidden />
                  <div>
                    <p className="font-sans text-[13px] font-medium text-amber-accent">
                      {successCount} photo{successCount > 1 ? 's' : ''} added
                    </p>
                    <p className="font-sans text-[12px] text-parchment-400 mt-0.5">
                      Regenerate your story to include the new photos.
                    </p>
                  </div>
                </div>
              )}

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleBegin}
                  disabled={!ctaEnabled || batchStarted}
                  className="mt-5 w-full min-h-[46px] rounded-xl bg-amber-accent px-8 py-3 font-sans text-sm font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFC881] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {batchStarted && activeCount > 0 ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" aria-label="Uploading" />
                  ) : (
                    'Upload photos'
                  )}
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
