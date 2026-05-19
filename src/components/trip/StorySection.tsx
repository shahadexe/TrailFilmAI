'use client'

import type { StoryChapter } from '@/types/database'
import { StoryChapterBlock } from './StoryChapterBlock'

export function StorySection({ chapters }: { chapters: StoryChapter[] }) {
  if (chapters.length === 0) return null

  const sorted = [...chapters].sort((a, b) => a.chapter_index - b.chapter_index)

  return (
    <section className="mt-12">
      <p className="mb-2 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-parchment-600">
        YOUR STORY
      </p>
      <div
        aria-hidden="true"
        className="mb-8 h-px w-full opacity-80"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(229,166,99,0.35), transparent)' }}
      />
      <div className="flex flex-col gap-10">
        {sorted.map((chapter, index) => (
          <StoryChapterBlock key={chapter.id} chapter={chapter} index={index} />
        ))}
      </div>
    </section>
  )
}
