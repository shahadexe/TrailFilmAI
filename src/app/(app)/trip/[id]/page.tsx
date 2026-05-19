import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TripDetailHeader } from '@/components/trip/TripDetailHeader'
import { TripPhotoGrid, type PhotoForDisplay } from '@/components/trip/TripPhotoGrid'
import { StorySection } from '@/components/trip/StorySection'
import { DraftStoryCTA } from '@/components/trip/DraftStoryCTA'
import { GeneratingStoryState } from '@/components/trip/GeneratingStoryState'
import { CinematicViewer } from '@/components/viewer/CinematicViewer'
import type { StoryChapter } from '@/types/database'
import type { ChapterCoord } from '@/components/viewer/ViewerMap'

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

  // D-06: Build chapterCoords from first photo GPS per chapter.
  // Pass only { chapterIndex, lat, lng } tuples — never raw photo GPS in payload.
  let chapterCoords: ChapterCoord[] = []

  if (trip.generation_status === 'completed' && chapters.length > 0) {
    const firstPhotoIds = chapters
      .map((ch) => ch.photo_ids?.[0])
      .filter(Boolean) as string[]

    if (firstPhotoIds.length > 0) {
      const { data: gpsRows } = await supabase
        .from('photos')
        .select('id, latitude, longitude')
        .in('id', firstPhotoIds)

      // Build GPS map — filter out null coordinates
      const gpsMap = new Map(
        (gpsRows ?? [])
          .filter((p) => p.latitude !== null && p.longitude !== null)
          .map((p) => [p.id, { lat: p.latitude!, lng: p.longitude! }])
      )

      // Build chapterCoords — omit chapters whose first photo has no GPS (D-08)
      chapterCoords = chapters
        .map((ch) => {
          const firstId = ch.photo_ids?.[0]
          const gps = firstId ? gpsMap.get(firstId) : undefined
          if (!gps) return null
          return {
            chapterIndex: ch.chapter_index,
            lat: gps.lat,
            lng: gps.lng,
            label: ch.location_name ?? undefined,
          }
        })
        .filter(Boolean) as ChapterCoord[]
    }
  }

  // Build photoUrlByChapter — map chapter.id → public URL of chapter's first photo (backdrop)
  // Also build allPhotoUrlsByChapter — all photo URLs per chapter (for thumbnail strip)
  const photoRowMap = new Map(
    (photoRows ?? []).map((p) => [p.id, p.storage_path])
  )

  const photoUrlByChapter: Record<string, string> = {}
  const allPhotoUrlsByChapter: Record<string, string[]> = {}

  for (const chapter of chapters) {
    const photoIds = chapter.photo_ids ?? []
    const urls: string[] = []

    for (const pid of photoIds) {
      const storagePath = photoRowMap.get(pid)
      if (storagePath) {
        urls.push(
          supabase.storage.from('trip-photos').getPublicUrl(storagePath).data.publicUrl
        )
      }
    }

    if (urls.length > 0) {
      photoUrlByChapter[chapter.id] = urls[0]
      allPhotoUrlsByChapter[chapter.id] = urls
    }
  }

  // Completed trips with chapters → full cinematic viewer (replaces Phase 3 layout)
  if (trip.generation_status === 'completed' && chapters.length > 0) {
    return (
      <CinematicViewer
        chapters={chapters}
        photoUrlByChapter={photoUrlByChapter}
        allPhotoUrlsByChapter={allPhotoUrlsByChapter}
        chapterCoords={chapterCoords}
        tripId={trip.id}
        userId={user.id}
        allPhotos={photos}
      />
    )
  }

  // Draft / generating / failed (and edge case: completed but 0 chapters) → Phase 3 layout unchanged
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
