'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ViewerNav } from '@/components/viewer/ViewerNav'
import { ScrollProgress } from '@/components/viewer/ScrollProgress'
import { ChapterSection } from '@/components/viewer/ChapterSection'
import type { StoryChapter } from '@/types/database'
import type { ChapterCoord } from '@/components/viewer/ViewerMap'

// Dynamic import — mapbox-gl uses browser APIs; cannot be server-rendered
const ViewerMap = dynamic(
  () => import('@/components/viewer/ViewerMap'),
  { ssr: false }
)

interface CinematicViewerProps {
  chapters: StoryChapter[]
  photoUrlByChapter: Record<string, string>
  chapterCoords: ChapterCoord[]
}

export function CinematicViewer({
  chapters,
  photoUrlByChapter,
  chapterCoords,
}: CinematicViewerProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | undefined>(undefined)
  const handleChapterInView = useCallback((idx: number) => {
    setActiveChapterIndex(idx)
  }, [])

  return (
    <>
      <ViewerNav />
      <ScrollProgress />

      {/* Story content — offset from fixed map panel on desktop (38vw right sidebar) and mobile (40dvh bottom sheet) */}
      <div className="mr-0 md:mr-[38vw] pb-[40dvh] md:pb-0">
        {chapters.map((chapter, i) => {
          const photoUrl = photoUrlByChapter[chapter.id] ?? ''
          return (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              chapterIndex={i}
              photoUrl={photoUrl}
              onInView={handleChapterInView}
            />
          )
        })}
      </div>

      <ViewerMap
        chapterCoords={chapterCoords}
        activeChapterIndex={activeChapterIndex}
      />
    </>
  )
}
