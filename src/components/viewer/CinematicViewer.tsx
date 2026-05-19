'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ViewerNav } from '@/components/viewer/ViewerNav'
import { ScrollProgress } from '@/components/viewer/ScrollProgress'
import { ChapterSection } from '@/components/viewer/ChapterSection'
import { LocationEditor } from '@/components/viewer/LocationEditor'
import { AllPhotosSection } from '@/components/viewer/AllPhotosSection'
import type { StoryChapter } from '@/types/database'
import type { ChapterCoord } from '@/components/viewer/ViewerMap'
import type { PhotoForDisplay } from '@/components/trip/TripPhotoGrid'

// Dynamic import — mapbox-gl uses browser APIs; cannot be server-rendered
const ViewerMap = dynamic(
  () => import('@/components/viewer/ViewerMap'),
  { ssr: false }
)

interface CinematicViewerProps {
  chapters: StoryChapter[]
  /** First-photo URL keyed by chapter.id (for backdrop) */
  photoUrlByChapter: Record<string, string>
  /** All photo URLs keyed by chapter.id (for thumbnail strip) */
  allPhotoUrlsByChapter: Record<string, string[]>
  chapterCoords: ChapterCoord[]
  showNav?: boolean
  /** Required for upload drawer and location editing (owner-only) */
  tripId?: string
  userId?: string
  allPhotos?: PhotoForDisplay[]
}

export function CinematicViewer({
  chapters,
  photoUrlByChapter,
  allPhotoUrlsByChapter,
  chapterCoords: initialCoords,
  showNav,
  tripId,
  userId,
  allPhotos = [],
}: CinematicViewerProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | undefined>(undefined)
  const [coords, setCoords] = useState<ChapterCoord[]>(initialCoords)
  const [pinPlacingForChapter, setPinPlacingForChapter] = useState<number | undefined>(undefined)

  const handleChapterInView = useCallback((idx: number) => {
    setActiveChapterIndex(idx)
  }, [])

  const handlePinPlaced = useCallback(
    (chapterIndex: number, lat: number, lng: number) => {
      // Optimistically update coords so the dot appears immediately while user fills the name
      setCoords((prev) => {
        const filtered = prev.filter((c) => c.chapterIndex !== chapterIndex)
        return [...filtered, { chapterIndex, lat, lng }].sort(
          (a, b) => a.chapterIndex - b.chapterIndex
        )
      })
    },
    []
  )

  const handleLocationSaved = useCallback(
    (chapterIndex: number, lat: number, lng: number, label: string) => {
      setCoords((prev) => {
        const filtered = prev.filter((c) => c.chapterIndex !== chapterIndex)
        return [...filtered, { chapterIndex, lat, lng, label }].sort(
          (a, b) => a.chapterIndex - b.chapterIndex
        )
      })
      setPinPlacingForChapter(undefined)
    },
    []
  )

  const isOwnerView = Boolean(tripId && userId)

  return (
    <>
      {showNav !== false && <ViewerNav />}
      <ScrollProgress />

      {/* Story content — offset from fixed map panel on desktop (38vw right sidebar) and mobile (40dvh bottom sheet) */}
      <div className="mr-0 md:mr-[38vw] pb-[40dvh] md:pb-0">
        {chapters.map((chapter, i) => {
          const photoUrl = photoUrlByChapter[chapter.id] ?? ''
          const allUrls = allPhotoUrlsByChapter[chapter.id] ?? []
          return (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              chapterIndex={i}
              photoUrl={photoUrl}
              allPhotoUrls={allUrls}
              onInView={handleChapterInView}
            />
          )
        })}

        {/* All photos + upload section — owner only */}
        {isOwnerView && (
          <AllPhotosSection
            tripId={tripId!}
            userId={userId!}
            photos={allPhotos}
            onPhotosAdded={() => {
              // Parent can listen via a prop if regeneration triggering is needed
            }}
          />
        )}
      </div>

      <ViewerMap
        chapterCoords={coords}
        activeChapterIndex={activeChapterIndex}
        pinPlacingForChapter={pinPlacingForChapter}
        onPinPlaced={handlePinPlaced}
        onCancelPinPlacing={() => setPinPlacingForChapter(undefined)}
      >
        {/* LocationEditor lives inside the map panel so it sits over the map */}
        {isOwnerView && (
          <LocationEditor
            tripId={tripId!}
            chapters={chapters}
            existingCoords={coords}
            onPinPlacingChange={setPinPlacingForChapter}
            onLocationSaved={handleLocationSaved}
          />
        )}
      </ViewerMap>
    </>
  )
}
