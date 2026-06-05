import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapShareClient } from './MapShareClient'
import type { RoutePoint } from '@/components/map/SVGRouteOverlay'

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('title, start_date, end_date, is_public')
    .eq('id', params.id)
    .single()

  if (!trip || !trip.is_public) return { title: 'Trailfilm' }

  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('trip_id', params.id)
    .order('order_index', { ascending: true })
    .limit(1)

  const ogImageUrl = photos?.[0]?.storage_path
    ? supabase.storage.from('trip-photos').getPublicUrl(photos[0].storage_path).data.publicUrl
    : undefined

  const description = `See ${trip.title}'s travel route — created with Trailfilm.`

  return {
    title: `${trip.title} — Travel Map | Trailfilm`,
    description,
    openGraph: {
      title: `${trip.title} — Travel Map`,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${trip.title} — Travel Map`,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  }
}

export default async function MapSharePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('id, title, start_date, end_date, is_public')
    .eq('id', params.id)
    .single()

  if (!trip || !trip.is_public) notFound()

  // Fetch GPS from first photo of each chapter
  const { data: chapters } = await supabase
    .from('story_chapters')
    .select('chapter_index, location_name, photo_ids')
    .eq('trip_id', params.id)
    .order('chapter_index', { ascending: true })

  const firstPhotoIds = (chapters ?? [])
    .map((ch) => ch.photo_ids?.[0])
    .filter(Boolean) as string[]

  let routePoints: RoutePoint[] = []

  if (firstPhotoIds.length > 0) {
    const { data: gpsRows } = await supabase
      .from('photos')
      .select('id, latitude, longitude')
      .in('id', firstPhotoIds)

    const gpsMap = new Map(
      (gpsRows ?? [])
        .filter((p) => p.latitude !== null && p.longitude !== null)
        .map((p) => [p.id, { lat: p.latitude!, lng: p.longitude! }])
    )

    routePoints = (chapters ?? [])
      .map((ch) => {
        const firstId = ch.photo_ids?.[0]
        const gps = firstId ? gpsMap.get(firstId) : undefined
        if (!gps) return null
        return {
          lat: gps.lat,
          lng: gps.lng,
          label: ch.location_name ?? undefined,
        }
      })
      .filter(Boolean) as RoutePoint[]
  }

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

  return (
    <MapShareClient
      tripTitle={trip.title}
      startDate={trip.start_date}
      endDate={trip.end_date}
      routePoints={routePoints}
      mapboxToken={mapboxToken}
    />
  )
}
