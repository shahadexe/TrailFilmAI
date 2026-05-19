import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CinematicViewer } from '@/components/viewer/CinematicViewer'
import { TrailfilmWatermark } from '@/components/viewer/TrailfilmWatermark'
import { ArchiveCTA } from '@/components/viewer/ArchiveCTA'
import type { StoryChapter } from '@/types/database'
import type { ChapterCoord } from '@/components/viewer/ViewerMap'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('title, is_public')
    .eq('id', params.id)
    .single()

  if (!trip || !trip.is_public) {
    return { title: 'Trailfilm' }
  }

  // Fetch first chapter narrative for og:description
  // story_chapters uses chapter_index (NOT order_index) for ordering
  const { data: chapters } = await supabase
    .from('story_chapters')
    .select('narrative')
    .eq('trip_id', params.id)
    .order('chapter_index', { ascending: true })
    .limit(1)

  // Fetch cover photo for og:image
  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('trip_id', params.id)
    .order('order_index', { ascending: true })
    .limit(1)

  // og:description: first ~150 chars of chapter 1 narrative, trimmed at word boundary
  const rawNarrative = chapters?.[0]?.narrative ?? ''
  const description =
    rawNarrative.length > 150
      ? rawNarrative.slice(0, 150).replace(/\s\S+$/, '') + '…'
      : rawNarrative

  // og:image: Supabase Storage public URL of first photo
  const ogImageUrl = photos?.[0]?.storage_path
    ? supabase.storage.from('trip-photos').getPublicUrl(photos[0].storage_path).data.publicUrl
    : undefined

  return {
    title: `${trip.title} | Trailfilm`,
    description,
    openGraph: {
      title: `${trip.title} | Trailfilm`,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${trip.title} | Trailfilm`,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  }
}

export default async function PublicViewerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.id)
    .single()

  // D-03: redirect (not notFound) to avoid leaking trip existence.
  // Same response for both "not found" and "not public" — prevents information disclosure.
  if (!trip || !trip.is_public) {
    redirect('/login?message=private')
  }

  // Photos ordered by order_index ASC (same as authenticated viewer)
  const { data: photoRows } = await supabase
    .from('photos')
    .select('*')
    .eq('trip_id', params.id)
    .order('order_index', { ascending: true })

  // Chapters ordered by chapter_index ASC (story_chapters uses chapter_index, NOT order_index)
  const { data: chapterRows } = await supabase
    .from('story_chapters')
    .select('*')
    .eq('trip_id', params.id)
    .order('chapter_index', { ascending: true })

  const chapters: StoryChapter[] = chapterRows ?? []

  // Build chapterCoords from first photo GPS per chapter.
  // Pass only { chapterIndex, lat, lng } tuples.
  let chapterCoords: ChapterCoord[] = []

  if (chapters.length > 0) {
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

  // Build photoUrlByChapter and allPhotoUrlsByChapter
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

  return (
    <main className="relative bg-ink">
      <TrailfilmWatermark />
      <CinematicViewer
        chapters={chapters}
        photoUrlByChapter={photoUrlByChapter}
        allPhotoUrlsByChapter={allPhotoUrlsByChapter}
        chapterCoords={chapterCoords}
        showNav={false}
      />
      <ArchiveCTA />
    </main>
  )
}
