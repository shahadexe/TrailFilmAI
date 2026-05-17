'use client'

import { useCallback } from 'react'
import { compressPhoto } from '@/lib/utils/compress'
import { updateTripCover } from '@/lib/trips/mutations'
import { createClient } from '@/lib/supabase/client'
import type { PhotoItem } from './PhotoUploadGrid'

type ItemUpdater = (updater: (prev: PhotoItem[]) => PhotoItem[]) => void

function extFromMime(mime: string): string {
  return (mime.split('/')[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg')
}

export function useUploadPipeline({
  tripId,
  userId,
  setItems,
}: {
  tripId: string
  userId: string
  setItems: ItemUpdater
}) {
  const supabase = createClient()

  const uploadOne = useCallback(
    async (
      itemId: string,
      file: File,
      exif: PhotoItem['exif'],
      orderIndex: number
    ): Promise<{ photoId: string; storagePath: string } | { error: string }> => {
      // STATE: compressing
      setItems((prev) =>
        prev.map((p) => (p.id === itemId ? { ...p, state: 'compressing', progress: 25 } : p))
      )
      const compressed = await compressPhoto(file)

      // STATE: uploading
      setItems((prev) =>
        prev.map((p) => (p.id === itemId ? { ...p, state: 'uploading', progress: 75 } : p))
      )
      const ext = extFromMime(compressed.type || file.type)
      const storagePath = `${userId}/${tripId}/${crypto.randomUUID()}.${ext}`

      const { data: storageData, error: storageError } = await supabase.storage
        .from('trip-photos')
        .upload(storagePath, compressed, {
          contentType: compressed.type || file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (storageError || !storageData) {
        return { error: storageError?.message ?? 'Storage upload failed' }
      }

      // INSERT row in public.photos
      const { data: row, error: insertError } = await supabase
        .from('photos')
        .insert({
          trip_id: tripId,
          storage_path: storageData.path,
          latitude: exif?.latitude ?? null,
          longitude: exif?.longitude ?? null,
          taken_at: exif?.takenAt ? exif.takenAt.toISOString() : null,
          order_index: orderIndex,
        })
        .select('id')
        .single()

      if (insertError || !row) {
        return { error: insertError?.message ?? 'DB insert failed' }
      }

      return { photoId: row.id, storagePath: storageData.path }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tripId, userId, setItems]
  )

  const uploadBatch = useCallback(
    async (items: PhotoItem[]) => {
      // EXIF is already on each item — extracted by the caller BEFORE handing items to the pipeline
      // (RESEARCH Pitfall 1: browser-image-compression strips EXIF so we must extract first)
      const results = await Promise.allSettled(
        items.map((item, index) => uploadOne(item.id, item.file, item.exif, index))
      )

      let firstSuccessPhotoId: string | null = null

      results.forEach((res, index) => {
        const item = items[index]
        if (res.status === 'fulfilled' && 'photoId' in res.value) {
          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? {
                    ...p,
                    state: 'success',
                    progress: 100,
                    photoRowId: (res.value as { photoId: string; storagePath: string }).photoId,
                    storagePath: (res.value as { photoId: string; storagePath: string })
                      .storagePath,
                  }
                : p
            )
          )
          if (firstSuccessPhotoId === null) {
            firstSuccessPhotoId = (res.value as { photoId: string }).photoId
          }
        } else {
          const message =
            res.status === 'rejected'
              ? String(res.reason)
              : (res.value as { error: string }).error
          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id ? { ...p, state: 'failed_retry', errorMessage: message } : p
            )
          )
        }
      })

      if (firstSuccessPhotoId) {
        try {
          await updateTripCover(supabase, tripId, firstSuccessPhotoId)
        } catch (e) {
          console.error('[useUploadPipeline] updateTripCover failed:', e)
        }
      }
    },
    [uploadOne, setItems, supabase, tripId]
  )

  const retryOne = useCallback(
    async (itemId: string) => {
      let snapshot: PhotoItem | undefined

      setItems((prev) => {
        snapshot = prev.find((p) => p.id === itemId)
        if (!snapshot || snapshot.retryCount >= 1) return prev
        return prev.map((p) =>
          p.id === itemId
            ? { ...p, retryCount: 1, state: 'queued', progress: 0, errorMessage: undefined }
            : p
        )
      })

      // Guard: only retry if retryCount was 0
      if (!snapshot || snapshot.retryCount >= 1) return

      const res = await uploadOne(itemId, snapshot.file, snapshot.exif, 0)

      if ('photoId' in res) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === itemId
              ? { ...p, state: 'success', progress: 100, photoRowId: res.photoId, storagePath: res.storagePath }
              : p
          )
        )
        try {
          await updateTripCover(supabase, tripId, res.photoId)
        } catch (e) {
          console.error('[useUploadPipeline] updateTripCover failed on retry:', e)
        }
      } else {
        setItems((prev) =>
          prev.map((p) =>
            p.id === itemId ? { ...p, state: 'failed_permanent', errorMessage: res.error } : p
          )
        )
      }
    },
    [uploadOne, setItems, supabase, tripId]
  )

  return { uploadBatch, retryOne }
}
