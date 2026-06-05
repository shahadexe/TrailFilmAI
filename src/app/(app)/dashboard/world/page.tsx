import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import type { TripForGlobe } from '@/components/globe/CountrySlideOver'

const GlobeClient = dynamic(
  () => import('@/components/globe/GlobeClient'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-2 h-2 rounded-full bg-amber-accent mx-auto animate-ping mb-4" />
          <p className="font-sans text-sm text-parchment-600">Loading your world…</p>
        </div>
      </div>
    ),
  }
)

export default async function WorldGlobePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  // Fetch all trips with their cover photos
  const { data: tripRows } = await supabase
    .from('trips')
    .select('id, title, start_date, end_date, iso_country_code, cover_photo_id')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  // Fetch cover photo URLs for trips that have a cover_photo_id
  const coverPhotoIds = (tripRows ?? [])
    .map((t) => t.cover_photo_id)
    .filter(Boolean) as string[]

  const coverUrlMap = new Map<string, string>()

  if (coverPhotoIds.length > 0) {
    const { data: coverPhotos } = await supabase
      .from('photos')
      .select('id, storage_path')
      .in('id', coverPhotoIds)

    for (const photo of coverPhotos ?? []) {
      const url = supabase.storage.from('trip-photos').getPublicUrl(photo.storage_path).data.publicUrl
      coverUrlMap.set(photo.id, url)
    }
  }

  const trips: TripForGlobe[] = (tripRows ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    start_date: t.start_date,
    end_date: t.end_date,
    iso_country_code: t.iso_country_code,
    cover_url: t.cover_photo_id ? coverUrlMap.get(t.cover_photo_id) : undefined,
  }))

  const visitedCount = new Set(trips.map((t) => t.iso_country_code).filter(Boolean)).size

  return (
    <div className="relative w-full h-[100dvh] bg-ink overflow-hidden">
      {/* Grain overlay */}
      <div className="grain-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.025]" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-6 md:px-10 md:pt-8 pointer-events-none">
        <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-parchment-600 mb-1">
          Memory World
        </p>
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-ink-50 tracking-[-0.02em]">
          Your Travel History
        </h1>
        {visitedCount > 0 && (
          <p className="mt-1 font-sans text-sm text-parchment-400">
            {visitedCount} {visitedCount === 1 ? 'country' : 'countries'} explored
          </p>
        )}
      </div>

      {/* Globe — fills entire viewport */}
      <GlobeClient trips={trips} />
    </div>
  )
}
