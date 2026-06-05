'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ViewerNav } from '@/components/viewer/ViewerNav'
import { ScrollProgress } from '@/components/viewer/ScrollProgress'
import { ChapterSection } from '@/components/viewer/ChapterSection'
import { LocationEditor } from '@/components/viewer/LocationEditor'
import { AllPhotosSection } from '@/components/viewer/AllPhotosSection'
import { DocumentarySection } from '@/components/documentary/DocumentarySection'
import { ShareMapButton } from '@/components/trip/ShareMapButton'
import type { StoryChapter } from '@/types/database'
import type { ChapterCoord } from '@/components/viewer/ViewerMap'
import type { PhotoForDisplay } from '@/components/trip/TripPhotoGrid'

const ViewerMap = dynamic(
  () => import('@/components/viewer/ViewerMap'),
  { ssr: false }
)

interface CinematicViewerProps {
  chapters: StoryChapter[]
  photoUrlByChapter: Record<string, string>
  allPhotoUrlsByChapter: Record<string, string[]>
  chapterCoords: ChapterCoord[]
  showNav?: boolean
  tripId?: string
  userId?: string
  allPhotos?: PhotoForDisplay[]
  tripTitle?: string
  isPublic?: boolean
  existingDocumentaryId?: string | null
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
  tripTitle = '',
  isPublic = false,
  existingDocumentaryId = null,
}: CinematicViewerProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | undefined>(undefined)
  const [coords, setCoords] = useState<ChapterCoord[]>(initialCoords)

  const handleChapterInView = useCallback((idx: number) => {
    setActiveChapterIndex(idx)
  }, [])

  const handleLocationSaved = useCallback(
    (chapterIndex: number, lat: number, lng: number, label: string) => {
      setCoords((prev) => {
        const filtered = prev.filter((c) => c.chapterIndex !== chapterIndex)
        return [...filtered, { chapterIndex, lat, lng, label }].sort(
          (a, b) => a.chapterIndex - b.chapterIndex
        )
      })
    },
    []
  )

  const isOwnerView = Boolean(tripId && userId)

  return (
    <>
      {showNav !== false && <ViewerNav />}
      <ScrollProgress />

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

        {isOwnerView && (
          <AllPhotosSection
            tripId={tripId!}
            userId={userId!}
            photos={allPhotos}
            onPhotosAdded={() => {}}
          />
        )}

        {isOwnerView && (
          <div className="px-6 pb-16 max-w-2xl">
            <DocumentarySection
              tripId={tripId!}
              tripTitle={tripTitle}
              photoCount={allPhotos.length}
              existingDocumentaryId={existingDocumentaryId}
            />
            {isPublic && coords.length > 0 && (
              <div className="mt-4">
                <ShareMapButton tripId={tripId!} />
              </div>
            )}
          </div>
        )}
      </div>

      <ViewerMap
        chapterCoords={coords}
        activeChapterIndex={activeChapterIndex}
      />

      {isOwnerView && (
        <div className={[
          'fixed bottom-[40dvh] left-0 right-0 z-30',
          'md:bottom-0 md:left-auto md:right-0 md:w-[38vw]',
        ].join(' ')}>
          <LocationEditor
            tripId={tripId!}
            chapters={chapters}
            existingCoords={coords}
            onLocationSaved={handleLocationSaved}
          />
        </div>
      )}
    </>
  )
}
