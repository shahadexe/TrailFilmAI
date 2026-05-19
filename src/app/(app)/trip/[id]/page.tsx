import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripDetailHeader } from '@/components/trip/TripDetailHeader'
import { TripPhotoGrid, type PhotoForDisplay } from '@/components/trip/TripPhotoGrid'
import { StorySection } from '@/components/trip/StorySection'
import { DraftStoryCTA } from '@/components/trip/DraftStoryCTA'
import { GeneratingStoryState } from '@/components/trip/GeneratingStoryState'
import type { StoryChapter } from '@/types/database'

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Defense-in-depth: (app)/layout.tsx already redirects unauthenticated visitors.
  // If user is null for any reason (token expiry, timing), render 404 instead of crashing.
  if (!user) notFound()

  // Two-layer ownership filter: RLS (auth.uid() = user_id) + explicit eq for T-02-19 defense-in-depth.
  // Collapsing wrong-id and wrong-owner into the same notFound() prevents information disclosure.
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!trip) notFound()

  // Photos ordered by order_index (primary), created_at (tie-breaker for retried uploads).
  const { data: photoRows } = await supabase
    .from('photos')
    .select('*')
    .eq('trip_id', params.id)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  // Project to a lean client-facing shape — omits storage_path, latitude, longitude so raw GPS
  // coordinates and internal storage paths are never serialized into the RSC payload.
  const photos: PhotoForDisplay[] = (photoRows ?? []).map((p) => ({
    id: p.id,
    publicUrl: supabase.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl,
    taken_at: p.taken_at,
    hasGps: p.latitude !== null && p.longitude !== null,
  }))

  let chapters: StoryChapter[] = []
  if (trip.generation_status === 'completed') {
    const { data: chapterRows } = await supabase
      .from('story_chapters')
      .select('*')
      .eq('trip_id', params.id)
      .order('chapter_index', { ascending: true })

    chapters = chapterRows ?? []
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <TripDetailHeader trip={trip} />

      {photos.length > 0 ? (
        <>
          <TripPhotoGrid photos={photos} />

          {trip.generation_status === 'completed' && chapters.length > 0 && (
            <StorySection chapters={chapters} />
          )}

          {trip.generation_status === 'generating' && <GeneratingStoryState />}

          {(trip.generation_status === 'draft' || trip.generation_status === 'failed') && (
            <DraftStoryCTA tripId={trip.id} />
          )}
        </>
      ) : (
        <p className="mt-12 font-sans text-base text-parchment-400">No photos yet.</p>
      )}
    </div>
  )
}
