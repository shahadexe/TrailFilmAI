'use client'

import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export function DraftStoryCTA({ tripId }: { tripId: string }) {
  const router = useRouter()

  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={() => router.push(`/new?tripId=${tripId}&resume=3`)}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[rgba(255,255,255,0.08)] bg-transparent px-6 py-3 font-sans text-sm font-medium text-ink-50 transition-[border-color,background-color,color,box-shadow] duration-300 ease-trailfilm hover:border-amber-accent/40 hover:bg-[rgba(229,166,99,0.08)] hover:text-amber-accent hover:shadow-[0_0_16px_-4px_rgba(229,166,99,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Generate your story
      </button>
    </div>
  )
}
